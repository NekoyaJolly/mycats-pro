import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  Prisma,
  TagAutomationEventType,
  TagAutomationRunStatus,
  TagAutomationTriggerType,
  TagAssignmentAction,
  TagAssignmentSource,
} from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import {
  CreateTagAutomationRuleDto,
  UpdateTagAutomationRuleDto,
} from "./dto";

export interface FindAutomationRuleOptions {
  isActive?: boolean;
  triggerTypes?: TagAutomationTriggerType[];
  eventTypes?: TagAutomationEventType[];
  scope?: string | null;
  includeRuns?: boolean;
  runsLimit?: number;
  includeHistoryCount?: boolean;
}

export interface FindAutomationRunOptions {
  ruleId?: string;
  statuses?: TagAutomationRunStatus[];
  take?: number;
}

export interface RecordAssignmentOptions {
  catId: string;
  tagId: string;
  action: TagAssignmentAction;
  source?: TagAssignmentSource;
  ruleId?: string;
  automationRunId?: string;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
  applyTagMutation?: boolean;
}

@Injectable()
export class TagAutomationService {
  constructor(private readonly prisma: PrismaService) {}

  async findRules(options: FindAutomationRuleOptions = {}) {
    const {
      isActive,
      triggerTypes,
      eventTypes,
      scope,
      includeRuns = false,
      runsLimit,
      includeHistoryCount = false,
    } = options;

    const where: Prisma.TagAutomationRuleWhereInput = {
      ...(isActive !== undefined ? { isActive } : {}),
      ...(triggerTypes && triggerTypes.length ? { triggerType: { in: triggerTypes } } : {}),
      ...(eventTypes && eventTypes.length ? { eventType: { in: eventTypes } } : {}),
      ...(scope === null
        ? { scope: null }
        : scope
          ? { OR: [{ scope }, { scope: null }] }
          : {}),
    };

    const include: Prisma.TagAutomationRuleInclude = {};

    if (includeRuns) {
      include.runs = {
        orderBy: { createdAt: "desc" },
        ...(runsLimit ? { take: runsLimit } : {}),
      };
    }

    if (includeHistoryCount) {
      include._count = { select: { history: true } };
    }

    const data = await this.prisma.tagAutomationRule.findMany({
      where,
      orderBy: [
        { priority: "desc" },
        { createdAt: "asc" },
      ],
      include: Object.keys(include).length ? include : undefined,
    });

    return { success: true, data };
  }

  async findRuleById(id: string, options: Omit<FindAutomationRuleOptions, "isActive"> = {}) {
    const { includeRuns = false, runsLimit, includeHistoryCount = false } = options;

    const include: Prisma.TagAutomationRuleInclude = {};

    if (includeRuns) {
      include.runs = {
        orderBy: { createdAt: "desc" },
        ...(runsLimit ? { take: runsLimit } : {}),
      };
    }

    if (includeHistoryCount) {
      include._count = { select: { history: true } };
    }

    const rule = await this.prisma.tagAutomationRule.findUnique({
      where: { id },
      include: Object.keys(include).length ? include : undefined,
    });

    if (!rule) {
      throw new NotFoundException("タグ自動化ルールが見つかりません");
    }

    return { success: true, data: rule };
  }

  async createRule(dto: CreateTagAutomationRuleDto) {
    const key = this.normalizeKey(dto.key ?? dto.name);

    try {
      const rule = await this.prisma.tagAutomationRule.create({
        data: {
          key,
          name: dto.name,
          description: dto.description ?? undefined,
          triggerType: dto.triggerType,
          eventType: dto.eventType,
          scope: dto.scope ?? undefined,
          isActive: dto.isActive ?? true,
          priority: dto.priority ?? 0,
          ...(dto.config !== undefined
            ? { config: this.toJson(dto.config) ?? Prisma.JsonNull }
            : {}),
        },
      });

      return { success: true, data: rule };
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new BadRequestException("同じキーを持つ自動化ルールが既に存在します");
      }
      throw error;
    }
  }

  async updateRule(id: string, dto: UpdateTagAutomationRuleDto) {
    const updateData: Prisma.TagAutomationRuleUpdateInput = {
      ...(dto.key ? { key: this.normalizeKey(dto.key) } : {}),
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.triggerType !== undefined ? { triggerType: dto.triggerType } : {}),
      ...(dto.eventType !== undefined ? { eventType: dto.eventType } : {}),
      ...(dto.scope !== undefined ? { scope: dto.scope } : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      ...(dto.priority !== undefined ? { priority: dto.priority } : {}),
      ...(dto.config !== undefined
        ? { config: this.toJson(dto.config) ?? Prisma.JsonNull }
        : {}),
    };

    try {
      const rule = await this.prisma.tagAutomationRule.update({
        where: { id },
        data: updateData,
      });
      return { success: true, data: rule };
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new BadRequestException("同じキーを持つ自動化ルールが既に存在します");
      }
      throw error;
    }
  }

  async setRuleActive(id: string, isActive: boolean) {
    const rule = await this.prisma.tagAutomationRule.update({
      where: { id },
      data: { isActive },
    });

    return { success: true, data: rule };
  }

  async deleteRule(id: string) {
    await this.prisma.tagAutomationRule.delete({ where: { id } });
    return { success: true };
  }

  async createRun(ruleId: string, eventPayload?: Record<string, unknown> | null) {
    const run = await this.prisma.tagAutomationRun.create({
      data: {
        ruleId,
        ...(eventPayload !== undefined
          ? { eventPayload: this.toJson(eventPayload) ?? Prisma.JsonNull }
          : {}),
        status: TagAutomationRunStatus.PENDING,
        startedAt: new Date(),
      },
    });

    return { success: true, data: run };
  }

  async markRunCompleted(runId: string, metadata?: { eventPayload?: Record<string, unknown> | null }) {
    const data: Prisma.TagAutomationRunUpdateInput = {
      status: TagAutomationRunStatus.COMPLETED,
      completedAt: new Date(),
      errorMessage: null,
    };

    if (metadata?.eventPayload !== undefined) {
      data.eventPayload = this.toJson(metadata.eventPayload) ?? Prisma.JsonNull;
    }

    const run = await this.prisma.tagAutomationRun.update({
      where: { id: runId },
      data,
    });

    return { success: true, data: run };
  }

  async markRunFailed(runId: string, errorMessage: string, options?: { eventPayload?: Record<string, unknown> | null }) {
    const data: Prisma.TagAutomationRunUpdateInput = {
      status: TagAutomationRunStatus.FAILED,
      completedAt: new Date(),
      errorMessage,
    };

    if (options?.eventPayload !== undefined) {
      data.eventPayload = this.toJson(options.eventPayload) ?? Prisma.JsonNull;
    }

    const run = await this.prisma.tagAutomationRun.update({
      where: { id: runId },
      data,
    });

    return { success: true, data: run };
  }

  async findRuns(options: FindAutomationRunOptions = {}) {
    const { ruleId, statuses, take } = options;

    const where: Prisma.TagAutomationRunWhereInput = {
      ...(ruleId ? { ruleId } : {}),
      ...(statuses && statuses.length ? { status: { in: statuses } } : {}),
    };

    const runs = await this.prisma.tagAutomationRun.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...(take ? { take } : {}),
    });

    return { success: true, data: runs };
  }

  async recordAssignment(options: RecordAssignmentOptions) {
    const {
      catId,
      tagId,
      action,
      source = TagAssignmentSource.AUTOMATION,
      ruleId,
      automationRunId,
      reason,
      metadata,
      applyTagMutation = false,
    } = options;

    const historyCreate = this.prisma.tagAssignmentHistory.create({
      data: {
        catId,
        tagId,
        action,
        source,
        reason: reason ?? undefined,
        ...(metadata !== undefined
          ? { metadata: this.toJson(metadata) ?? Prisma.JsonNull }
          : {}),
        ruleId: ruleId ?? undefined,
        automationRunId: automationRunId ?? undefined,
      },
    });

    if (!applyTagMutation) {
      const history = await historyCreate;
      return { success: true, data: history };
    }

    const operations: Prisma.PrismaPromise<unknown>[] = [];

    if (action === TagAssignmentAction.ASSIGNED) {
      operations.push(
        this.prisma.catTag.upsert({
          where: { catId_tagId: { catId, tagId } },
          update: {},
          create: { catId, tagId },
        }),
      );
    } else {
      operations.push(
        this.prisma.catTag.deleteMany({
          where: { catId, tagId },
        }),
      );
    }

    operations.push(historyCreate);

  const results = await this.prisma.$transaction(operations);
  const history = results[results.length - 1] as Awaited<typeof historyCreate>;

  return { success: true, data: history };
  }

  async getHistoryForCat(catId: string, options: { take?: number; tagId?: string } = {}) {
    const { take, tagId } = options;

    const history = await this.prisma.tagAssignmentHistory.findMany({
      where: {
        catId,
        ...(tagId ? { tagId } : {}),
      },
      orderBy: { createdAt: "desc" },
      ...(take ? { take } : {}),
      include: {
        tag: true,
        rule: true,
        automationRun: true,
      },
    });

    return { success: true, data: history };
  }

  private normalizeKey(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  private toJson(value?: Record<string, unknown> | null): Prisma.InputJsonValue | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    return value as Prisma.InputJsonValue;
  }

  private isUniqueConstraintViolation(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    );
  }
}
