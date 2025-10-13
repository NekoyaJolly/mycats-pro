import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsHexColor,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from "class-validator";

export class CreateTagDto {
  @ApiProperty({ description: "タグ名", example: "Indoor" })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ description: "タググループID", example: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee" })
  @IsUUID()
  groupId: string;

  @ApiPropertyOptional({ description: "カラーコード", example: "#3B82F6" })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ description: "説明", example: "室内飼いタグ" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "手動操作で利用可能か", example: true })
  @IsOptional()
  @IsBoolean()
  allowsManual?: boolean;

  @ApiPropertyOptional({ description: "自動ルールで利用可能か", example: true })
  @IsOptional()
  @IsBoolean()
  allowsAutomation?: boolean;

  @ApiPropertyOptional({ description: "表示順", example: 10 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({ description: "任意のメタデータ", type: Object })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ description: "アクティブかどうか", example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
