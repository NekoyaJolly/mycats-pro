import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsOptional, MaxLength, IsInt } from "class-validator";

export class CreateBreedDto {
  @ApiProperty({ description: "品種コード" })
  @IsInt()
  @Type(() => Number)
  code: number;

  @ApiProperty({ description: "品種名" })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: "品種の説明" })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
