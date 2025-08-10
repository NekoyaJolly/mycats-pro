import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class PasswordResetDto {
  @ApiProperty({
    description: "パスワードリセットを行うメールアドレス",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "有効なメールアドレスを入力してください" })
  email: string;
}
