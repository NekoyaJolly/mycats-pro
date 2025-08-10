import { Body, Controller, HttpStatus, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { GetUser } from "./get-user.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  @ApiOperation({ summary: "ログイン（JWT発行）" })
  @ApiResponse({ status: HttpStatus.OK })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
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
}
