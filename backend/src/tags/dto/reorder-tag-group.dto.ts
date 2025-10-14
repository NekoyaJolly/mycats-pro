import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsInt, IsOptional, IsUUID, ValidateNested } from "class-validator";

class TagGroupOrderItemDto {
  @ApiProperty({ description: "グループID", format: "uuid" })
  @IsUUID()
  id!: string;

  @ApiProperty({ description: "表示順", example: 10 })
  @IsInt()
  displayOrder!: number;

  @ApiProperty({ description: "移動先カテゴリID", format: "uuid", required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;
}

export class ReorderTagGroupDto {
  @ApiProperty({ type: [TagGroupOrderItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => TagGroupOrderItemDto)
  items!: TagGroupOrderItemDto[];
}
