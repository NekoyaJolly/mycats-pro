import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
  IsBoolean,
  IsArray,
  IsIn,
} from "class-validator";

export class CreateCatDto {
  @ApiProperty({ description: "猫の名前", example: "Alpha" })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: "性別",
    enum: ["MALE", "FEMALE"],
    example: "MALE",
  })
  @IsString()
  @IsIn(["MALE", "FEMALE"])
  gender: "MALE" | "FEMALE";

  @ApiProperty({ description: "生年月日", example: "2024-05-01" })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional({ description: "品種ID" })
  @IsOptional()
  @IsString()
  breedId?: string;

  @ApiPropertyOptional({ description: "毛色ID" })
  @IsOptional()
  @IsString()
  coatColorId?: string;

  @ApiPropertyOptional({ description: "マイクロチップ番号" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  microchipNumber?: string;

  @ApiPropertyOptional({ description: "登録番号" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  registrationNumber?: string;

  @ApiPropertyOptional({ description: "説明・備考" })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: "施設内に在舎しているか" })
  @IsOptional()
  @IsBoolean()
  isInHouse?: boolean;

  @ApiPropertyOptional({ description: "父猫のID" })
  @IsOptional()
  @IsString()
  fatherId?: string;

  @ApiPropertyOptional({ description: "母猫のID" })
  @IsOptional()
  @IsString()
  motherId?: string;

  @ApiPropertyOptional({ description: "タグID配列" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}
