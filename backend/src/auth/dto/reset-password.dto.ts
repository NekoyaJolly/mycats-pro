import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'パスワードリセットトークン',
    example: 'a1b2c3d4e5f6...',
  })
  @IsString({ message: 'トークンは文字列である必要があります' })
  @IsNotEmpty({ message: 'トークンは必須です' })
  token: string;

  @ApiProperty({
    description: '新しいパスワード',
    example: 'NewSecurePassword123!',
  })
  @IsString({ message: 'パスワードは文字列である必要があります' })
  @MinLength(8, { message: 'パスワードは8文字以上である必要があります' })
  @IsNotEmpty({ message: 'パスワードは必須です' })
  newPassword: string;
}
