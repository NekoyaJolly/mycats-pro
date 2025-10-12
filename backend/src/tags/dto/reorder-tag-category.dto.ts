import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsInt, IsUUID, ValidateNested } from "class-validator";

class TagCategoryOrderItemDto {
  @ApiProperty({ description: "カテゴリID", format: "uuid" })
  @IsUUID()
  id!: string;

  @ApiProperty({ description: "表示順", example: 10 })
  @IsInt()
  displayOrder!: number;
}

export class ReorderTagCategoriesDto {
  @ApiProperty({ type: [TagCategoryOrderItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TagCategoryOrderItemDto)
  items!: TagCategoryOrderItemDto[];
}
