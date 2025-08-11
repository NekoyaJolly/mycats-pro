import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

export interface LoginAttemptData {
  email: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  reason?: string;
}

@Injectable()
export class LoginAttemptServiceImproved {
  private readonly logger = new Logger(LoginAttemptServiceImproved.name);
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
   * 型安全なPrismaクエリビルダを使用
   */
  async recordLoginAttempt(data: LoginAttemptData): Promise<void> {
    try {
      // ユーザーを検索（存在する場合のみユーザーIDを設定）
      const user = await this.prisma.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      });

      // ログイン試行を記録（型安全なcreateを使用）
      await this.prisma.loginAttempt.create({
        data: {
          userId: user?.id,
          email: data.email,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          success: data.success,
          reason: data.reason,
        },
      });

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
   * 型安全なfindUniqueを使用
   */
  async isAccountLocked(email: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          failedLoginAttempts: true,
          lockedUntil: true,
        },
      });

      if (!user) {
        return false; // ユーザーが存在しない場合はロックされていない
      }

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
   * 型安全なfindUniqueを使用
   */
  async getLockoutRemainingMinutes(email: string): Promise<number> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { lockedUntil: true },
      });

      if (!user || !user.lockedUntil) {
        return 0;
      }

      const now = new Date();
      const lockoutEnd = user.lockedUntil;

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
   * 型安全なupdateを使用
   */
  private async updateFailedLoginCount(
    userId: string,
    email: string,
  ): Promise<void> {
    try {
      // 現在の失敗試行回数を取得
      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { failedLoginAttempts: true },
      });

      if (!currentUser) return;

      const newFailedAttempts = currentUser.failedLoginAttempts + 1;
      const shouldLock = newFailedAttempts >= this.maxAttempts;

      if (shouldLock) {
        const lockoutEnd = new Date();
        lockoutEnd.setMinutes(
          lockoutEnd.getMinutes() + this.lockoutDurationMinutes,
        );

        // 型安全なupdateでロック情報を設定
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            failedLoginAttempts: newFailedAttempts,
            lockedUntil: lockoutEnd,
          },
        });

        this.logger.warn(
          `Account locked: ${email} - ${newFailedAttempts} failed attempts. Locked until: ${lockoutEnd.toISOString()}`,
        );
      } else {
        // 型安全なupdateで失敗回数のみ更新
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            failedLoginAttempts: newFailedAttempts,
          },
        });
      }
    } catch (error) {
      this.logger.error("Failed to update failed login count:", error);
    }
  }

  /**
   * 失敗ログインカウントをリセット
   * 型安全なupdateを使用
   */
  private async resetFailedLoginCount(userId: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error("Failed to reset failed login count:", error);
    }
  }

  /**
   * ログイン試行履歴を取得（管理者用）
   * 型安全なfindManyとincludeを使用
   */
  async getLoginAttemptHistory(
    email?: string,
    limit: number = 50,
  ): Promise<Array<{
    id: string;
    userId?: string | null;
    email: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    success: boolean;
    reason?: string | null;
    createdAt: Date;
    user?: {
      id: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
    } | null;
  }>> {
    try {
      const whereClause: Prisma.LoginAttemptWhereInput = email
        ? { email }
        : {};

      const loginAttempts = await this.prisma.loginAttempt.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      return loginAttempts;
    } catch (error) {
      this.logger.error("Failed to get login attempt history:", error);
      return [];
    }
  }

  /**
   * 古いログイン試行記録を削除（定期実行用）
   * 型安全なdeleteを使用
   */
  async cleanupOldLoginAttempts(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const deleteResult = await this.prisma.loginAttempt.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      this.logger.log(
        `Cleaned up ${deleteResult.count} old login attempt records (older than ${daysToKeep} days)`,
      );
      return deleteResult.count;
    } catch (error) {
      this.logger.error("Failed to cleanup old login attempts:", error);
      return 0;
    }
  }

  /**
   * 特定期間の失敗ログイン統計を取得
   * 型安全なgroupByを使用した例
   */
  async getFailedLoginStats(
    startDate: Date,
    endDate: Date,
  ): Promise<Array<{
    email: string;
    failedCount: number;
    lastAttempt: Date;
  }>> {
    try {
      const failedAttempts = await this.prisma.loginAttempt.groupBy({
        by: ["email"],
        where: {
          success: false,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        _count: {
          id: true,
        },
        _max: {
          createdAt: true,
        },
      });

      return failedAttempts.map((attempt) => ({
        email: attempt.email,
        failedCount: attempt._count.id,
        lastAttempt: attempt._max.createdAt!,
      }));
    } catch (error) {
      this.logger.error("Failed to get failed login stats:", error);
      return [];
    }
  }
}
