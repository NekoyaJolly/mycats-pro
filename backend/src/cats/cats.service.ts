import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { CreateCatDto, UpdateCatDto, CatQueryDto } from "./dto";
import {
  CatGender,
  InvalidGenderError,
  parseGenderInput,
  parseOptionalGenderInput,
} from "./constants/gender";

@Injectable()
export class CatsService {
  constructor(private prisma: PrismaService) {}

  private ensureGender(value: unknown): CatGender {
    try {
      return parseGenderInput(value);
    } catch (error) {
      if (error instanceof InvalidGenderError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  private ensureOptionalGender(value: unknown): CatGender | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    try {
      return parseOptionalGenderInput(value);
    } catch (error) {
      if (error instanceof InvalidGenderError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async create(createCatDto: CreateCatDto) {
    const {
      registrationId,
      name,
      breedId,
      colorId,
      pattern,
      gender,
      birthDate,
      weight,
      microchipId,
      fatherId,
      motherId,
      imageUrl,
      notes,
    } = createCatDto;

    if (breedId) {
      const breed = await this.prisma.breed.findUnique({
        where: { id: breedId },
      });
      if (!breed) {
        throw new BadRequestException("Invalid breed ID");
      }
    }

    if (colorId) {
      const color = await this.prisma.coatColor.findUnique({
        where: { id: colorId },
      });
      if (!color) {
        throw new BadRequestException("Invalid color ID");
      }
    }

  const birth = new Date(birthDate);
  const normalizedGender = this.ensureGender(gender);

    try {
      return await this.prisma.cat.create({
        data: {
          registrationId,
          name,
          ...(pattern !== undefined ? { pattern } : {}),
          gender: normalizedGender,
          birthDate: birth,
          ...(typeof weight === "number" ? { weight } : {}),
          ...(microchipId ? { microchipId } : {}),
          ...(imageUrl ? { imageUrl } : {}),
          ...(notes ? { notes } : {}),
          ...(breedId ? { breed: { connect: { id: breedId } } } : {}),
          ...(colorId ? { color: { connect: { id: colorId } } } : {}),
          ...(fatherId ? { father: { connect: { id: fatherId } } } : {}),
          ...(motherId ? { mother: { connect: { id: motherId } } } : {}),
        },
        include: {
          breed: true,
          color: true,
          father: true,
          mother: true,
          maleBreedingRecords: true,
          femaleBreedingRecords: true,
          careRecords: {
            orderBy: { careDate: "desc" },
            take: 5,
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Cat with the same registration ID already exists");
      }
      throw error;
    }
  }

  async findAll(query: CatQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      breedId,
      colorId,
      gender,
      ageMin,
      ageMax,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.CatWhereInput = {};

    // Search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { microchipId: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filters
    if (breedId) where.breedId = breedId;
    if (colorId) where.colorId = colorId;
    if (gender) {
      where.gender = this.ensureGender(gender);
    }

    // Age filters
    if (ageMin || ageMax) {
      const now = new Date();
      const birthFilter: Prisma.DateTimeFilter = {};
      if (ageMax) {
        const minBirthDate = new Date(
          now.getFullYear() - ageMax,
          now.getMonth(),
          now.getDate(),
        );
        birthFilter.gte = minBirthDate;
      }
      if (ageMin) {
        const maxBirthDate = new Date(
          now.getFullYear() - ageMin,
          now.getMonth(),
          now.getDate(),
        );
        birthFilter.lte = maxBirthDate;
      }
      if (birthFilter.gte || birthFilter.lte) {
        where.birthDate = birthFilter;
      }
    }

    type Sortable = "createdAt" | "updatedAt" | "name" | "birthDate" | "weight";
    const orderBy: Prisma.CatOrderByWithRelationInput = {
      [sortBy as Sortable]: sortOrder,
    } as Prisma.CatOrderByWithRelationInput;

    const [cats, total] = await Promise.all([
      this.prisma.cat.findMany({
        where,
        skip,
        take: limit,
        include: {
          breed: true,
          color: true,
        },
        orderBy,
      }),
      this.prisma.cat.count({ where }),
    ]);

    return {
      data: cats,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const cat = await this.prisma.cat.findUnique({
      where: { id },
      include: {
        breed: true,
        color: true,
        maleBreedingRecords: {
          include: {
            female: true,
          },
        },
        femaleBreedingRecords: {
          include: {
            male: true,
          },
        },
        careRecords: {
          orderBy: { careDate: "desc" },
          include: {
            recorder: true,
          },
        },
      },
    });

    if (!cat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }

    return cat;
  }

  async update(id: string, updateCatDto: UpdateCatDto) {
    const existingCat = await this.prisma.cat.findUnique({
      where: { id },
    });

    if (!existingCat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }

    const {
      registrationId,
      name,
      breedId,
      colorId,
      pattern,
      gender,
      birthDate,
      weight,
      microchipId,
      fatherId,
      motherId,
      imageUrl,
      notes,
    } = updateCatDto;

    // Validate breed if provided
    if (breedId) {
      const breed = await this.prisma.breed.findUnique({
        where: { id: breedId },
      });
      if (!breed) {
        throw new BadRequestException("Invalid breed ID");
      }
    }

    // Validate color if provided
    if (colorId) {
      const color = await this.prisma.coatColor.findUnique({
        where: { id: colorId },
      });
      if (!color) {
        throw new BadRequestException("Invalid color ID");
      }
    }

  const birth = birthDate ? new Date(birthDate) : undefined;
  const normalizedGender = this.ensureOptionalGender(gender);
    try {
      return await this.prisma.cat.update({
        where: { id },
        data: {
          ...(registrationId ? { registrationId } : {}),
          ...(name ? { name } : {}),
          ...(pattern !== undefined ? { pattern } : {}),
          ...(typeof weight === "number" ? { weight } : {}),
          ...(microchipId ? { microchipId } : {}),
          ...(imageUrl ? { imageUrl } : {}),
          ...(notes ? { notes } : {}),
          ...(normalizedGender ? { gender: normalizedGender } : {}),
          ...(birth ? { birthDate: birth } : {}),
          ...(breedId ? { breed: { connect: { id: breedId } } } : {}),
          ...(colorId ? { color: { connect: { id: colorId } } } : {}),
          ...(fatherId ? { father: { connect: { id: fatherId } } } : {}),
          ...(motherId ? { mother: { connect: { id: motherId } } } : {}),
        },
        include: {
          breed: true,
          color: true,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Cat with the same registration ID already exists");
      }
      throw error;
    }
  }

  async remove(id: string) {
    const existingCat = await this.prisma.cat.findUnique({
      where: { id },
    });

    if (!existingCat) {
      throw new NotFoundException(`Cat with ID ${id} not found`);
    }

    return this.prisma.cat.delete({
      where: { id },
      include: {
        breed: true,
        color: true,
      },
    });
  }

  async getBreedingHistory(id: string) {
    const cat = await this.findOne(id);

    const breedingRecords = await this.prisma.breedingRecord.findMany({
      where: {
        OR: [{ maleId: id }, { femaleId: id }],
      },
      include: {
        male: {
          include: {
            breed: true,
            color: true,
          },
        },
        female: {
          include: {
            breed: true,
            color: true,
          },
        },
        recorder: true,
      },
      orderBy: {
        breedingDate: "desc",
      },
    });

    return {
      cat,
      breedingRecords,
    };
  }

  async getCareHistory(id: string) {
    const cat = await this.findOne(id);

    const careRecords = await this.prisma.careRecord.findMany({
      where: { catId: id },
      include: {
        recorder: true,
      },
      orderBy: {
        careDate: "desc",
      },
    });

    return {
      cat,
      careRecords,
    };
  }

  async getStatistics() {
    const [totalCats, genderGroups, breedStats] = await Promise.all([
      this.prisma.cat.count(),
      this.prisma.cat.groupBy({
        by: ["gender"],
        _count: true,
      }),
      this.prisma.cat.groupBy({
        by: ["breedId"],
        _count: true,
        orderBy: {
          _count: {
            breedId: "desc",
          },
        },
        take: 10,
      }),
    ]);

    const baseGenderCounts: Record<CatGender, number> = {
      [CatGender.MALE]: 0,
      [CatGender.FEMALE]: 0,
      [CatGender.NEUTER]: 0,
      [CatGender.SPAY]: 0,
    };

    for (const group of genderGroups) {
      const canonical = this.ensureOptionalGender(group.gender);
      if (!canonical) {
        continue;
      }
      baseGenderCounts[canonical] = group._count;
    }

    const genderDistribution = {
      male: baseGenderCounts[CatGender.MALE],
      female: baseGenderCounts[CatGender.FEMALE],
      neuter: baseGenderCounts[CatGender.NEUTER],
      spay: baseGenderCounts[CatGender.SPAY],
    };

    const knownGenderTotal =
      genderDistribution.male +
      genderDistribution.female +
      genderDistribution.neuter +
      genderDistribution.spay;

    const unknown = Math.max(totalCats - knownGenderTotal, 0);

    const breedIds = breedStats.map((stat) => stat.breedId).filter(Boolean);
    const breeds = await this.prisma.breed.findMany({
      where: { id: { in: breedIds } },
    });

    const breedStatsWithNames = breedStats.map((stat) => ({
      breed: breeds.find((breed) => breed.id === stat.breedId),
      count: stat._count,
    }));

    return {
      total: totalCats,
      genderDistribution: {
        ...genderDistribution,
        unknown,
      },
      breedDistribution: breedStatsWithNames,
    };
  }
}
