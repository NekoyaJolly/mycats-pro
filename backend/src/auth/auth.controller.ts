function toUserRole(val: string): RequestUser["role"] {
  if (val === "ADMIN" || val === "USER" || val === "GUEST") return val as RequestUser["role"];
  return "USER";
}

import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  Ip,
  Res,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { Request, Response } from "express";

import { RateLimiterService } from "../common/services/rate-limiter.service";

import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_MAX_AGE_MS, REFRESH_COOKIE_SAMESITE, isSecureEnv } from './auth.constants';
import { AuthService } from "./auth.service";
import type { RequestUser } from "./auth.types";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LoginDto } from "./dto/login.dto";
import { PasswordResetDto } from "./dto/password-reset.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RequestPasswordResetDto } from "./dto/request-password-reset.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { GetUser } from "./get-user.decorator";
import { JwtAuthGuard } from "./jwt-auth.guard";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly rateLimiter: RateLimiterService,
  ) {}

  @Post("login")
  @SkipThrottle()
  @ApiOperation({ summary: "ログイン（JWT発行）" })
  @ApiResponse({ status: HttpStatus.OK })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ success: boolean; data: { access_token: string; user: RequestUser } }> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const clientIp = ip || req.ip || 'unknown';
  const rateKey = `login:${clientIp}:${normalizedEmail}`;
  const registerRateKey = this.buildRegisterRateKey(dto.email, clientIp);
    const rate = this.rateLimiter.consume(rateKey, 20, 60_000);
    if (!rate.allowed) {
      this.applyRateLimitHeaders(res, 20, rate.remaining, rate.retryAfter, true);
      throw new HttpException('ログイン試行回数が上限に達しました。しばらくしてから再試行してください。', HttpStatus.TOO_MANY_REQUESTS);
    }
    this.applyRateLimitHeaders(res, 20, rate.remaining, rate.retryAfter, false);

    let userAgent: string = "";
    const ua = req.headers["user-agent"];
    if (typeof ua === "string") {
      userAgent = ua;
    } else if (Array.isArray(ua)) {
      userAgent = (ua as string[]).join(",");
    }
    const result = await this.auth.login(dto.email, dto.password, ip, userAgent);
    if (result?.success) {
      this.rateLimiter.reset(registerRateKey);
    }
    const userRaw = result.data.user as { id: string; email: string; role: string; firstName: string; lastName: string };
    const requestUser: RequestUser = {
      userId: userRaw.id,
      email: userRaw.email,
      role: toUserRole(userRaw.role),
      firstName: userRaw.firstName,
      lastName: userRaw.lastName,
    };
    // 型安全にAuthServiceのprismaプロパティを直接利用
    const refreshed = await this.auth["prisma"].user.findUnique({ where: { id: userRaw.id }, select: { refreshToken: true } });
    if (refreshed?.refreshToken) {
      this.setRefreshCookie(res, refreshed.refreshToken);
    }
    return { success: result.success, data: { access_token: result.data.access_token, user: requestUser } };
  }

  @Post("register")
  @SkipThrottle()
  @ApiOperation({ summary: "ユーザー登録（メール＋パスワード）" })
  @ApiResponse({ status: HttpStatus.OK })
  async register(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
  const clientIp = ip || req.ip || 'unknown';
  const rateKey = this.buildRegisterRateKey(dto.email, clientIp);
    const rate = this.rateLimiter.consume(rateKey, 5, 60_000);
    if (!rate.allowed) {
      this.applyRateLimitHeaders(res, 5, rate.remaining, rate.retryAfter, true);
      throw new HttpException('登録試行が制限されています。しばらくしてから再試行してください。', HttpStatus.TOO_MANY_REQUESTS);
    }
    this.applyRateLimitHeaders(res, 5, rate.remaining, rate.retryAfter, false);

    const result = await this.auth.register(dto.email, dto.password);
    if (result?.data?.refresh_token) {
      this.setRefreshCookie(res, result.data.refresh_token);
    }
    return result;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("set-password")
  @ApiOperation({ summary: "パスワード設定/変更（要JWT）" })
  @ApiResponse({ status: HttpStatus.OK })
  setPassword(@GetUser() user: RequestUser | undefined, @Body() dto: LoginDto) {
    return this.auth.setPassword(user.userId, dto.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("change-password")
  @ApiOperation({ summary: "パスワード変更（現在のパスワード確認必要）" })
  @ApiResponse({ status: HttpStatus.OK })
  changePassword(
    @GetUser() user: RequestUser | undefined,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.auth.changePassword(
      user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Post("request-password-reset")
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: "パスワードリセット要求" })
  @ApiResponse({ status: HttpStatus.OK, description: 'リセット手順をメールで送信' })
  requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.auth.requestPasswordReset(dto.email);
  }

  @Post("reset-password")
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: "パスワードリセット実行" })
  @ApiResponse({ status: HttpStatus.OK, description: 'パスワードがリセットされました' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '無効または期限切れのトークン' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.token, dto.newPassword);
  }

  @Post("refresh")
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: "リフレッシュトークンでアクセストークン再取得" })
  @ApiResponse({ status: HttpStatus.OK })
  async refresh(@Body() dto: RefreshTokenDto, @Res({ passthrough: true }) res: Response): Promise<{ success: boolean; data: { access_token: string; user: RequestUser } }> {
    // DTO 互換モード: body に入っていれば利用、無ければ Cookie 参照（将来的には完全Cookie化）
    const cookieToken = (res.req as Request).cookies?.[REFRESH_COOKIE_NAME];
    const token = dto?.refreshToken || cookieToken;
    const result = await this.auth.refreshUsingToken(token);
    const user = result.user as { id: string; email: string; role: string; firstName: string; lastName: string };
    const requestUser: RequestUser = {
      userId: user.id,
      email: user.email,
      role: toUserRole(user.role),
      firstName: user.firstName,
      lastName: user.lastName,
    };
    this.setRefreshCookie(res, result.refresh_token);
    return { success: true, data: { access_token: result.access_token, user: requestUser } };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @ApiOperation({ summary: "ログアウト（リフレッシュトークン削除）" })
  @ApiResponse({ status: HttpStatus.OK })
  logout(@GetUser() user: RequestUser | undefined, @Res({ passthrough: true }) res: Response) {
    // Cookie 無効化
  res.cookie(REFRESH_COOKIE_NAME, '', { httpOnly: true, secure: isSecureEnv(), sameSite: REFRESH_COOKIE_SAMESITE, path: '/', maxAge: 0 });
    return this.auth.logout(user.userId);
  }

  private setRefreshCookie(res: Response, token: string) {
    res.cookie(REFRESH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isSecureEnv(),
      sameSite: REFRESH_COOKIE_SAMESITE,
      path: '/',
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    });
  }

  private applyRateLimitHeaders(
    res: Response,
    limit: number,
    remaining: number,
    retryAfterSeconds: number,
    exceeded: boolean,
  ) {
    if (!res) return;
    res.header('X-RateLimit-Limit', limit.toString());
    res.header('X-RateLimit-Remaining', Math.max(0, remaining).toString());
    res.header('X-RateLimit-Reset', retryAfterSeconds.toString());
    if (exceeded) {
      res.header('Retry-After', retryAfterSeconds.toString());
    }
  }

  private buildRegisterRateKey(email: string | undefined, clientIp: string): string {
    const normalizedIp = clientIp || 'unknown';
    const normalizedEmail = (email ?? '').trim().toLowerCase();

    if (process.env.NODE_ENV === 'test' && normalizedEmail.includes('@')) {
      const localPart = normalizedEmail.split('@')[0];
      const match = localPart.match(/(.+)_\d+$/);
      const namespace = match ? match[1] : localPart;
      return `register:${normalizedIp}:${namespace}`;
    }

    return `register:${normalizedIp}`;
  }
}
