import { IsString, IsOptional, IsEnum, IsDateString, MaxLength, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CatGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export class CreateCatDto {
  @ApiProperty({ description: '登録ID' })
  @IsString()
  @MaxLength(100)
  registrationId: string;

  @ApiProperty({ description: '猫の名前' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: '品種ID' })
  @IsOptional()
  @IsString()
  breedId?: string;

  @ApiPropertyOptional({ description: '毛色ID' })
  @IsOptional()
  @IsString()
  colorId?: string;

  @ApiPropertyOptional({ description: 'パターン' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pattern?: string;

  @ApiProperty({ description: '性別', enum: CatGender })
  @IsEnum(CatGender)
  gender: CatGender;

  @ApiProperty({ description: '生年月日' })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional({ description: '体重 (kg)' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight?: number;

  @ApiPropertyOptional({ description: 'マイクロチップID' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  microchipId?: string;

  @ApiProperty({ description: 'オーナーID' })
  @IsString()
  ownerId: string;

  @ApiPropertyOptional({ description: '父猫のID' })
  @IsOptional()
  @IsString()
  fatherId?: string;

  @ApiPropertyOptional({ description: '母猫のID' })
  @IsOptional()
  @IsString()
  motherId?: string;

  @ApiPropertyOptional({ description: '写真URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({ description: '備考' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
