import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiPropertyOptional({
    description: 'リフレッシュトークン (Cookie利用時は省略可)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsOptional()
  @IsString({ message: 'リフレッシュトークンは文字列である必要があります' })
  refreshToken?: string;
}
