import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  CareType,
  Priority,
  ReminderChannel,
  ReminderOffsetUnit,
  ReminderRelativeTo,
  ReminderRepeatFrequency,
  ReminderTimingType,
  ScheduleStatus,
  ScheduleType,
} from "@prisma/client";

class CareScheduleCatDto {
  @ApiProperty({ example: "e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60" })
  id!: string;

  @ApiProperty({ example: "レオ" })
  name!: string;
}

class CareScheduleReminderDto {
  @ApiProperty({ example: "f1e2d3c4-b5a6-7890-1234-56789abcdef0" })
  id!: string;

  @ApiProperty({ enum: ReminderTimingType, example: ReminderTimingType.ABSOLUTE })
  timingType!: ReminderTimingType;

  @ApiPropertyOptional({ example: "2025-08-01T09:00:00.000Z" })
  remindAt!: string | null;

  @ApiPropertyOptional({ example: 2 })
  offsetValue!: number | null;

  @ApiPropertyOptional({ enum: ReminderOffsetUnit, example: ReminderOffsetUnit.DAY })
  offsetUnit!: ReminderOffsetUnit | null;

  @ApiPropertyOptional({ enum: ReminderRelativeTo, example: ReminderRelativeTo.START_DATE })
  relativeTo!: ReminderRelativeTo | null;

  @ApiProperty({ enum: ReminderChannel, example: ReminderChannel.IN_APP })
  channel!: ReminderChannel;

  @ApiPropertyOptional({
    enum: ReminderRepeatFrequency,
    example: ReminderRepeatFrequency.NONE,
  })
  repeatFrequency!: ReminderRepeatFrequency | null;

  @ApiPropertyOptional({ example: 1 })
  repeatInterval!: number | null;

  @ApiPropertyOptional({ example: 5 })
  repeatCount!: number | null;

  @ApiPropertyOptional({ example: "2025-12-31T00:00:00.000Z" })
  repeatUntil!: string | null;

  @ApiPropertyOptional({ example: "前日9時に通知" })
  notes!: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

class CareScheduleTagDto {
  @ApiProperty({ example: "a1b2c3d4-5678-90ab-cdef-1234567890ab" })
  id!: string;

  @ApiProperty({ example: "vaccination" })
  slug!: string;

  @ApiProperty({ example: "ワクチン" })
  label!: string;

  @ApiProperty({ example: 1 })
  level!: number;

  @ApiPropertyOptional({ example: "parent-tag-id" })
  parentId!: string | null;
}

export class CareScheduleItemDto {
  @ApiProperty({ example: "a6f7e52f-4a3b-4a76-9870-1234567890ab" })
  id!: string;

  @ApiProperty({ example: "年次健康診断" })
  name!: string;

  @ApiProperty({ example: "年次健康診断" })
  title!: string;

  @ApiProperty({ example: "毎年の定期健診" })
  description!: string | null;

  @ApiProperty({ example: "2025-09-01T00:00:00.000Z" })
  scheduleDate!: string;

  @ApiPropertyOptional({ example: "2025-09-01T01:00:00.000Z" })
  endDate!: string | null;

  @ApiPropertyOptional({ example: "Asia/Tokyo" })
  timezone!: string | null;

  @ApiProperty({ enum: ScheduleType, example: ScheduleType.CARE })
  scheduleType!: ScheduleType;

  @ApiProperty({ enum: ScheduleStatus, example: ScheduleStatus.PENDING })
  status!: ScheduleStatus;

  @ApiProperty({ enum: CareType, example: CareType.HEALTH_CHECK, nullable: true })
  careType!: CareType | null;

  @ApiProperty({ enum: Priority, example: Priority.MEDIUM })
  priority!: Priority;

  @ApiPropertyOptional({ example: "FREQ=YEARLY;INTERVAL=1" })
  recurrenceRule!: string | null;

  @ApiProperty({ example: "f3a2c1d7-1234-5678-90ab-cdef12345678" })
  assignedTo!: string;

  @ApiProperty({ type: CareScheduleCatDto, nullable: true })
  cat!: CareScheduleCatDto | null;

  @ApiProperty({ type: [CareScheduleReminderDto] })
  reminders!: CareScheduleReminderDto[];

  @ApiProperty({ type: [CareScheduleTagDto] })
  tags!: CareScheduleTagDto[];

  @ApiProperty({ example: "2025-08-01T00:00:00.000Z" })
  createdAt!: string;

  @ApiProperty({ example: "2025-08-15T12:34:56.000Z" })
  updatedAt!: string;
}

export class CareScheduleMetaDto {
  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

export class CareScheduleResponseDto {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({ type: CareScheduleItemDto })
  data!: CareScheduleItemDto;
}

export class CareScheduleListResponseDto {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({ type: [CareScheduleItemDto] })
  data!: CareScheduleItemDto[];

  @ApiProperty({ type: CareScheduleMetaDto })
  meta!: CareScheduleMetaDto;
}

export class CareCompleteResponseDto {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({
    example: {
      scheduleId: "a6f7e52f-4a3b-4a76-9870-1234567890ab",
      recordId: "bcdef123-4567-890a-bcde-f1234567890a",
      medicalRecordId: "f1234567-89ab-cdef-0123-456789abcdef",
    },
  })
  data!: {
    scheduleId: string;
    recordId: string;
    medicalRecordId?: string | null;
  };
}

export type CareScheduleMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type CareScheduleData = {
  id: string;
  name: string;
  title: string;
  description: string | null;
  scheduleDate: string;
  endDate: string | null;
  timezone: string | null;
  scheduleType: ScheduleType;
  status: ScheduleStatus;
  careType: CareType | null;
  priority: Priority;
  recurrenceRule: string | null;
  assignedTo: string;
  cat: { id: string; name: string } | null;
  reminders: {
    id: string;
    timingType: ReminderTimingType;
    remindAt: string | null;
    offsetValue: number | null;
    offsetUnit: ReminderOffsetUnit | null;
    relativeTo: ReminderRelativeTo | null;
    channel: ReminderChannel;
    repeatFrequency: ReminderRepeatFrequency | null;
    repeatInterval: number | null;
    repeatCount: number | null;
    repeatUntil: string | null;
    notes: string | null;
    isActive: boolean;
  }[];
  tags: {
    id: string;
    slug: string;
    label: string;
    level: number;
    parentId: string | null;
  }[];
  createdAt: string;
  updatedAt: string;
};

export type CareScheduleResponse = {
  success: true;
  data: CareScheduleData;
};

export type CareScheduleListResponse = {
  success: true;
  data: CareScheduleData[];
  meta: CareScheduleMeta;
};
