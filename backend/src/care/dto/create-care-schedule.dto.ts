import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { CareType } from "@prisma/client";

export class CreateCareScheduleDto {
  @ApiProperty({
    description: "猫ID",
    example: "e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60",
  })
  @IsUUID()
  catId: string;

  @ApiProperty({
    description: "ケア種別",
    enum: CareType,
    example: CareType.HEALTH_CHECK,
  })
  @IsEnum(CareType)
  careType: CareType;

  @ApiProperty({ description: "予定日 (ISO8601)", example: "2025-09-01" })
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional({
    description: "ケア名/詳細",
    example: "健康診断 (年1回)",
  })
  @IsOptional()
  @IsString()
  description?: string;
}
