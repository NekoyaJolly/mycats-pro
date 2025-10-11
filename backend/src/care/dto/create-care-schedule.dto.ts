import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  CareType,
  Priority,
  ReminderChannel,
  ReminderOffsetUnit,
  ReminderRelativeTo,
  ReminderRepeatFrequency,
  ReminderTimingType,
} from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";

class ScheduleReminderDto {
  @ApiProperty({ enum: ReminderTimingType })
  @IsEnum(ReminderTimingType)
  timingType!: ReminderTimingType;

  @ApiPropertyOptional({
    description: "指定日時 (ISO8601)",
    example: "2025-08-01T09:00:00.000Z",
  })
  @ValidateIf((o) => o.timingType === ReminderTimingType.ABSOLUTE)
  @IsDateString()
  remindAt?: string;

  @ApiPropertyOptional({ description: "相対リマインドの値", example: 2 })
  @ValidateIf((o) => o.timingType === ReminderTimingType.RELATIVE)
  @IsInt()
  @Min(0)
  offsetValue?: number;

  @ApiPropertyOptional({ enum: ReminderOffsetUnit, example: ReminderOffsetUnit.DAY })
  @ValidateIf((o) => o.timingType === ReminderTimingType.RELATIVE)
  @IsEnum(ReminderOffsetUnit)
  offsetUnit?: ReminderOffsetUnit;

  @ApiPropertyOptional({ enum: ReminderRelativeTo, example: ReminderRelativeTo.START_DATE })
  @ValidateIf((o) => o.timingType === ReminderTimingType.RELATIVE)
  @IsEnum(ReminderRelativeTo)
  relativeTo?: ReminderRelativeTo;

  @ApiProperty({ enum: ReminderChannel, example: ReminderChannel.IN_APP })
  @IsEnum(ReminderChannel)
  channel!: ReminderChannel;

  @ApiPropertyOptional({
    enum: ReminderRepeatFrequency,
    example: ReminderRepeatFrequency.NONE,
  })
  @IsOptional()
  @IsEnum(ReminderRepeatFrequency)
  repeatFrequency?: ReminderRepeatFrequency;

  @ApiPropertyOptional({ description: "繰り返し間隔", example: 1 })
  @ValidateIf((o) =>
    o.repeatFrequency && o.repeatFrequency !== ReminderRepeatFrequency.NONE,
  )
  @IsInt()
  @IsPositive()
  repeatInterval?: number;

  @ApiPropertyOptional({ description: "繰り返し回数", example: 5 })
  @ValidateIf((o) =>
    o.repeatFrequency && o.repeatFrequency !== ReminderRepeatFrequency.NONE,
  )
  @IsInt()
  @IsPositive()
  repeatCount?: number;

  @ApiPropertyOptional({ description: "繰り返し終了日時", example: "2025-12-31T00:00:00.000Z" })
  @ValidateIf((o) =>
    o.repeatFrequency && o.repeatFrequency !== ReminderRepeatFrequency.NONE,
  )
  @IsDateString()
  repeatUntil?: string;

  @ApiPropertyOptional({ description: "備考", example: "前日9時に通知" })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;

  @ApiPropertyOptional({ description: "有効フラグ", example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateCareScheduleDto {
  @ApiProperty({
    description: "猫ID",
    example: "e7b6a7a7-2d7f-4b2f-9f3a-1c2b3d4e5f60",
  })
  @IsUUID()
  catId: string;

  @ApiProperty({ description: "ケア名", example: "年次健康診断" })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiProperty({
    description: "ケア種別",
    enum: CareType,
    example: CareType.HEALTH_CHECK,
  })
  @IsEnum(CareType)
  careType: CareType;

  @ApiProperty({ description: "予定日 (ISO8601)", example: "2025-09-01" })
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional({ description: "終了日時 (ISO8601)", example: "2025-09-01T10:00:00.000Z" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: "タイムゾーン", example: "Asia/Tokyo" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  timezone?: string;

  @ApiPropertyOptional({
    description: "ケア名/詳細",
    example: "健康診断 (年1回)",
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: Priority, example: Priority.MEDIUM })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({
    description: "RRULE形式などの繰り返しルール",
    example: "FREQ=YEARLY;INTERVAL=1",
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  recurrenceRule?: string;

  @ApiPropertyOptional({
    type: [ScheduleReminderDto],
    description: "リマインダー設定",
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleReminderDto)
  reminders?: ScheduleReminderDto[];

  @ApiPropertyOptional({
    description: "関連ケアタグID (最大3階層)",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  careTagIds?: string[];
}

export type ScheduleReminderInput = ScheduleReminderDto;
