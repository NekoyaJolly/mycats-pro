import { IsString, IsOptional, IsInt, IsBoolean, IsDateString, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePedigreeDto {
  @ApiProperty({ description: '血統書番号' })
  @IsString()
  @MaxLength(100)
  pedigreeId: string;

  @ApiProperty({ description: '猫の名前' })
  @IsString()
  @MaxLength(200)
  catName: string;

  @ApiPropertyOptional({ description: 'タイトル' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  title?: string;

  @ApiPropertyOptional({ description: 'キャッテリー名' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  catteryName?: string;

  @ApiPropertyOptional({ description: '性別 (1: オス, 2: メス)' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  gender?: number;

  @ApiPropertyOptional({ description: '目の色' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  eyeColor?: string;

  @ApiPropertyOptional({ description: '生年月日' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ description: '登録年月日' })
  @IsOptional()
  @IsDateString()
  registrationDate?: string;

  @ApiPropertyOptional({ description: 'ブリーダー名' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  breederName?: string;

  @ApiPropertyOptional({ description: 'オーナー名' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  ownerName?: string;

  @ApiPropertyOptional({ description: '兄弟の人数' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  brotherCount?: number;

  @ApiPropertyOptional({ description: '姉妹の人数' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sisterCount?: number;

  @ApiPropertyOptional({ description: '備考' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({ description: '備考２' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes2?: string;

  @ApiPropertyOptional({ description: '他団体No' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  otherNo?: string;

  @ApiPropertyOptional({ description: 'チャンピオンフラグ' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  championFlag?: string;

  @ApiPropertyOptional({ description: '旧コード' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  oldCode?: string;

  @ApiPropertyOptional({ description: '関連する猫のID' })
  @IsOptional()
  @IsString()
  catId?: string;
}
