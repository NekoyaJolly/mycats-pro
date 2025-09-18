import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

import { BreedingQueryDto, CreateBreedingDto, UpdateBreedingDto } from "./dto";

@Injectable()
export class BreedingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: BreedingQueryDto) {
    const {
      page = 1,
      limit = 20,
      motherId,
      fatherId,
      dateFrom,
      dateTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const where: Record<string, unknown> = {};
    if (motherId) where.femaleId = motherId;
    if (fatherId) where.maleId = fatherId;
    if (dateFrom || dateTo) {
      where.breedingDate = {};
      if (dateFrom) (where.breedingDate as Record<string, unknown>).gte = new Date(dateFrom);
      if (dateTo) (where.breedingDate as Record<string, unknown>).lte = new Date(dateTo);
    }

    const [total, data] = await this.prisma.$transaction([
      this.prisma.breedingRecord.count({ where }),
      this.prisma.breedingRecord.findMany({
        where,
        include: {
          male: { select: { id: true, name: true } },
          female: { select: { id: true, name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(dto: CreateBreedingDto, userId?: string) {
    // Validate parents existence
    const [female, male] = await Promise.all([
      this.prisma.cat.findUnique({ where: { id: dto.motherId } }),
      this.prisma.cat.findUnique({ where: { id: dto.fatherId } }),
    ]);

    if (!female) throw new NotFoundException("motherId not found");
    if (!male) throw new NotFoundException("fatherId not found");

    // Basic gender check (optional but useful)
    if ((female as { gender: string }).gender === "MALE") {
      throw new BadRequestException("motherId must refer to a FEMALE cat");
    }
    if ((male as { gender: string }).gender === "FEMALE") {
      throw new BadRequestException("fatherId must refer to a MALE cat");
    }

    const firstUser = userId ? null : await this.prisma.user.findFirst();
    const result = await this.prisma.breedingRecord.create({
      data: {
        femaleId: dto.motherId,
        maleId: dto.fatherId,
        breedingDate: new Date(dto.matingDate),
        expectedDueDate: dto.expectedBirthDate
          ? new Date(dto.expectedBirthDate)
          : undefined,
        notes: dto.notes,
        recordedBy: userId ?? (firstUser ? firstUser.id : undefined as string),
      },
      include: {
        male: { select: { id: true, name: true } },
        female: { select: { id: true, name: true } },
      },
    });
    return { success: true, data: result };
  }

  async update(id: string, dto: UpdateBreedingDto) {
    const result = await this.prisma.breedingRecord.update({
      where: { id },
      data: {
        femaleId: dto.motherId,
        maleId: dto.fatherId,
        breedingDate: dto.matingDate ? new Date(dto.matingDate) : undefined,
        expectedDueDate: dto.expectedBirthDate
          ? new Date(dto.expectedBirthDate)
          : undefined,
        notes: dto.notes,
      },
    });
    return { success: true, data: result };
  }

  async remove(id: string) {
    await this.prisma.breedingRecord.delete({ where: { id } });
    return { success: true };
  }
}
