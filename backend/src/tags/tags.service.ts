import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { CreateTagDto, UpdateTagDto } from "./dto";
import { TagCategoriesService } from "./tag-categories.service";

@Injectable()
export class TagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tagCategoriesService: TagCategoriesService,
  ) {}

  async findAll(options: { scopes?: string[]; includeInactive?: boolean } = {}) {
    const categories = await this.tagCategoriesService.findMany({
      scopes: options.scopes,
      includeGroups: true,
      includeInactive: options.includeInactive,
    });

    return {
      success: true,
      data: categories.map((category) => ({
        id: category.id,
        key: category.key,
        name: category.name,
        description: category.description ?? undefined,
        color: category.color ?? undefined,
        displayOrder: category.displayOrder,
        scopes: category.scopes,
        isActive: category.isActive,
        groups: (category.groups ?? []).map((group) => ({
          id: group.id,
          categoryId: group.categoryId,
          name: group.name,
          description: group.description ?? undefined,
          displayOrder: group.displayOrder,
          isActive: group.isActive,
          tags: (group.tags ?? []).map((tag) => ({
            id: tag.id,
            groupId: tag.groupId,
            categoryId: group.categoryId,
            name: tag.name,
            color: tag.color,
            description: tag.description ?? undefined,
            displayOrder: tag.displayOrder,
            allowsManual: tag.allowsManual,
            allowsAutomation: tag.allowsAutomation,
            metadata: tag.metadata ?? undefined,
            isActive: tag.isActive,
            usageCount: tag.cats.length,
          })),
        })),
      })),
    };
  }

  async create(dto: CreateTagDto) {
    const displayOrder = dto.displayOrder ?? (await this.getNextDisplayOrder(dto.groupId));
    const data = await this.prisma.tag.create({
      data: {
        group: { connect: { id: dto.groupId } },
        name: dto.name,
        color: dto.color ?? undefined,
        description: dto.description ?? undefined,
        displayOrder,
        ...(dto.allowsManual !== undefined ? { allowsManual: dto.allowsManual } : {}),
        ...(dto.allowsAutomation !== undefined
          ? { allowsAutomation: dto.allowsAutomation }
          : {}),
        metadata: this.toJson(dto.metadata),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: this.defaultTagInclude(),
    });

    return { success: true, data };
  }

  async update(id: string, dto: UpdateTagDto) {
    const updateData: Prisma.TagUpdateInput = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.color !== undefined ? { color: dto.color } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.displayOrder !== undefined ? { displayOrder: dto.displayOrder } : {}),
      ...(dto.metadata !== undefined
        ? { metadata: this.toJson(dto.metadata) ?? Prisma.JsonNull }
        : {}),
      ...(dto.groupId ? { group: { connect: { id: dto.groupId } } } : {}),
      ...(dto.allowsManual !== undefined ? { allowsManual: dto.allowsManual } : {}),
      ...(dto.allowsAutomation !== undefined
        ? { allowsAutomation: dto.allowsAutomation }
        : {}),
      ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
    };

    const data = await this.prisma.tag.update({
      where: { id },
      data: updateData,
      include: this.defaultTagInclude(),
    });

    return { success: true, data };
  }

  async remove(id: string) {
    await this.prisma.tag.delete({ where: { id } });
    return { success: true };
  }

  async reorder(items: Array<{ id: string; displayOrder: number; groupId?: string }>) {
    if (!items.length) {
      return { success: true };
    }

    await this.prisma.$transaction(
      items.map(({ id, displayOrder, groupId }) =>
        this.prisma.tag.update({
          where: { id },
          data: {
            displayOrder,
            ...(groupId ? { group: { connect: { id: groupId } } } : {}),
          },
        }),
      ),
    );

    return { success: true };
  }

  async assignToCat(catId: string, tagId: string) {
    try {
      await this.prisma.catTag.create({ data: { catId, tagId } });
    } catch {
      // Unique constraint (already assigned) -> return success idempotently
    }
    return { success: true };
  }

  async unassignFromCat(catId: string, tagId: string) {
    await this.prisma.catTag.delete({
      where: { catId_tagId: { catId, tagId } },
    });
    return { success: true };
  }

  private defaultTagInclude(): Prisma.TagInclude {
    return {
      cats: {
        select: { catId: true },
      },
    };
  }

  private toJson(value?: Record<string, unknown> | null): Prisma.InputJsonValue | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }

    return value as Prisma.InputJsonValue;
  }

  private async getNextDisplayOrder(groupId: string): Promise<number> {
    const result = await this.prisma.tag.aggregate({
      _max: { displayOrder: true },
      where: { groupId },
    });
    return (result._max.displayOrder ?? -1) + 1;
  }
}
