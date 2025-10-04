import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { Gender } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { CreateCatDto, UpdateCatDto, CatQueryDto } from "./dto";

@Injectable()
export class CatsService {
  constructor(private prisma: PrismaService) {}

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
      ownerId,
      fatherId,
      motherId,
      imageUrl,
      notes,
    } = createCatDto;

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

  // birthDate は必須。文字列入力（ISO8601想定）を Date に変換して保存
  const birth = new Date(birthDate);
    function toGender(val: any): Gender {
      if (val === Gender.MALE || val === Gender.FEMALE) return val;
      throw new BadRequestException("Invalid gender value");
    }
    return this.prisma.cat.create({
      data: {
        registrationId,
        name,
        pattern,
        gender: toGender(gender),
        birthDate: birth,
        ...(typeof weight === "number" ? { weight } : {}),
        ...(microchipId ? { microchipId } : {}),
        ...(imageUrl ? { imageUrl } : {}),
        ...(notes ? { notes } : {}),
        owner: { connect: { id: ownerId } },
        ...(breedId ? { breed: { connect: { id: breedId } } } : {}),
        ...(colorId ? { color: { connect: { id: colorId } } } : {}),
        ...(fatherId ? { father: { connect: { id: fatherId } } } : {}),
        ...(motherId ? { mother: { connect: { id: motherId } } } : {}),
      },
      include: {
        breed: true,
        color: true,
        owner: true,
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
  if (gender) where.gender = (gender === Gender.MALE || gender === Gender.FEMALE) ? gender : undefined;

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
          pedigrees: {
            include: {
              breed: true,
              color: true,
            },
          },
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
        pedigrees: {
          include: {
            breed: true,
            color: true,
            fatherPedigree: {
              include: {
                breed: true,
                color: true,
              },
            },
            motherPedigree: {
              include: {
                breed: true,
                color: true,
              },
            },
          },
        },
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
      ownerId,
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
    return this.prisma.cat.update({
      where: { id },
      data: {
        ...(registrationId ? { registrationId } : {}),
        ...(name ? { name } : {}),
        ...(pattern ? { pattern } : {}),
        ...(typeof weight === "number" ? { weight } : {}),
        ...(microchipId ? { microchipId } : {}),
        ...(imageUrl ? { imageUrl } : {}),
        ...(notes ? { notes } : {}),
  ...(gender ? { gender: (gender === Gender.MALE || gender === Gender.FEMALE) ? gender : undefined } : {}),
        ...(birth ? { birthDate: birth } : {}),
        ...(ownerId ? { owner: { connect: { id: ownerId } } } : {}),
        ...(breedId ? { breed: { connect: { id: breedId } } } : {}),
        ...(colorId ? { color: { connect: { id: colorId } } } : {}),
        ...(fatherId ? { father: { connect: { id: fatherId } } } : {}),
        ...(motherId ? { mother: { connect: { id: motherId } } } : {}),
      },
      include: {
        breed: true,
        color: true,
        pedigrees: {
          include: {
            breed: true,
            color: true,
          },
        },
      },
    });
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
        pedigrees: true,
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
    const [totalCats, totalMales, totalFemales, breedStats] = await Promise.all(
      [
        this.prisma.cat.count(),
  this.prisma.cat.count({ where: { gender: Gender.MALE } }),
  this.prisma.cat.count({ where: { gender: Gender.FEMALE } }),
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
      ],
    );

    // Get breed names for statistics
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
        male: totalMales,
        female: totalFemales,
      },
      breedDistribution: breedStatsWithNames,
    };
  }
}
