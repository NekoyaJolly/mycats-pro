import { IsString, IsDateString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BirthStatus } from '@prisma/client';

export class CreateBirthPlanDto {
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

  @ApiProperty({ description: '出産予定日' })
  @IsDateString()
  expectedDate: string;

  @ApiPropertyOptional({ description: '備考' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBirthPlanDto {
  @ApiPropertyOptional({ description: '出産予定日' })
  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @ApiPropertyOptional({ description: '実際の出産日' })
  @IsOptional()
  @IsDateString()
  actualBirthDate?: string;

  @ApiPropertyOptional({ description: '子猫の数' })
  @IsOptional()
  @IsInt()
  @Min(0)
  numberOfKittens?: number;

  @ApiPropertyOptional({ description: '状態', enum: BirthStatus })
  @IsOptional()
  @IsEnum(BirthStatus)
  status?: BirthStatus;

  @ApiPropertyOptional({ description: '備考' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BirthPlanQueryDto {
  @ApiPropertyOptional({ description: 'オス猫ID' })
  @IsOptional()
  @IsString()
  maleId?: string;

  @ApiPropertyOptional({ description: 'メス猫ID' })
  @IsOptional()
  @IsString()
  femaleId?: string;

  @ApiPropertyOptional({ description: '状態', enum: BirthStatus })
  @IsOptional()
  @IsEnum(BirthStatus)
  status?: BirthStatus;
}
