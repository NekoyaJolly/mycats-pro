import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({
    description: "ログインに使用するメールアドレス",
    example: "user@example.com",
  })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "パスワード (6文字以上)", example: "Passw0rd!" })
  @IsString()
  @MinLength(6)
  password: string;
}
