import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCatDto, UpdateCatDto, CatQueryDto } from "./dto";

@Injectable()
export class CatsService {
  constructor(private prisma: PrismaService) {}

  async create(createCatDto: CreateCatDto) {
    const { breedId, colorId, birthDate, ...catData } = createCatDto as any;

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

    // birthDate は文字列入力（ISO8601想定）をDateに変換して保存
    const birth = birthDate ? new Date(birthDate) : undefined;
    return this.prisma.cat.create({
      data: {
        ...catData,
        breedId,
        colorId,
        ...(birth ? { birthDate: birth } : {}),
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
    const where: any = {};

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
    if (gender) where.gender = gender;

    // Age filters
    if (ageMin || ageMax) {
      const now = new Date();
      if (ageMax) {
        const minBirthDate = new Date(
          now.getFullYear() - ageMax,
          now.getMonth(),
          now.getDate(),
        );
        where.birthDate = { gte: minBirthDate };
      }
      if (ageMin) {
        const maxBirthDate = new Date(
          now.getFullYear() - ageMin,
          now.getMonth(),
          now.getDate(),
        );
        where.birthDate = { ...where.birthDate, lte: maxBirthDate };
      }
    }

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
        orderBy: {
          [sortBy]: sortOrder,
        },
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

    const { breedId, colorId, birthDate, ...catData } = updateCatDto as any;

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
        ...catData,
        breedId,
        colorId,
        ...(birth ? { birthDate: birth } : {}),
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
        this.prisma.cat.count({ where: { gender: "MALE" } }),
        this.prisma.cat.count({ where: { gender: "FEMALE" } }),
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
      where: { id: { in: breedIds as string[] } },
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
