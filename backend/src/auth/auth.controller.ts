import {
  Body,
  Controller,
  HttpStatus,
  Post,
  UseGuards,
  Req,
  Ip,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request } from "express";

import { AuthService } from "./auth.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LoginDto } from "./dto/login.dto";
import { PasswordResetDto } from "./dto/password-reset.dto";
import { GetUser } from "./get-user.decorator";
import { JwtAuthGuard } from "./jwt-auth.guard";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  @ApiOperation({ summary: "ログイン（JWT発行）" })
  @ApiResponse({ status: HttpStatus.OK })
  login(@Body() dto: LoginDto, @Req() req: Request, @Ip() ip: string) {
    const userAgent = req.headers["user-agent"] || "";
    return this.auth.login(dto.email, dto.password, ip, userAgent);
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
  setPassword(@GetUser() user: any, @Body() dto: LoginDto) {
    return this.auth.setPassword(user.userId, dto.password);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("change-password")
  @ApiOperation({ summary: "パスワード変更（現在のパスワード確認必要）" })
  @ApiResponse({ status: HttpStatus.OK })
  changePassword(@GetUser() user: any, @Body() dto: ChangePasswordDto) {
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
}
