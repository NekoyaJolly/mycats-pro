import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsDateString, IsUUID, IsInt, Min } from "class-validator";
import { BirthStatus } from "@prisma/client";

export class CreateBirthPlanDto {
  @ApiProperty({ description: "出産予定の母親猫ID" })
  @IsUUID()
  motherId: string;

  @ApiProperty({ description: "出産予定日" })
  @IsDateString()
  expectedBirthDate: string;

  @ApiPropertyOptional({ description: "実際の出産日" })
  @IsOptional()
  @IsDateString()
  actualBirthDate?: string;

  @ApiProperty({ description: "出産状態", enum: BirthStatus })
  @IsEnum(BirthStatus)
  status: BirthStatus;

  @ApiPropertyOptional({ description: "予想される子猫の数" })
  @IsOptional()
  @IsInt()
  @Min(1)
  expectedKittens?: number;

  @ApiPropertyOptional({ description: "実際の子猫の数" })
  @IsOptional()
  @IsInt()
  @Min(0)
  actualKittens?: number;

  @ApiPropertyOptional({ description: "メモ" })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBirthPlanDto {
  @ApiPropertyOptional({ description: "出産予定日" })
  @IsOptional()
  @IsDateString()
  expectedBirthDate?: string;

  @ApiPropertyOptional({ description: "実際の出産日" })
  @IsOptional()
  @IsDateString()
  actualBirthDate?: string;

  @ApiPropertyOptional({ description: "出産状態", enum: BirthStatus })
  @IsOptional()
  @IsEnum(BirthStatus)
  status?: BirthStatus;

  @ApiPropertyOptional({ description: "予想される子猫の数" })
  @IsOptional()
  @IsInt()
  @Min(1)
  expectedKittens?: number;

  @ApiPropertyOptional({ description: "実際の子猫の数" })
  @IsOptional()
  @IsInt()
  @Min(0)
  actualKittens?: number;

  @ApiPropertyOptional({ description: "メモ" })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BirthPlanQueryDto {
  @ApiPropertyOptional({ description: "母親の猫ID" })
  @IsOptional()
  @IsUUID()
  motherId?: string;

  @ApiPropertyOptional({ description: "出産状態", enum: BirthStatus })
  @IsOptional()
  @IsEnum(BirthStatus)
  status?: BirthStatus;

  @ApiPropertyOptional({ description: "ページ番号", default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: "1ページあたりの件数", default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;
}