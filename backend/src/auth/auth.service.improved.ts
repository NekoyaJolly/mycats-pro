import { randomUUID } from "crypto";

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@prisma/client";
import * as bcrypt from "bcryptjs";

import { PrismaService } from "../prisma/prisma.service";

import { LoginAttemptServiceImproved } from "./login-attempt.service.improved";
import { LoginAttemptData } from "./login-attempt.service.improved";
import { PasswordService } from "./password.service";

@Injectable()
export class AuthServiceImproved {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
    private readonly loginAttemptService: LoginAttemptServiceImproved,
  ) {}

  /**
   * ユーザー認証
   * 型安全なfindUniqueを使用
   */
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
        failedLoginAttempts: true,
        lockedUntil: true,
      },
    });

    if (!user || !user.passwordHash) return null;

    // パスワード検証（Argon2またはbcrypt）
    let isValidPassword = false;
    if (this.passwordService.isArgon2Hash(user.passwordHash)) {
      isValidPassword = await this.passwordService.verifyPassword(
        password,
        user.passwordHash,
      );
    } else if (this.passwordService.needsMigration(user.passwordHash)) {
      // bcryptからの移行
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (isValidPassword) {
        // パスワードが正しい場合、Argon2にアップグレード
        const newHash = await this.passwordService.hashPassword(password);
        await this.setPassword(user.id, newHash, true);
      }
    }

    if (!isValidPassword) return null;
    return user;
  }

  /**
   * ログイン処理
   * 型安全なPrismaクエリを使用
   */
  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    // アカウントロック状態をチェック
    const isLocked = await this.loginAttemptService.isAccountLocked(email);
    if (isLocked) {
      const remainingMinutes =
        await this.loginAttemptService.getLockoutRemainingMinutes(email);

      // 失敗試行を記録
      await this.loginAttemptService.recordLoginAttempt({
        email,
        ipAddress,
        userAgent,
        success: false,
        reason: "Account locked",
      });

      throw new HttpException(
        `アカウントがロックされています。${remainingMinutes}分後に再試行してください。`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // ユーザー認証
    const user = await this.validateUser(email, password);

    const loginAttemptData: LoginAttemptData = {
      email,
      ipAddress,
      userAgent,
      success: !!user,
      reason: user ? undefined : "Invalid credentials",
    };

    // ログイン試行を記録
    await this.loginAttemptService.recordLoginAttempt(loginAttemptData);

    if (!user) {
      throw new UnauthorizedException("認証情報が正しくありません");
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = await this.jwt.signAsync(payload);

    return {
      success: true,
      data: {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
    };
  }

  /**
   * パスワード設定
   * 型安全なupdateを使用（生SQLではなく）
   */
  async setPassword(
    userId: string,
    password: string,
    isHashed: boolean = false,
  ) {
    let hash: string;

    if (isHashed) {
      // すでにハッシュ化されている（内部からの呼び出し）
      hash = password;
    } else {
      // パスワード強度チェック
      const validation =
        this.passwordService.validatePasswordStrength(password);
      if (!validation.isValid) {
        throw new BadRequestException({
          message: "パスワードが要件を満たしていません",
          errors: validation.errors,
        });
      }

      // Argon2でハッシュ化
      hash = await this.passwordService.hashPassword(password);
    }

    // 型安全なupdateを使用（生SQLの代わり）
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hash },
    });

    return { success: true };
  }

  /**
   * ユーザー登録
   * 型安全なcreateを使用
   */
  async register(email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing)
      throw new BadRequestException("このメールアドレスは既に登録されています");

    // パスワード強度チェック
    const validation = this.passwordService.validatePasswordStrength(password);
    if (!validation.isValid) {
      throw new BadRequestException({
        message: "パスワードが要件を満たしていません",
        errors: validation.errors,
      });
    }

    // パスワードハッシュを事前に生成
    const passwordHash = await this.passwordService.hashPassword(password);

    // 型安全なcreateでユーザーを作成（passwordHashも同時に設定）
    const user = await this.prisma.user.create({
      data: {
        email,
        role: UserRole.USER,
        isActive: true,
        clerkId: `local_${randomUUID()}`,
        passwordHash,
        failedLoginAttempts: 0, // 明示的に初期値を設定
        lockedUntil: null,
        lastLoginAt: null,
      },
      select: {
        id: true,
        email: true,
      },
    });

    return { success: true, data: user };
  }

  /**
   * パスワードリセット要求
   */
  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ 
      where: { email },
      select: { id: true, email: true }
    });
    
    if (!user) {
      // セキュリティのため、存在しないメールでも成功レスポンスを返す
      return {
        success: true,
        message: "パスワードリセット手順をメールで送信しました",
      };
    }

    // TODO: パスワードリセットトークンの生成とメール送信
    // 現在は仮実装
    return {
      success: true,
      message: "パスワードリセット手順をメールで送信しました",
    };
  }

  /**
   * パスワード変更
   * 型安全なfindUniqueとupdateを使用
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ 
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
      },
    });
    
    if (!user || !user.passwordHash) {
      throw new BadRequestException("ユーザーが見つかりません");
    }

    // 現在のパスワードを確認
    let isCurrentPasswordValid = false;
    if (this.passwordService.isArgon2Hash(user.passwordHash)) {
      isCurrentPasswordValid = await this.passwordService.verifyPassword(
        currentPassword,
        user.passwordHash,
      );
    } else if (this.passwordService.needsMigration(user.passwordHash)) {
      isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash,
      );
    }

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException("現在のパスワードが正しくありません");
    }

    // 新しいパスワードを設定
    await this.setPassword(userId, newPassword);
    return { success: true, message: "パスワードが正常に変更されました" };
  }

  /**
   * ユーザー情報取得（管理者用）
   * 型安全なfindManyを使用
   */
  async getUsersWithLoginStats(limit: number = 50) {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          failedLoginAttempts: true,
          lockedUntil: true,
          lastLoginAt: true,
          createdAt: true,
          isActive: true,
          loginAttempts: {
            select: {
              success: true,
              createdAt: true,
            },
            orderBy: { createdAt: "desc" },
            take: 5, // 最新5件のログイン試行
          },
        },
        take: limit,
        orderBy: { createdAt: "desc" },
      });

      return users;
    } catch (error) {
      throw new BadRequestException("ユーザー情報の取得に失敗しました");
    }
  }
}
