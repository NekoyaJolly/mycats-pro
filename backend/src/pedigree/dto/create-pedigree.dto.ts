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
  catName2?: string;

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

  @ApiPropertyOptional({ description: '旧コード' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  oldCode?: string;

  @ApiPropertyOptional({ description: '関連する猫のID' })
  @IsOptional()
  @IsString()
  catId?: string;

  // 血統関係フィールド
  @ApiPropertyOptional({ description: '品種ID' })
  @IsOptional()
  @IsString()
  breedId?: string;

  @ApiPropertyOptional({ description: '毛色ID' })
  @IsOptional()
  @IsString()
  colorId?: string;

  @ApiPropertyOptional({ description: '血統書発行日' })
  @IsOptional()
  @IsDateString()
  pedigreeIssueDate?: string;

  @ApiPropertyOptional({ description: '品種コード' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  breedCode?: string;

  @ApiPropertyOptional({ description: '毛色コード' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  coatColorCode?: string;

  // 父母血統書ID
  @ApiPropertyOptional({ description: '父の血統書ID' })
  @IsOptional()
  @IsString()
  fatherPedigreeId?: string;

  @ApiPropertyOptional({ description: '母の血統書ID' })
  @IsOptional()
  @IsString()
  motherPedigreeId?: string;

  // 祖父母血統書ID
  @ApiPropertyOptional({ description: '父方祖父の血統書ID' })
  @IsOptional()
  @IsString()
  paternalGrandfatherId?: string;

  @ApiPropertyOptional({ description: '父方祖母の血統書ID' })
  @IsOptional()
  @IsString()
  paternalGrandmotherId?: string;

  @ApiPropertyOptional({ description: '母方祖父の血統書ID' })
  @IsOptional()
  @IsString()
  maternalGrandfatherId?: string;

  @ApiPropertyOptional({ description: '母方祖母の血統書ID' })
  @IsOptional()
  @IsString()
  maternalGrandmotherId?: string;
}
