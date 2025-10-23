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
  CreatePregnancyCheckDto,
  UpdatePregnancyCheckDto,
  PregnancyCheckQueryDto,
  CreateBirthPlanDto,
  UpdateBirthPlanDto,
  BirthPlanQueryDto,
} from "./dto";
import {
  BreedingWhereInput,
  CatWithGender,
  BreedingListResponse,
  BreedingCreateResponse,
  BreedingSuccessResponse,
  BreedingNgRuleListResponse,
  BreedingNgRuleResponse,
  PregnancyCheckListResponse,
  PregnancyCheckResponse,
  BirthPlanListResponse,
  BirthPlanResponse,
} from "./types/breeding.types";

@Injectable()
export class BreedingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: BreedingQueryDto): Promise<BreedingListResponse> {
    const {
      page = 1,
      limit = 20,
      femaleId,
      maleId,
      dateFrom,
      dateTo,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const where: BreedingWhereInput = {};
    if (femaleId) where.femaleId = femaleId;
    if (maleId) where.maleId = maleId;
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
        where: { id: dto.femaleId },
        select: { id: true, gender: true }
      }),
      this.prisma.cat.findUnique({ 
        where: { id: dto.maleId },
        select: { id: true, gender: true }
      }),
    ]);

    if (!female) throw new NotFoundException("femaleId not found");
    if (!male) throw new NotFoundException("maleId not found");

    // Basic gender check (optional but useful)
    if ((female as CatWithGender).gender === "MALE") {
      throw new BadRequestException("femaleId must refer to a FEMALE cat");
    }
    if ((male as CatWithGender).gender === "FEMALE") {
      throw new BadRequestException("maleId must refer to a MALE cat");
    }

    const firstUser = userId ? null : await this.prisma.user.findFirst();
    const result = await this.prisma.breedingRecord.create({
      data: {
        femaleId: dto.femaleId,
        maleId: dto.maleId,
        breedingDate: new Date(dto.breedingDate),
        expectedDueDate: dto.expectedDueDate
          ? new Date(dto.expectedDueDate)
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
        femaleId: dto.femaleId,
        maleId: dto.maleId,
        breedingDate: dto.breedingDate ? new Date(dto.breedingDate) : undefined,
        expectedDueDate: dto.expectedDueDate
          ? new Date(dto.expectedDueDate)
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

  // PregnancyCheck methods
  async findAllPregnancyChecks(query: PregnancyCheckQueryDto): Promise<PregnancyCheckListResponse> {
    const where: Prisma.PregnancyCheckWhereInput = {};
    if (query.maleId) where.maleId = query.maleId;
    if (query.femaleId) where.femaleId = query.femaleId;
    if (query.status) where.status = query.status;

    const data = await this.prisma.pregnancyCheck.findMany({
      where,
      orderBy: { checkDate: 'asc' },
    });

    return { success: true, data };
  }

  async createPregnancyCheck(dto: CreatePregnancyCheckDto, userId?: string): Promise<PregnancyCheckResponse> {
    const firstUser = userId ? null : await this.prisma.user.findFirst();
    const data = await this.prisma.pregnancyCheck.create({
      data: {
        breedingRecordId: dto.breedingRecordId,
        maleId: dto.maleId,
        femaleId: dto.femaleId,
        maleName: dto.maleName,
        femaleName: dto.femaleName,
        matingDate: new Date(dto.matingDate),
        checkDate: new Date(dto.checkDate),
        notes: dto.notes,
        recordedBy: userId ?? (firstUser ? firstUser.id : undefined as string),
      },
    });

    return { success: true, data };
  }

  async updatePregnancyCheck(id: string, dto: UpdatePregnancyCheckDto): Promise<PregnancyCheckResponse> {
    const data = await this.prisma.pregnancyCheck.update({
      where: { id },
      data: {
        checkDate: dto.checkDate ? new Date(dto.checkDate) : undefined,
        status: dto.status,
        notes: dto.notes,
      },
    });

    return { success: true, data };
  }

  async removePregnancyCheck(id: string): Promise<BreedingSuccessResponse> {
    await this.prisma.pregnancyCheck.delete({ where: { id } });
    return { success: true };
  }

  // BirthPlan methods
  async findAllBirthPlans(query: BirthPlanQueryDto): Promise<BirthPlanListResponse> {
    const where: Prisma.BirthPlanWhereInput = {};
    if (query.maleId) where.maleId = query.maleId;
    if (query.femaleId) where.femaleId = query.femaleId;
    if (query.status) where.status = query.status;

    const data = await this.prisma.birthPlan.findMany({
      where,
      orderBy: { expectedDate: 'asc' },
    });

    return { success: true, data };
  }

  async createBirthPlan(dto: CreateBirthPlanDto, userId?: string): Promise<BirthPlanResponse> {
    const firstUser = userId ? null : await this.prisma.user.findFirst();
    const data = await this.prisma.birthPlan.create({
      data: {
        breedingRecordId: dto.breedingRecordId,
        maleId: dto.maleId,
        femaleId: dto.femaleId,
        maleName: dto.maleName,
        femaleName: dto.femaleName,
        matingDate: new Date(dto.matingDate),
        expectedDate: new Date(dto.expectedDate),
        notes: dto.notes,
        recordedBy: userId ?? (firstUser ? firstUser.id : undefined as string),
      },
    });

    return { success: true, data };
  }

  async updateBirthPlan(id: string, dto: UpdateBirthPlanDto): Promise<BirthPlanResponse> {
    const data = await this.prisma.birthPlan.update({
      where: { id },
      data: {
        expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
        actualBirthDate: dto.actualBirthDate ? new Date(dto.actualBirthDate) : undefined,
        numberOfKittens: dto.numberOfKittens,
        status: dto.status,
        notes: dto.notes,
      },
    });

    return { success: true, data };
  }

  async removeBirthPlan(id: string): Promise<BreedingSuccessResponse> {
    await this.prisma.birthPlan.delete({ where: { id } });
    return { success: true };
  }
}
