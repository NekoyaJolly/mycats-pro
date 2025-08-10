import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsHexColor, IsOptional, IsString, MinLength } from "class-validator";

export class CreateTagDto {
  @ApiProperty({ description: "タグ名", example: "Indoor" })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ description: "カラーコード", example: "#3B82F6" })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ description: "説明", example: "室内飼いタグ" })
  @IsOptional()
  @IsString()
  description?: string;
}
