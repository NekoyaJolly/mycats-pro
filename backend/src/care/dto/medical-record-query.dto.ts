import { ApiPropertyOptional } from "@nestjs/swagger";
import { MedicalRecordStatus, MedicalVisitType } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsUUID,
  Min,
} from "class-validator";

export class MedicalRecordQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 20;

  @ApiPropertyOptional({ description: "猫ID", example: "e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60" })
  @IsOptional()
  @IsUUID()
  catId?: string;

  @ApiPropertyOptional({ description: "スケジュールID", example: "a6f7e52f-4a3b-4a76-9870-1234567890ab" })
  @IsOptional()
  @IsUUID()
  scheduleId?: string;

  @ApiPropertyOptional({ enum: MedicalVisitType, example: MedicalVisitType.CHECKUP })
  @IsOptional()
  @IsEnum(MedicalVisitType)
  visitType?: MedicalVisitType;

  @ApiPropertyOptional({ enum: MedicalRecordStatus, example: MedicalRecordStatus.ACTIVE })
  @IsOptional()
  @IsEnum(MedicalRecordStatus)
  status?: MedicalRecordStatus;

  @ApiPropertyOptional({ description: "受診開始日", example: "2025-08-01" })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: "受診終了日", example: "2025-08-31" })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
