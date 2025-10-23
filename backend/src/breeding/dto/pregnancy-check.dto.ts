import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PregnancyStatus } from '@prisma/client';

export class CreatePregnancyCheckDto {
  @ApiProperty({ description: '繁殖記録ID' })
  @IsString()
  breedingRecordId: string;

  @ApiProperty({ description: 'オス猫ID' })
  @IsString()
  maleId: string;

  @ApiProperty({ description: 'メス猫ID' })
  @IsString()
  femaleId: string;

  @ApiProperty({ description: 'オス猫名' })
  @IsString()
  maleName: string;

  @ApiProperty({ description: 'メス猫名' })
  @IsString()
  femaleName: string;

  @ApiProperty({ description: '交配日' })
  @IsDateString()
  matingDate: string;

  @ApiProperty({ description: '確認予定日' })
  @IsDateString()
  checkDate: string;

  @ApiPropertyOptional({ description: '備考' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePregnancyCheckDto {
  @ApiPropertyOptional({ description: '確認予定日' })
  @IsOptional()
  @IsDateString()
  checkDate?: string;

  @ApiPropertyOptional({ description: '状態', enum: PregnancyStatus })
  @IsOptional()
  @IsEnum(PregnancyStatus)
  status?: PregnancyStatus;

  @ApiPropertyOptional({ description: '備考' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class PregnancyCheckQueryDto {
  @ApiPropertyOptional({ description: 'オス猫ID' })
  @IsOptional()
  @IsString()
  maleId?: string;

  @ApiPropertyOptional({ description: 'メス猫ID' })
  @IsOptional()
  @IsString()
  femaleId?: string;

  @ApiPropertyOptional({ description: '状態', enum: PregnancyStatus })
  @IsOptional()
  @IsEnum(PregnancyStatus)
  status?: PregnancyStatus;
}
