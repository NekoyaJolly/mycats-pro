import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ 
    description: 'リフレッシュトークン',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsNotEmpty({ message: 'リフレッシュトークンは必須です' })
  @IsString({ message: 'リフレッシュトークンは文字列である必要があります' })
  refreshToken: string;
}
