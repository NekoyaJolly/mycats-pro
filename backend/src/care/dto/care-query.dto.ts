import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsUUID,
  Min,
} from "class-validator";
import { CareType } from "@prisma/client";

export class CareQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  limit?: number = 20;

  @ApiPropertyOptional({
    description: "猫ID",
    example: "e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60",
  })
  @IsOptional()
  @IsUUID()
  catId?: string;

  @ApiPropertyOptional({
    description: "ケア種別",
    enum: CareType,
    example: CareType.VACCINATION,
  })
  @IsOptional()
  @IsEnum(CareType)
  careType?: CareType;

  @ApiPropertyOptional({
    description: "開始日 (YYYY-MM-DD)",
    example: "2025-08-01",
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: "終了日 (YYYY-MM-DD)",
    example: "2025-08-31",
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
