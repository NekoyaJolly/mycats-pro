import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma, TagCategory } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { CreateTagCategoryDto } from "./dto/create-tag-category.dto";
import { UpdateTagCategoryDto } from "./dto/update-tag-category.dto";

interface FindManyOptions {
  scopes?: string[];
  includeGroups?: boolean;
  includeInactive?: boolean;
}

type TagCategoryWithGroups = Prisma.TagCategoryGetPayload<{
  include: {
    groups: {
      include: {
        tags: {
          include: {
            cats: {
              select: { catId: true };
            };
          };
        };
      };
    };
  };
}>;

@Injectable()
export class TagCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(options: FindManyOptions & { includeGroups: true }): Promise<TagCategoryWithGroups[]>;
  async findMany(options?: FindManyOptions): Promise<TagCategory[]>;
  async findMany(options: FindManyOptions = {}) {
    const { scopes, includeGroups = false, includeInactive = false } = options;

    const whereClause: Prisma.TagCategoryWhereInput = {
      ...(includeInactive ? {} : { isActive: true }),
      ...((scopes && scopes.length > 0)
        ? {
            OR: [
              { scopes: { hasSome: scopes } },
              { scopes: { equals: [] as string[] } },
            ],
          }
        : {}),
    };

    const args: Prisma.TagCategoryFindManyArgs = {
      where: whereClause,
      orderBy: [
        { displayOrder: "asc" },
        { name: "asc" },
      ],
      include: includeGroups
        ? {
            groups: {
              where: includeInactive ? {} : { isActive: true },
              include: {
                tags: {
                  where: includeInactive ? {} : { isActive: true },
                  include: {
                    cats: {
                      select: { catId: true },
                    },
                  },
                  orderBy: [
                    { displayOrder: "asc" },
                    { name: "asc" },
                  ],
                },
              },
              orderBy: [
                { displayOrder: "asc" },
                { name: "asc" },
              ],
            },
          }
        : undefined,
    };

    if (includeGroups) {
      return this.prisma.tagCategory.findMany(args) as Promise<TagCategoryWithGroups[]>;
    }

    return this.prisma.tagCategory.findMany(args);
  }

  async create(dto: CreateTagCategoryDto) {
    const key = this.normalizeKey(dto.key ?? dto.name);
    const displayOrder = dto.displayOrder ?? (await this.getNextDisplayOrder());

    try {
      const data = await this.prisma.tagCategory.create({
        data: {
          key,
          name: dto.name,
          description: dto.description ?? undefined,
          color: dto.color ?? undefined,
          displayOrder,
          scopes: dto.scopes ?? [],
          isActive: dto.isActive ?? true,
        },
      });
      return { success: true, data };
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new BadRequestException("同じキーを持つカテゴリが既に存在します");
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateTagCategoryDto) {
    const data = await this.prisma.tagCategory.update({
      where: { id },
      data: {
        ...(dto.key ? { key: this.normalizeKey(dto.key) } : {}),
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.color !== undefined ? { color: dto.color } : {}),
        ...(dto.displayOrder !== undefined ? { displayOrder: dto.displayOrder } : {}),
        ...(dto.scopes !== undefined ? { scopes: dto.scopes } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
    return { success: true, data };
  }

  async remove(id: string) {
    await this.prisma.tagCategory.delete({ where: { id } });
    return { success: true };
  }

  async reorder(items: Array<{ id: string; displayOrder: number }>) {
    if (!items.length) {
      return { success: true };
    }

    await this.prisma.$transaction(
      items.map(({ id, displayOrder }) =>
        this.prisma.tagCategory.update({ where: { id }, data: { displayOrder } }),
      ),
    );

    return { success: true };
  }

  private normalizeKey(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  private isUniqueConstraintViolation(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    );
  }

  private async getNextDisplayOrder(): Promise<number> {
    const result = await this.prisma.tagCategory.aggregate({
      _max: { displayOrder: true },
    });
    return (result._max.displayOrder ?? -1) + 1;
  }
}
