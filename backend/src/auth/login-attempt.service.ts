import { randomUUID } from "crypto";

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { PrismaService } from "../prisma/prisma.service";

export interface LoginAttemptData {
  email: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  reason?: string;
}

@Injectable()
export class LoginAttemptService {
  private readonly logger = new Logger(LoginAttemptService.name);
  private readonly maxAttempts: number;
  private readonly lockoutDurationMinutes: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.maxAttempts = this.configService.get<number>("MAX_LOGIN_ATTEMPTS", 5);
    this.lockoutDurationMinutes = this.configService.get<number>(
      "LOGIN_LOCKOUT_DURATION_MINUTES",
      15,
    );

    this.logger.log(
      `LoginAttemptService initialized - Max attempts: ${this.maxAttempts}, Lockout: ${this.lockoutDurationMinutes}min`,
    );
  }

  /**
   * ログイン試行を記録
   */
  async recordLoginAttempt(data: LoginAttemptData): Promise<void> {
    try {
      // ユーザーを検索（存在する場合のみユーザーIDを設定）
      const user = await this.prisma.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      });

      // ログイン試行を記録（rawクエリ使用）
      const id = randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO "login_attempts" ("id", "userId", "email", "ipAddress", "userAgent", "success", "reason", "createdAt")
        VALUES (${id}, ${user?.id}, ${data.email}, ${data.ipAddress}, ${data.userAgent}, ${data.success}, ${data.reason}, NOW())
      `;

      // 失敗の場合、ユーザーの失敗カウントを更新
      if (!data.success && user) {
        await this.updateFailedLoginCount(user.id, data.email);
      }

      // 成功の場合、ユーザーの失敗カウントをリセット
      if (data.success && user) {
        await this.resetFailedLoginCount(user.id);
      }

      this.logger.debug(
        `Login attempt recorded: ${data.email} - ${data.success ? "SUCCESS" : "FAILED"}`,
      );
    } catch (error) {
      this.logger.error("Failed to record login attempt:", error);
      // ログイン試行の記録失敗はログイン処理を妨げない
    }
  }

  /**
   * アカウントがロックされているかチェック
   */
  async isAccountLocked(email: string): Promise<boolean> {
    try {
      const result = await this.prisma.$queryRaw<Array<{
        id: string;
        failedLoginAttempts: number;
        lockedUntil: Date | null;
      }>>`
        SELECT "id", "failedLoginAttempts", "lockedUntil"
        FROM "users"
        WHERE "email" = ${email}
      `;

      if (!result || result.length === 0) {
        return false; // ユーザーが存在しない場合はロックされていない
      }

      const user = result[0];

      // ロック期限が設定されており、まだ有効な場合
  if (user.lockedUntil && user.lockedUntil > new Date()) {
        return true;
      }

      // ロック期限が過ぎている場合、ロックを解除
      if (user.lockedUntil && user.lockedUntil <= new Date()) {
        await this.resetFailedLoginCount(user.id);
        return false;
      }

      // 最大試行回数に達している場合
  return user.failedLoginAttempts >= this.maxAttempts;
    } catch (error) {
      this.logger.error("Failed to check account lock status:", error);
      return false; // エラーの場合はロックされていないとみなす
    }
  }

  /**
   * ロック解除までの残り時間（分）を取得
   */
  async getLockoutRemainingMinutes(email: string): Promise<number> {
    try {
      const result = await this.prisma.$queryRaw<Array<{
        lockedUntil: Date | null;
      }>>`
        SELECT "lockedUntil"
        FROM "users"
        WHERE "email" = ${email}
      `;

  if (!result || result.length === 0 || !result[0].lockedUntil) {
        return 0;
      }

      const now = new Date();
  const lockoutEnd = result[0].lockedUntil;

      if (lockoutEnd <= now) {
        return 0;
      }

      return Math.ceil((lockoutEnd.getTime() - now.getTime()) / (1000 * 60));
    } catch (error) {
      this.logger.error("Failed to get lockout remaining time:", error);
      return 0;
    }
  }

  /**
   * 失敗ログインカウントを更新
   */
  private async updateFailedLoginCount(
    userId: string,
    email: string,
  ): Promise<void> {
    try {
      const result = await this.prisma.$queryRaw<Array<{
        failedLoginAttempts: number;
      }>>`
        SELECT "failedLoginAttempts"
        FROM "users"
        WHERE "id" = ${userId}
      `;

      if (!result || result.length === 0) return;

  const newFailedAttempts = (result[0].failedLoginAttempts || 0) + 1;
      const shouldLock = newFailedAttempts >= this.maxAttempts;

      if (shouldLock) {
        const lockoutEnd = new Date();
        lockoutEnd.setMinutes(
          lockoutEnd.getMinutes() + this.lockoutDurationMinutes,
        );

        await this.prisma.$executeRaw`
          UPDATE "users"
          SET "failedLoginAttempts" = ${newFailedAttempts}, "lockedUntil" = ${lockoutEnd}
          WHERE "id" = ${userId}
        `;

        this.logger.warn(
          `Account locked: ${email} - ${newFailedAttempts} failed attempts. Locked until: ${lockoutEnd.toISOString()}`,
        );
      } else {
        await this.prisma.$executeRaw`
          UPDATE "users"
          SET "failedLoginAttempts" = ${newFailedAttempts}
          WHERE "id" = ${userId}
        `;
      }
    } catch (error) {
      this.logger.error("Failed to update failed login count:", error);
    }
  }

  /**
   * 失敗ログインカウントをリセット
   */
  private async resetFailedLoginCount(userId: string): Promise<void> {
    try {
      await this.prisma.$executeRaw`
        UPDATE "users"
        SET "failedLoginAttempts" = 0, "lockedUntil" = NULL, "lastLoginAt" = NOW()
        WHERE "id" = ${userId}
      `;
    } catch (error) {
      this.logger.error("Failed to reset failed login count:", error);
    }
  }

  /**
   * ログイン試行履歴を取得（管理者用）
   */
  async getLoginAttemptHistory(
    email?: string,
    limit: number = 50,
  ): Promise<Array<{
    id: string;
    userId?: string;
    email: string;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    reason?: string;
    createdAt: Date;
    user_id?: string;
    user_email?: string;
    firstName?: string;
    lastName?: string;
  }>> {
    try {
      if (email) {
        return await this.prisma.$queryRaw`
          SELECT la.*, u.id as user_id, u.email as user_email, u."firstName", u."lastName"
          FROM "login_attempts" la
          LEFT JOIN "users" u ON la."userId" = u."id"
          WHERE la."email" = ${email}
          ORDER BY la."createdAt" DESC
          LIMIT ${limit}
        `;
      } else {
        return await this.prisma.$queryRaw`
          SELECT la.*, u.id as user_id, u.email as user_email, u."firstName", u."lastName"
          FROM "login_attempts" la
          LEFT JOIN "users" u ON la."userId" = u."id"
          ORDER BY la."createdAt" DESC
          LIMIT ${limit}
        `;
      }
    } catch (error) {
      this.logger.error("Failed to get login attempt history:", error);
      return [];
    }
  }

  /**
   * 古いログイン試行記録を削除（定期実行用）
   */
  async cleanupOldLoginAttempts(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const _result = await this.prisma.$executeRaw`
        DELETE FROM "login_attempts"
        WHERE "createdAt" < ${cutoffDate}
      `;

      this.logger.log(
        `Cleaned up old login attempt records (older than ${daysToKeep} days)`,
      );
      return 0; // rawクエリでは正確な削除数を取得できないため0を返す
    } catch (error) {
      this.logger.error("Failed to cleanup old login attempts:", error);
      return 0;
    }
  }
}
