import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString } from "class-validator";

export class CompleteCareDto {
  @ApiPropertyOptional({
    description: "完了日 (YYYY-MM-DD)",
    example: "2025-08-10",
  })
  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @ApiPropertyOptional({
    description: "次回予定日 (YYYY-MM-DD)",
    example: "2026-08-10",
  })
  @IsOptional()
  @IsDateString()
  nextScheduledDate?: string;

  @ApiPropertyOptional({
    description: "メモ",
    example: "体調良好。次回はワクチンA。",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
