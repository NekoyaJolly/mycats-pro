import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  MedicalRecordStatus,
  MedicalVisitType,
} from "@prisma/client";

class MedicalRecordCatDto {
  @ApiProperty({ example: "e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60" })
  id!: string;

  @ApiProperty({ example: "ミケ" })
  name!: string;
}

class MedicalRecordScheduleDto {
  @ApiProperty({ example: "a6f7e52f-4a3b-4a76-9870-1234567890ab" })
  id!: string;

  @ApiProperty({ example: "ワクチン接種" })
  name!: string;
}

class MedicalRecordTagDto {
  @ApiProperty({ example: "tag-123" })
  id!: string;

  @ApiProperty({ example: "vaccination" })
  slug!: string;

  @ApiProperty({ example: "ワクチン" })
  label!: string;

  @ApiProperty({ example: 1 })
  level!: number;

  @ApiPropertyOptional({ example: "parent-tag" })
  parentId!: string | null;
}

class MedicalRecordAttachmentDto {
  @ApiProperty({ example: "https://cdn.example.com/xray.png" })
  url!: string;

  @ApiPropertyOptional({ example: "胸部レントゲン" })
  description!: string | null;

  @ApiPropertyOptional({ example: "xray.png" })
  fileName!: string | null;

  @ApiPropertyOptional({ example: "image/png" })
  fileType!: string | null;

  @ApiPropertyOptional({ example: 204800 })
  fileSize!: number | null;

  @ApiPropertyOptional({ example: "2025-08-10T09:30:00.000Z" })
  capturedAt!: string | null;
}

class MedicalRecordMedicationDto {
  @ApiProperty({ example: "抗生物質" })
  name!: string;

  @ApiPropertyOptional({ example: "朝晩1錠" })
  dosage!: string | null;
}

class MedicalRecordSymptomDto {
  @ApiProperty({ example: "くしゃみ" })
  label!: string;

  @ApiPropertyOptional({ example: "1週間継続" })
  note!: string | null;
}

export class MedicalRecordItemDto {
  @ApiProperty({ example: "bcdef123-4567-890a-bcde-f1234567890a" })
  id!: string;

  @ApiProperty({ example: "2025-08-10T00:00:00.000Z" })
  visitDate!: string;

  @ApiProperty({ enum: MedicalVisitType, example: MedicalVisitType.CHECKUP, nullable: true })
  visitType!: MedicalVisitType | null;

  @ApiPropertyOptional({ example: "ねこクリニック東京" })
  clinicName!: string | null;

  @ApiPropertyOptional({ example: "佐藤 獣医師" })
  veterinarianName!: string | null;

  @ApiPropertyOptional({ example: "くしゃみが止まらない" })
  symptomSummary!: string | null;

  @ApiPropertyOptional({ type: [MedicalRecordSymptomDto] })
  symptomDetails!: MedicalRecordSymptomDto[];

  @ApiPropertyOptional({ example: "猫風邪" })
  diagnosis!: string | null;

  @ApiPropertyOptional({ example: "抗生物質を5日間投与" })
  treatmentPlan!: string | null;

  @ApiPropertyOptional({ type: [MedicalRecordMedicationDto] })
  medications!: MedicalRecordMedicationDto[];

  @ApiPropertyOptional({ example: "3日後に経過観察" })
  followUpAction!: string | null;

  @ApiPropertyOptional({ example: "2025-08-13T00:00:00.000Z" })
  followUpDate!: string | null;

  @ApiProperty({ enum: MedicalRecordStatus, example: MedicalRecordStatus.ACTIVE })
  status!: MedicalRecordStatus;

  @ApiPropertyOptional({ example: "食欲は戻ってきた" })
  notes!: string | null;

  @ApiProperty({ type: MedicalRecordCatDto })
  cat!: MedicalRecordCatDto;

  @ApiPropertyOptional({ type: MedicalRecordScheduleDto, nullable: true })
  schedule!: MedicalRecordScheduleDto | null;

  @ApiProperty({ type: [MedicalRecordTagDto] })
  tags!: MedicalRecordTagDto[];

  @ApiProperty({ type: [MedicalRecordAttachmentDto] })
  attachments!: MedicalRecordAttachmentDto[];

  @ApiProperty({ example: "f3a2c1d7-1234-5678-90ab-cdef12345678" })
  recordedBy!: string;

  @ApiProperty({ example: "2025-08-10T09:30:00.000Z" })
  createdAt!: string;

  @ApiProperty({ example: "2025-08-15T12:34:56.000Z" })
  updatedAt!: string;
}

export class MedicalRecordMetaDto {
  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

export class MedicalRecordResponseDto {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({ type: MedicalRecordItemDto })
  data!: MedicalRecordItemDto;
}

export class MedicalRecordListResponseDto {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({ type: [MedicalRecordItemDto] })
  data!: MedicalRecordItemDto[];

  @ApiProperty({ type: MedicalRecordMetaDto })
  meta!: MedicalRecordMetaDto;
}

export type MedicalRecordMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type MedicalRecordData = {
  id: string;
  visitDate: string;
  visitType: MedicalVisitType | null;
  clinicName: string | null;
  veterinarianName: string | null;
  symptomSummary: string | null;
  symptomDetails: { label: string; note: string | null }[];
  diagnosis: string | null;
  treatmentPlan: string | null;
  medications: { name: string; dosage: string | null }[];
  followUpAction: string | null;
  followUpDate: string | null;
  status: MedicalRecordStatus;
  notes: string | null;
  cat: { id: string; name: string };
  schedule: { id: string; name: string } | null;
  tags: { id: string; slug: string; label: string; level: number; parentId: string | null }[];
  attachments: {
    url: string;
    description: string | null;
    fileName: string | null;
    fileType: string | null;
    fileSize: number | null;
    capturedAt: string | null;
  }[];
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type MedicalRecordResponse = {
  success: true;
  data: MedicalRecordData;
};

export type MedicalRecordListResponse = {
  success: true;
  data: MedicalRecordData[];
  meta: MedicalRecordMeta;
};
