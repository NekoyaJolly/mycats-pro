import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";
import { Transform } from "class-transformer";

export class LoginDto {
  @ApiProperty({
    description: "ログインに使用するメールアドレス",
    example: "user@example.com",
  })
  @IsEmail({}, { message: "有効なメールアドレスを入力してください" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
  email: string;

  @ApiProperty({
    description: "パスワード (8文字以上推奨)",
    example: "SecurePassword123!",
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: "パスワードは6文字以上である必要があります" })
  password: string;
}
