import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
  IsNumber,
} from "class-validator";

export enum CatGender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export class CreateCatDto {
  @ApiProperty({ description: "登録ID", example: "REG-ALPHA" })
  @IsString()
  @MaxLength(100)
  registrationId: string;

  @ApiProperty({ description: "猫の名前", example: "Alpha" })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: "品種ID" })
  @IsOptional()
  @IsString()
  breedId?: string;

  @ApiPropertyOptional({ description: "毛色ID" })
  @IsOptional()
  @IsString()
  colorId?: string;

  @ApiPropertyOptional({ description: "パターン" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  pattern?: string;

  @ApiProperty({
    description: "性別",
    enum: CatGender,
    example: CatGender.MALE,
  })
  @IsEnum(CatGender)
  gender: CatGender;

  @ApiProperty({ description: "生年月日", example: "2024-05-01" })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional({ description: "体重 (kg)" })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight?: number;

  @ApiPropertyOptional({ description: "マイクロチップID" })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  microchipId?: string;

  @ApiProperty({ description: "オーナーID", example: "owner-uuid-1234" })
  @IsString()
  ownerId: string;

  @ApiPropertyOptional({ description: "父猫のID" })
  @IsOptional()
  @IsString()
  fatherId?: string;

  @ApiPropertyOptional({ description: "母猫のID" })
  @IsOptional()
  @IsString()
  motherId?: string;

  @ApiPropertyOptional({ description: "写真URL" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({ description: "備考" })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
