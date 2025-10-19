import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateBreedingDto {
  @ApiProperty({
    description: "メス猫のID",
    example: "11111111-1111-1111-1111-111111111111",
  })
  @IsUUID()
  femaleId: string;

  @ApiProperty({
    description: "オス猫のID",
    example: "22222222-2222-2222-2222-222222222222",
  })
  @IsUUID()
  maleId: string;

  @ApiProperty({ description: "交配日", example: "2025-08-01" })
  @IsDateString()
  breedingDate: string;

  @ApiPropertyOptional({
    description: "出産予定日 (YYYY-MM-DD)",
    example: "2025-10-01",
  })
  @IsOptional()
  @IsDateString()
  expectedDueDate?: string;

  @ApiPropertyOptional({ description: "メモ", example: "初回の交配。" })
  @IsOptional()
  @IsString()
  notes?: string;
}
