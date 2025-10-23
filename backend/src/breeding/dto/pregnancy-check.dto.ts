import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, IsDateString, IsUUID, IsInt, Min } from "class-validator";
import { PregnancyStatus } from "@prisma/client";

export class CreatePregnancyCheckDto {
  @ApiProperty({ description: "妊娠チェック対象の猫ID" })
  @IsUUID()
  motherId: string;

  @ApiProperty({ description: "妊娠チェック日" })
  @IsDateString()
  checkDate: string;

  @ApiProperty({ description: "妊娠状態", enum: PregnancyStatus })
  @IsEnum(PregnancyStatus)
  status: PregnancyStatus;

  @ApiPropertyOptional({ description: "メモ" })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePregnancyCheckDto {
  @ApiPropertyOptional({ description: "妊娠チェック日" })
  @IsOptional()
  @IsDateString()
  checkDate?: string;

  @ApiPropertyOptional({ description: "妊娠状態", enum: PregnancyStatus })
  @IsOptional()
  @IsEnum(PregnancyStatus)
  status?: PregnancyStatus;

  @ApiPropertyOptional({ description: "メモ" })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class PregnancyCheckQueryDto {
  @ApiPropertyOptional({ description: "母親の猫ID" })
  @IsOptional()
  @IsUUID()
  motherId?: string;

  @ApiPropertyOptional({ description: "妊娠状態", enum: PregnancyStatus })
  @IsOptional()
  @IsEnum(PregnancyStatus)
  status?: PregnancyStatus;

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