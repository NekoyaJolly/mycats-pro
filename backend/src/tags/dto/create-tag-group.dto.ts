import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString, IsUUID, MinLength, IsNumber } from "class-validator";

export class CreateTagGroupDto {
  @ApiProperty({ description: "所属カテゴリID", example: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee" })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ description: "グループ名", example: "屋内管理" })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiPropertyOptional({ description: "グループの説明" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "表示順", example: 10 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiPropertyOptional({ description: "アクティブかどうか", example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
