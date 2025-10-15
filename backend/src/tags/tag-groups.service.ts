import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { CreateTagGroupDto } from "./dto/create-tag-group.dto";
import { UpdateTagGroupDto } from "./dto/update-tag-group.dto";

@Injectable()
export class TagGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTagGroupDto) {
    const displayOrder = dto.displayOrder ?? (await this.getNextDisplayOrder(dto.categoryId));

    try {
      const data = await this.prisma.tagGroup.create({
        data: {
          category: { connect: { id: dto.categoryId } },
          name: dto.name,
          description: dto.description ?? undefined,
          color: dto.color ?? undefined,
          textColor: dto.textColor ?? undefined,
          displayOrder,
          isActive: dto.isActive ?? true,
        },
      });
      return { success: true, data };
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new BadRequestException("同じ名称のグループが既に存在します");
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateTagGroupDto) {
    try {
      const data = await this.prisma.tagGroup.update({
        where: { id },
        data: {
          ...(dto.categoryId ? { category: { connect: { id: dto.categoryId } } } : {}),
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.description !== undefined ? { description: dto.description } : {}),
          ...(dto.color !== undefined ? { color: dto.color } : {}),
          ...(dto.textColor !== undefined ? { textColor: dto.textColor } : {}),
          ...(dto.displayOrder !== undefined ? { displayOrder: dto.displayOrder } : {}),
          ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        },
      });
      return { success: true, data };
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new BadRequestException("同じ名称のグループが既に存在します");
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.prisma.tagGroup.delete({ where: { id } });
    return { success: true };
  }

  async reorder(items: Array<{ id: string; displayOrder: number; categoryId?: string }>) {
    if (!items.length) {
      return { success: true };
    }

    await this.prisma.$transaction(
      items.map(({ id, displayOrder, categoryId }) =>
        this.prisma.tagGroup.update({
          where: { id },
          data: {
            displayOrder,
            ...(categoryId ? { category: { connect: { id: categoryId } } } : {}),
          },
        }),
      ),
    );

    return { success: true };
  }

  private async getNextDisplayOrder(categoryId: string): Promise<number> {
    const result = await this.prisma.tagGroup.aggregate({
      _max: { displayOrder: true },
      where: { categoryId },
    });
    return (result._max.displayOrder ?? -1) + 1;
  }

  private isUniqueConstraintViolation(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
  }
}
