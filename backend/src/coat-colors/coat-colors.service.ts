import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

import {
  CreateCoatColorDto,
  UpdateCoatColorDto,
  CoatColorQueryDto,
} from "./dto";

@Injectable()
export class CoatColorsService {
  constructor(private prisma: PrismaService) {}

  async create(createCoatColorDto: CreateCoatColorDto) {
    return this.prisma.coatColor.create({
      data: createCoatColorDto,
    });
  }

  async findAll(query: CoatColorQueryDto) {
    const {
      page = 1,
      limit = 50,
      search,
      sortBy = "name",
      sortOrder = "asc",
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [colors, total] = await Promise.all([
      this.prisma.coatColor.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              cats: true,
              pedigrees: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.coatColor.count({ where }),
    ]);

    return {
      data: colors,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const color = await this.prisma.coatColor.findUnique({
      where: { id },
      include: {
        cats: {
          include: {
            breed: true,
          },
          orderBy: {
            name: "asc",
          },
        },
        pedigrees: {
          include: {
            breed: true,
          },
          orderBy: {
            catName: "asc",
          },
        },
        _count: {
          select: {
            cats: true,
            pedigrees: true,
          },
        },
      },
    });

    if (!color) {
      throw new NotFoundException(`Coat color with ID ${id} not found`);
    }

    return color;
  }

  async update(id: string, updateCoatColorDto: UpdateCoatColorDto) {
    const existingColor = await this.prisma.coatColor.findUnique({
      where: { id },
    });

    if (!existingColor) {
      throw new NotFoundException(`Coat color with ID ${id} not found`);
    }

    return this.prisma.coatColor.update({
      where: { id },
      data: updateCoatColorDto,
    });
  }

  async remove(id: string) {
    const existingColor = await this.prisma.coatColor.findUnique({
      where: { id },
    });

    if (!existingColor) {
      throw new NotFoundException(`Coat color with ID ${id} not found`);
    }

    // Check if color is being used
    const [catCount, pedigreeCount] = await Promise.all([
      this.prisma.cat.count({ where: { colorId: id } }),
      this.prisma.pedigree.count({ where: { colorId: id } }),
    ]);

    if (catCount > 0 || pedigreeCount > 0) {
      throw new NotFoundException(
        `Cannot delete coat color: ${catCount} cats and ${pedigreeCount} pedigrees are using this color`,
      );
    }

    return this.prisma.coatColor.delete({
      where: { id },
    });
  }

  async getStatistics() {
    const [totalColors, mostPopularColors, colorDistribution] =
      await Promise.all([
        this.prisma.coatColor.count(),
        this.prisma.coatColor.findMany({
          include: {
            _count: {
              select: {
                cats: true,
                pedigrees: true,
              },
            },
          },
          orderBy: {
            cats: {
              _count: "desc",
            },
          },
          take: 10,
        }),
        this.prisma.cat.groupBy({
          by: ["colorId"],
          _count: true,
          orderBy: {
            _count: {
              colorId: "desc",
            },
          },
        }),
      ]);

    return {
      totalColors,
      mostPopularColors,
      colorDistribution,
    };
  }
}
