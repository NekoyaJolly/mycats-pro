import { TagAutomationEventType, TagAutomationTriggerType } from "@prisma/client";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class CreateTagAutomationRuleDto {
  @IsOptional()
  @IsString()
  key?: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsEnum(TagAutomationTriggerType)
  triggerType!: TagAutomationTriggerType;

  @IsEnum(TagAutomationEventType)
  eventType!: TagAutomationEventType;

  @IsOptional()
  @IsString()
  scope?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(-100)
  @Max(100)
  priority?: number;

  @IsOptional()
  config?: Record<string, unknown> | null;
}
