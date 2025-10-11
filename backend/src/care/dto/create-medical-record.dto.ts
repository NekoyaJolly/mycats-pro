import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  MedicalRecordStatus,
  MedicalVisitType,
} from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from "class-validator";

class MedicalRecordMedicationDto {
  @ApiProperty({ example: "抗生物質" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: "朝晩 1 錠" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  dosage?: string;
}

class MedicalRecordSymptomDto {
  @ApiProperty({ example: "くしゃみ" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  label!: string;

  @ApiPropertyOptional({ example: "1週間ほど続いている" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}

class MedicalRecordAttachmentInputDto {
  @ApiProperty({ example: "https://cdn.example.com/xray.png" })
  @IsString()
  @IsNotEmpty()
  url!: string;

  @ApiPropertyOptional({ example: "胸部レントゲン" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiPropertyOptional({ example: "xray.png" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  fileName?: string;

  @ApiPropertyOptional({ example: "image/png" })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fileType?: string;

  @ApiPropertyOptional({ example: 204800 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  fileSize?: number;

  @ApiPropertyOptional({ example: "2025-08-10T09:30:00.000Z" })
  @IsOptional()
  @IsDateString()
  capturedAt?: string;
}

export class CreateMedicalRecordDto {
  @ApiProperty({ description: "猫ID", example: "e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60" })
  @IsUUID()
  catId!: string;

  @ApiPropertyOptional({ description: "スケジュールID", example: "a6f7e52f-4a3b-4a76-9870-1234567890ab" })
  @IsOptional()
  @IsUUID()
  scheduleId?: string;

  @ApiProperty({ description: "受診日", example: "2025-08-10" })
  @IsDateString()
  visitDate!: string;

  @ApiPropertyOptional({ enum: MedicalVisitType, example: MedicalVisitType.CHECKUP })
  @IsOptional()
  @IsEnum(MedicalVisitType)
  visitType?: MedicalVisitType;

  @ApiPropertyOptional({ example: "ねこクリニック東京" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  clinicName?: string;

  @ApiPropertyOptional({ example: "佐藤 獣医師" })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  veterinarianName?: string;

  @ApiPropertyOptional({ example: "くしゃみが止まらない" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  symptomSummary?: string;

  @ApiPropertyOptional({ type: [MedicalRecordSymptomDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicalRecordSymptomDto)
  symptomDetails?: MedicalRecordSymptomDto[];

  @ApiPropertyOptional({ example: "猫風邪の兆候" })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ example: "抗生物質を5日間投与" })
  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @ApiPropertyOptional({ type: [MedicalRecordMedicationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicalRecordMedicationDto)
  medications?: MedicalRecordMedicationDto[];

  @ApiPropertyOptional({ example: "3日後に経過観察" })
  @IsOptional()
  @IsString()
  followUpAction?: string;

  @ApiPropertyOptional({ example: "2025-08-13" })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiPropertyOptional({ enum: MedicalRecordStatus, example: MedicalRecordStatus.ACTIVE })
  @IsOptional()
  @IsEnum(MedicalRecordStatus)
  status?: MedicalRecordStatus;

  @ApiPropertyOptional({ example: "食欲も戻りつつあり" })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: "関連ケアタグID", type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  careTagIds?: string[];

  @ApiPropertyOptional({
    description: "添付ファイル",
    type: [MedicalRecordAttachmentInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicalRecordAttachmentInputDto)
  attachments?: MedicalRecordAttachmentInputDto[];
}

export type MedicalRecordMedicationInput = MedicalRecordMedicationDto;
export type MedicalRecordSymptomInput = MedicalRecordSymptomDto;
export type MedicalRecordAttachmentInput = MedicalRecordAttachmentInputDto;
