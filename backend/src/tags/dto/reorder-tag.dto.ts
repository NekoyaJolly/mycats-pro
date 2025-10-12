import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsInt, IsOptional, IsUUID, ValidateNested } from "class-validator";

class TagOrderItemDto {
  @ApiProperty({ description: "タグID", format: "uuid" })
  @IsUUID()
  id!: string;

  @ApiProperty({ description: "表示順", example: 12 })
  @IsInt()
  displayOrder!: number;

  @ApiProperty({ description: "所属カテゴリID", format: "uuid", required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class ReorderTagsDto {
  @ApiProperty({ type: [TagOrderItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TagOrderItemDto)
  items!: TagOrderItemDto[];
}
