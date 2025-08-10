import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTagDto } from "./dto/create-tag.dto";

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const data = await this.prisma.tag.findMany({
      include: {
        cats: {
          select: { catId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return {
      success: true,
      data: data.map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        description: t.description ?? undefined,
        usage_count: t.cats.length,
      })),
    };
  }

  async create(dto: CreateTagDto) {
    const data = await this.prisma.tag.create({
      data: {
        name: dto.name,
        color: dto.color ?? undefined,
        description: dto.description ?? undefined,
      },
    });
    return { success: true, data };
  }

  async remove(id: string) {
    await this.prisma.tag.delete({ where: { id } });
    return { success: true };
  }

  async assignToCat(catId: string, tagId: string) {
    try {
      await this.prisma.catTag.create({ data: { catId, tagId } });
    } catch (e: any) {
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
}
