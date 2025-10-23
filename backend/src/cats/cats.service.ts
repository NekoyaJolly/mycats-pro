import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { CreateCatDto, UpdateCatDto, CatQueryDto } from "./dto";

@Injectable()
export class CatsService {
  constructor(private prisma: PrismaService) {}

  async create(createCatDto: CreateCatDto) {
    const {
      name,
      gender,
      birthDate,
      breedId,
      coatColorId,
      microchipNumber,
      registrationId,
      description,
      isInHouse,
      fatherId,
      motherId,
      tagIds,
    } = createCatDto;

    // Validate breed if provided
    let breedIdToConnect: string | undefined;
    if (breedId) {
      // Try to find by ID first
      let breed = await this.prisma.breed.findUnique({
        where: { id: breedId },
      });
      
      // If not found by ID, try to find by name
      if (!breed) {
        breed = await this.prisma.breed.findFirst({
          where: { name: breedId },
        });
      }
      
      if (!breed) {
        throw new BadRequestException("Invalid breed ID or name");
      }
      
      breedIdToConnect = breed.id;
    }

    // Validate coatColor if provided
    let coatColorIdToConnect: string | undefined;
    if (coatColorId) {
      // Try to find by ID first
      let color = await this.prisma.coatColor.findUnique({
        where: { id: coatColorId },
      });
      
      // If not found by ID, try to find by name
      if (!color) {
        color = await this.prisma.coatColor.findFirst({
          where: { name: coatColorId },
        });
      }
      
      if (!color) {
        throw new BadRequestException("Invalid coat color ID or name");
      }
      
      coatColorIdToConnect = color.id;
    }

    const birth = new Date(birthDate);

    try {
      // Create the cat
      const cat = await this.prisma.cat.create({
        data: {
          name,
          gender,
          birthDate: birth,
          ...(registrationId ? { registrationId } : {}),
          ...(microchipNumber ? { microchipNumber } : {}),
          ...(description ? { description } : {}),
          isInHouse: isInHouse ?? true,
          ...(breedIdToConnect ? { breed: { connect: { id: breedIdToConnect } } } : {}),
          ...(coatColorIdToConnect ? { coatColor: { connect: { id: coatColorIdToConnect } } } : {}),
          ...(fatherId ? { father: { connect: { id: fatherId } } } : {}),
          ...(motherId ? { mother: { connect: { id: motherId } } } : {}),
        },
        include: {
          breed: true,
          coatColor: true,
          father: true,
          mother: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });

      // Handle tag assignments if provided
      if (tagIds && tagIds.length > 0) {
        await this.prisma.catTag.createMany({
          data: tagIds.map((tagId) => ({
            catId: cat.id,
            tagId,
          })),
          skipDuplicates: true,
        });

        // Fetch the cat again with tags
        return await this.prisma.cat.findUnique({
          where: { id: cat.id },
          include: {
            breed: true,
            coatColor: true,
            father: true,
            mother: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
        });
      }

      return cat;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes("microchipNumber") || target?.includes("microchip_number")) {
          throw new ConflictException("Cat with the same microchip number already exists");
        }
        throw new ConflictException("Cat with the same registration number already exists");
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
      coatColorId,
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
        { microchipNumber: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filters
    if (breedId) where.breedId = breedId;
    if (coatColorId) where.coatColorId = coatColorId;
    if (gender) {
      where.gender = gender;
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

    type Sortable = "createdAt" | "updatedAt" | "name" | "birthDate";
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
          coatColor: true,
          tags: {
            include: {
              tag: true,
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
        coatColor: true,
        father: true,
        mother: true,
        tags: {
          include: {
            tag: true,
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
      name,
      gender,
      birthDate,
      breedId,
      coatColorId,
      microchipNumber,
      registrationId,
      description,
      isInHouse,
      fatherId,
      motherId,
    } = updateCatDto;

    // Validate breed if provided
    let breedIdToConnect: string | undefined;
    if (breedId) {
      // Try to find by ID first
      let breed = await this.prisma.breed.findUnique({
        where: { id: breedId },
      });
      
      // If not found by ID, try to find by name
      if (!breed) {
        breed = await this.prisma.breed.findFirst({
          where: { name: breedId },
        });
      }
      
      if (!breed) {
        throw new BadRequestException("Invalid breed ID or name");
      }
      
      breedIdToConnect = breed.id;
    }

    // Validate color if provided
    let coatColorIdToConnect: string | undefined;
    if (coatColorId) {
      // Try to find by ID first
      let color = await this.prisma.coatColor.findUnique({
        where: { id: coatColorId },
      });
      
      // If not found by ID, try to find by name
      if (!color) {
        color = await this.prisma.coatColor.findFirst({
          where: { name: coatColorId },
        });
      }
      
      if (!color) {
        throw new BadRequestException("Invalid coat color ID or name");
      }
      
      coatColorIdToConnect = color.id;
    }

    const birth = birthDate ? new Date(birthDate) : undefined;

    try {
      return await this.prisma.cat.update({
        where: { id },
        data: {
          ...(name ? { name } : {}),
          ...(gender ? { gender } : {}),
          ...(birth ? { birthDate: birth } : {}),
          ...(registrationId !== undefined ? { registrationId } : {}),
          ...(microchipNumber !== undefined ? { microchipNumber } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(isInHouse !== undefined ? { isInHouse } : {}),
          ...(breedIdToConnect ? { breed: { connect: { id: breedIdToConnect } } } : {}),
          ...(coatColorIdToConnect ? { coatColor: { connect: { id: coatColorIdToConnect } } } : {}),
          ...(fatherId ? { father: { connect: { id: fatherId } } } : {}),
          ...(motherId ? { mother: { connect: { id: motherId } } } : {}),
        },
        include: {
          breed: true,
          coatColor: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const target = error.meta?.target as string[] | undefined;
        if (target?.includes("microchipNumber") || target?.includes("microchip_number")) {
          throw new ConflictException("Cat with the same microchip number already exists");
        }
        throw new ConflictException("Cat with the same registration number already exists");
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
        coatColor: true,
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
            coatColor: true,
          },
        },
        female: {
          include: {
            breed: true,
            coatColor: true,
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

    const genderDistribution: Record<string, number> = {
      MALE: 0,
      FEMALE: 0,
    };

    for (const group of genderGroups) {
      if (group.gender === "MALE" || group.gender === "FEMALE") {
        genderDistribution[group.gender] = group._count;
      }
    }

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
      genderDistribution,
      breedDistribution: breedStatsWithNames,
    };
  }
}
