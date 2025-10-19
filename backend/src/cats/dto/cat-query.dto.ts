import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsOptional,
  IsString,
  IsInt,
  IsIn,
  Min,
  Max,
} from "class-validator";

import {
  CatGenderInput,
  GENDER_INPUT_VALUES,
  transformGenderInput,
} from "../constants/gender";

export class CatQueryDto {
  @ApiPropertyOptional({ description: "ページ番号", default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: "1ページあたりの件数", default: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: "検索キーワード" })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: "品種ID" })
  @IsOptional()
  @IsString()
  breedId?: string;

  @ApiPropertyOptional({ description: "毛色ID" })
  @IsOptional()
  @IsString()
  coatColorId?: string;

  @ApiPropertyOptional({
    description: "性別",
    enum: GENDER_INPUT_VALUES,
  })
  @IsOptional()
  @Transform(({ value }) => transformGenderInput(value), { toClassOnly: true })
  @IsString()
  @IsIn(GENDER_INPUT_VALUES)
  gender?: CatGenderInput;

  @ApiPropertyOptional({ description: "最小年齢" })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  ageMin?: number;

  @ApiPropertyOptional({ description: "最大年齢" })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  ageMax?: number;

  @ApiPropertyOptional({ description: "ソート項目", default: "createdAt" })
  @IsOptional()
  @IsString()
  @IsIn(["createdAt", "updatedAt", "name", "birthDate", "weight"])
  sortBy?: string = "createdAt";

  @ApiPropertyOptional({ description: "ソート順", default: "desc" })
  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "desc";
}
