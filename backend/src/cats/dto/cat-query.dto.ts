import { IsOptional, IsString, IsInt, IsEnum, IsIn, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CatGender } from './create-cat.dto';

export class CatQueryDto {
  @ApiPropertyOptional({ description: 'ページ番号', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: '1ページあたりの件数', default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
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

  @ApiPropertyOptional({ description: '性別', enum: CatGender })
  @IsOptional()
  @IsEnum(CatGender)
  gender?: CatGender;

  @ApiPropertyOptional({ description: '最小年齢' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  ageMin?: number;

  @ApiPropertyOptional({ description: '最大年齢' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  ageMax?: number;

  @ApiPropertyOptional({ description: 'ソート項目', default: 'createdAt' })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'updatedAt', 'name', 'birthDate', 'weight'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'ソート順', default: 'desc' })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
