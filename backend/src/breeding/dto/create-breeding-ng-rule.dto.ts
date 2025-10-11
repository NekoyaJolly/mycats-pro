import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BreedingNgRuleType } from "@prisma/client";
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from "class-validator";

export class CreateBreedingNgRuleDto {
  @ApiProperty({ description: "ルール名", example: "近親交配防止" })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: "説明", example: "血統書付き同士の交配を避ける" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: BreedingNgRuleType, example: BreedingNgRuleType.TAG_COMBINATION })
  @IsEnum(BreedingNgRuleType)
  type!: BreedingNgRuleType;

  @ApiPropertyOptional({ description: "有効フラグ", default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ description: "オス側のタグ条件", type: [String] })
  @ValidateIf((dto) => dto.type === BreedingNgRuleType.TAG_COMBINATION)
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  maleConditions?: string[];

  @ApiPropertyOptional({ description: "メス側のタグ条件", type: [String] })
  @ValidateIf((dto) => dto.type === BreedingNgRuleType.TAG_COMBINATION)
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  femaleConditions?: string[];

  @ApiPropertyOptional({ description: "禁止するオス猫の名前", type: [String] })
  @ValidateIf((dto) => dto.type === BreedingNgRuleType.INDIVIDUAL_PROHIBITION)
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  maleNames?: string[];

  @ApiPropertyOptional({ description: "禁止するメス猫の名前", type: [String] })
  @ValidateIf((dto) => dto.type === BreedingNgRuleType.INDIVIDUAL_PROHIBITION)
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  femaleNames?: string[];

  @ApiPropertyOptional({ description: "世代制限 (親等)", minimum: 1 })
  @ValidateIf((dto) => dto.type === BreedingNgRuleType.GENERATION_LIMIT)
  @IsOptional()
  @IsInt()
  @Min(1)
  generationLimit?: number;
}
