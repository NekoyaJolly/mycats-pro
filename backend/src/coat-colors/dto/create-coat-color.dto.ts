import { IsString, IsOptional, MaxLength, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCoatColorDto {
  @ApiProperty({ description: '毛色コード' })
  @IsInt()
  @Type(() => Number)
  code: number;

  @ApiProperty({ description: '毛色名' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: '毛色の説明' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
