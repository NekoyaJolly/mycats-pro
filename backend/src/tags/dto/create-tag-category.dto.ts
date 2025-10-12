import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsHexColor,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateTagCategoryDto {
  @ApiPropertyOptional({ description: "ユニークキー (未指定時は名前から生成)", example: "cats_status" })
  @IsOptional()
  @IsString()
  key?: string;

  @ApiProperty({ description: "カテゴリ名", example: "猫ステータス" })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ description: "カテゴリの説明" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "カテゴリの代表カラー", example: "#6366F1" })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ description: "表示順" })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({ description: "利用するスコープ一覧", type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @ApiPropertyOptional({ description: "アクティブかどうか", example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
