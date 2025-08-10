import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, IsStrongPassword } from "class-validator";

export class ChangePasswordDto {
  @ApiProperty({
    description: "現在のパスワード",
    example: "oldPassword123!",
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description:
      "新しいパスワード（8文字以上、大文字・小文字・数字・特殊文字を含む）",
    example: "NewSecurePassword123!",
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: "パスワードは8文字以上である必要があります" })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        "パスワードには大文字、小文字、数字、特殊文字を含める必要があります",
    },
  )
  newPassword: string;
}
