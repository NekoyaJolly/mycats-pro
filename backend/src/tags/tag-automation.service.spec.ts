import { BadRequestException } from "@nestjs/common";
import {
  Prisma,
  TagAssignmentAction,
  TagAssignmentSource,
  TagAutomationEventType,
  TagAutomationTriggerType,
} from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { TagAutomationService } from "./tag-automation.service";

describe("TagAutomationService", () => {
  let service: TagAutomationService;
  let prismaMock: {
    tagAutomationRule: {
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    tagAutomationRun: {
      create: jest.Mock;
      update: jest.Mock;
      findMany: jest.Mock;
    };
    tagAssignmentHistory: {
      create: jest.Mock;
      findMany: jest.Mock;
    };
    catTag: {
      upsert: jest.Mock;
      deleteMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(() => {
    prismaMock = {
      tagAutomationRule: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      tagAutomationRun: {
        create: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      tagAssignmentHistory: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      catTag: {
        upsert: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn((operations: Array<Promise<unknown>>) => Promise.all(operations)),
    };

    service = new TagAutomationService(prismaMock as unknown as PrismaService);
  });

  describe("createRule", () => {
    it("normalizes key when not provided", async () => {
      const rule = {
        id: "rule-1",
        key: "auto-tag-test-rule",
        name: "Auto Tag Test Rule",
        description: null,
        triggerType: TagAutomationTriggerType.EVENT,
        eventType: TagAutomationEventType.CUSTOM,
        scope: null,
        isActive: true,
        priority: 0,
        config: Prisma.JsonNull,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaMock.tagAutomationRule.create.mockResolvedValue(rule);

      const result = await service.createRule({
        name: "Auto Tag Test Rule",
        triggerType: TagAutomationTriggerType.EVENT,
        eventType: TagAutomationEventType.CUSTOM,
      });

      expect(prismaMock.tagAutomationRule.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          key: "auto-tag-test-rule",
          name: "Auto Tag Test Rule",
          priority: 0,
        }),
      });
      expect(result.data).toEqual(rule);
    });

    it("throws BadRequestException on unique key violation", async () => {
      const error = new Prisma.PrismaClientKnownRequestError("Unique violation", {
        code: "P2002",
        clientVersion: "6.16.2",
      });
      prismaMock.tagAutomationRule.create.mockRejectedValue(error);

      await expect(
        service.createRule({
          key: "duplicate",
          name: "Duplicate",
          triggerType: TagAutomationTriggerType.EVENT,
          eventType: TagAutomationEventType.CUSTOM,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe("recordAssignment", () => {
    it("records history and upserts cat tag when assigning", async () => {
      const historyRecord = {
        id: "history-1",
        catId: "cat-1",
        tagId: "tag-1",
        ruleId: null,
        automationRunId: null,
        action: TagAssignmentAction.ASSIGNED,
        source: TagAssignmentSource.AUTOMATION,
        reason: null,
        metadata: Prisma.JsonNull,
        createdAt: new Date(),
      };
      prismaMock.catTag.upsert.mockResolvedValue({});
      prismaMock.tagAssignmentHistory.create.mockReturnValue(Promise.resolve(historyRecord));

      const result = await service.recordAssignment({
        catId: "cat-1",
        tagId: "tag-1",
        action: TagAssignmentAction.ASSIGNED,
        applyTagMutation: true,
      });

      expect(prismaMock.catTag.upsert).toHaveBeenCalledWith({
        where: { catId_tagId: { catId: "cat-1", tagId: "tag-1" } },
        update: {},
        create: { catId: "cat-1", tagId: "tag-1" },
      });
      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(result.data).toEqual(historyRecord);
    });
  });
});
