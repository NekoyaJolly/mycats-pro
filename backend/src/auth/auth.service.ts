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
import { UserRole, User } from "@prisma/client";
import * as bcrypt from "bcryptjs";

import { PrismaService } from "../prisma/prisma.service";

import { LoginAttemptService, LoginAttemptData } from "./login-attempt.service";
import { PasswordService } from "./password.service";


@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
    private readonly loginAttemptService: LoginAttemptService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = (await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })) as unknown as {
      id: string;
      email: string;
      role: UserRole;
      firstName: string | null;
      lastName: string | null;
      passwordHash: string | null;
      failedLoginAttempts: number;
      lockedUntil: Date | null;
    } | null;

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

  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    email = email.trim().toLowerCase();
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
    const access_token = await this.jwt.signAsync(payload, { expiresIn: '15m' });
    const refresh_token = await this.jwt.signAsync(
      { sub: user.id, type: 'refresh' }, 
      { expiresIn: '7d' }
    );

    // リフレッシュトークンをDBに保存
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refresh_token }
    });

    return {
      success: true,
      data: {
        access_token,
        refresh_token,
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

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hash },
    });
    return { success: true };
  }

  async register(email: string, password: string) {
    // email の正規化（前後スペース除去＋小文字化）
    email = email.trim().toLowerCase();
    // unique 制約に従い findUnique を使用
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
    // 事前にパスワードをハッシュ化し、作成時に同時保存（UPDATEを回避）
    const passwordHash = await this.passwordService.hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        role: UserRole.USER,
        isActive: true,
        // clerkId は nullable、必要時のみ設定
        clerkId: `local_${randomUUID()}`,
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: null,
      },
      select: { id: true, email: true },
    });

    return { success: true, data: { id: user.id, email: user.email } };
  }

  async requestPasswordReset(email: string) {
    // email の正規化
    email = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
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

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
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

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      
      const user = await this.prisma.user.findFirst({
        where: { id: payload.sub, refreshToken: refreshToken },
      });
      
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
      return this.generateTokens(user);
    } catch (_error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
  
  private async generateTokens(user: User) {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshToken },
    });
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async logout(userId: string) {
    // リフレッシュトークンを削除
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null }
    });

    return { success: true, message: "ログアウトしました" };
  }
}
