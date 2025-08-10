import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { PrismaModule } from "../prisma/prisma.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { LoginAttemptService } from "./login-attempt.service";
import { PasswordService } from "./password.service";

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET") || "dev-secret",
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRES_IN") || "7d",
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, AuthService, PasswordService, LoginAttemptService],
  exports: [JwtModule, PassportModule, PasswordService, LoginAttemptService],
})
export class AuthModule {}
