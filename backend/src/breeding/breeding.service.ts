import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import {
  BreedingQueryDto,
  CreateBreedingDto,
  UpdateBreedingDto,
  CreateBreedingNgRuleDto,
  UpdateBreedingNgRuleDto,
} from "./dto";
import {
  BreedingWhereInput,
  CatWithGender,
  BreedingListResponse,
  BreedingCreateResponse,
  BreedingSuccessResponse,
  BreedingNgRuleListResponse,
  BreedingNgRuleResponse,
} from "./types/breeding.types";

@Injectable()
export class BreedingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: BreedingQueryDto): Promise<BreedingListResponse> {
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

    const where: BreedingWhereInput = {};
    if (motherId) where.femaleId = motherId;
    if (fatherId) where.maleId = fatherId;
    if (dateFrom || dateTo) {
      where.breedingDate = {};
      if (dateFrom) where.breedingDate.gte = new Date(dateFrom);
      if (dateTo) where.breedingDate.lte = new Date(dateTo);
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

  async create(dto: CreateBreedingDto, userId?: string): Promise<BreedingCreateResponse> {
    // Validate parents existence
    const [female, male] = await Promise.all([
      this.prisma.cat.findUnique({ 
        where: { id: dto.motherId },
        select: { id: true, gender: true }
      }),
      this.prisma.cat.findUnique({ 
        where: { id: dto.fatherId },
        select: { id: true, gender: true }
      }),
    ]);

    if (!female) throw new NotFoundException("motherId not found");
    if (!male) throw new NotFoundException("fatherId not found");

    // Basic gender check (optional but useful)
    if ((female as CatWithGender).gender === "MALE") {
      throw new BadRequestException("motherId must refer to a FEMALE cat");
    }
    if ((male as CatWithGender).gender === "FEMALE") {
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

  async update(id: string, dto: UpdateBreedingDto): Promise<BreedingSuccessResponse> {
    await this.prisma.breedingRecord.update({
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
    return { success: true };
  }

  async remove(id: string): Promise<BreedingSuccessResponse> {
    await this.prisma.breedingRecord.delete({ where: { id } });
    return { success: true };
  }

  async findNgRules(): Promise<BreedingNgRuleListResponse> {
    const rules = await this.prisma.breedingNgRule.findMany({
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: rules };
  }

  async createNgRule(dto: CreateBreedingNgRuleDto): Promise<BreedingNgRuleResponse> {
    const rule = await this.prisma.breedingNgRule.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        active: dto.active ?? true,
        maleConditions: dto.maleConditions ?? [],
        femaleConditions: dto.femaleConditions ?? [],
        maleNames: dto.maleNames ?? [],
        femaleNames: dto.femaleNames ?? [],
        generationLimit: dto.generationLimit,
      },
    });

    return { success: true, data: rule };
  }

  async updateNgRule(id: string, dto: UpdateBreedingNgRuleDto): Promise<BreedingNgRuleResponse> {
    const data: Prisma.BreedingNgRuleUpdateInput = {
      name: dto.name,
      description: dto.description,
      type: dto.type,
      active: dto.active,
      generationLimit: dto.generationLimit,
    };

    if (dto.maleConditions !== undefined) {
      data.maleConditions = { set: dto.maleConditions };
    }

    if (dto.femaleConditions !== undefined) {
      data.femaleConditions = { set: dto.femaleConditions };
    }

    if (dto.maleNames !== undefined) {
      data.maleNames = { set: dto.maleNames };
    }

    if (dto.femaleNames !== undefined) {
      data.femaleNames = { set: dto.femaleNames };
    }

    const rule = await this.prisma.breedingNgRule.update({
      where: { id },
      data,
    });

    return { success: true, data: rule };
  }

  async removeNgRule(id: string): Promise<BreedingSuccessResponse> {
    await this.prisma.breedingNgRule.delete({ where: { id } });
    return { success: true };
  }
}
