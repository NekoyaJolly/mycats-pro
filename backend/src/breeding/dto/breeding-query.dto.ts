import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsUUID,
  Min,
} from "class-validator";

export class BreedingQueryDto {
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

  @ApiPropertyOptional({ description: "母猫ID" })
  @IsOptional()
  @IsUUID()
  motherId?: string;

  @ApiPropertyOptional({ description: "父猫ID" })
  @IsOptional()
  @IsUUID()
  fatherId?: string;

  @ApiPropertyOptional({ description: "開始日(YYYY-MM-DD)" })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: "終了日(YYYY-MM-DD)" })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ example: "createdAt" })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ example: "desc", enum: ["asc", "desc"] })
  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc";
}
