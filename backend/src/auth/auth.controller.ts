import {
  Body,
  Controller,
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
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from "express";

import { REFRESH_COOKIE_NAME, REFRESH_COOKIE_MAX_AGE_MS, REFRESH_COOKIE_SAMESITE, isSecureEnv } from './auth.constants';
import { AuthService } from "./auth.service";
import type { RequestUser } from "./auth.types";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LoginDto } from "./dto/login.dto";
import { PasswordResetDto } from "./dto/password-reset.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { GetUser } from "./get-user.decorator";
import { JwtAuthGuard } from "./jwt-auth.guard";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: "ログイン（JWT発行）" })
  @ApiResponse({ status: HttpStatus.OK })
  login(@Body() dto: LoginDto, @Req() req: Request, @Ip() ip: string, @Res({ passthrough: true }) res: Response) {
    const userAgent = req.headers["user-agent"] || "";
    return this.auth.login(dto.email, dto.password, ip, userAgent).then(async (result) => {
      // login 内で refresh token は DB 保存済みなので、再度読み直し
      const userId = result.data.user.id;
      // DBから現在のrefreshToken取得
      const refreshed = await (this as any).auth["prisma"].user.findUnique({ where: { id: userId }, select: { refreshToken: true } });
      if (refreshed?.refreshToken) {
        this.setRefreshCookie(res, refreshed.refreshToken);
      }
      return result;
    });
  }

  @Post("register")
  @ApiOperation({ summary: "ユーザー登録（メール＋パスワード）" })
  @ApiResponse({ status: HttpStatus.OK })
  register(@Body() dto: LoginDto) {
    return this.auth.register(dto.email, dto.password);
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
  @ApiOperation({ summary: "パスワードリセット要求" })
  @ApiResponse({ status: HttpStatus.OK })
  requestPasswordReset(@Body() dto: PasswordResetDto) {
    return this.auth.requestPasswordReset(dto.email);
  }

  @Post("refresh")
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: "リフレッシュトークンでアクセストークン再取得" })
  @ApiResponse({ status: HttpStatus.OK })
  refresh(@Body() dto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    // DTO 互換モード: body に入っていれば利用、無ければ Cookie 参照（将来的には完全Cookie化）
  const cookieToken = (res.req as Request).cookies?.[REFRESH_COOKIE_NAME];
    const token = dto?.refreshToken || cookieToken;
    return this.auth.refreshUsingToken(token).then(result => {
      this.setRefreshCookie(res, result.refresh_token);
      return { success: true, data: { access_token: result.access_token, user: result.user } };
    });
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

}
