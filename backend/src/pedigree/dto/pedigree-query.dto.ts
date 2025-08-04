import { IsOptional, IsString, IsInt, IsBoolean, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PedigreeQueryDto {
  @ApiPropertyOptional({ description: 'ページ番号', default: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: '1ページあたりの件数', default: 10 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: '検索キーワード' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '品種ID' })
  @IsOptional()
  @IsString()
  breedId?: string;

  @ApiPropertyOptional({ description: '毛色ID' })
  @IsOptional()
  @IsString()
  colorId?: string;

  @ApiPropertyOptional({ description: '性別 (1: オス, 2: メス)' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'キャッテリー名' })
  @IsOptional()
  @IsString()
  catName2?: string;

  @ApiPropertyOptional({ description: '目の色' })
  @IsOptional()
  @IsString()
  eyeColor?: string;

  @ApiPropertyOptional({ description: 'ソート項目', default: 'createdAt' })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'catName', 'birthDate', 'pedigreeIssueDate'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'ソート順', default: 'desc' })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
