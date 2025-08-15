import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsOptional, MaxLength, IsInt, Min, Max } from "class-validator";

export class CreateCoatColorDto {
  @ApiProperty({ description: "毛色コード" })
  @IsInt()
  @Min(1)
  @Max(9999)
  @Type(() => Number)
  code: number;

  @ApiProperty({ description: "毛色名" })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: "毛色の説明" })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
