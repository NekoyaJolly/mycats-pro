import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";
import { Transform } from "class-transformer";

export class PasswordResetDto {
  @ApiProperty({
    description: "パスワードリセットを行うメールアドレス",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "有効なメールアドレスを入力してください" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  email: string;
}
