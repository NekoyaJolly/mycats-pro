import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

import { CreateBreedDto, UpdateBreedDto, BreedQueryDto } from "./dto";

@Injectable()
export class BreedsService {
  constructor(private prisma: PrismaService) {}

  async create(createBreedDto: CreateBreedDto) {
    return this.prisma.breed.create({
      data: createBreedDto,
    });
  }

  async findAll(query: BreedQueryDto) {
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

    const [breeds, total] = await Promise.all([
      this.prisma.breed.findMany({
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
      this.prisma.breed.count({ where }),
    ]);

    return {
      data: breeds,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const breed = await this.prisma.breed.findUnique({
      where: { id },
      include: {
        cats: {
          include: {
            color: true,
          },
          orderBy: {
            name: "asc",
          },
        },
        pedigrees: {
          include: {
            color: true,
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

    if (!breed) {
      throw new NotFoundException(`Breed with ID ${id} not found`);
    }

    return breed;
  }

  async update(id: string, updateBreedDto: UpdateBreedDto) {
    const existingBreed = await this.prisma.breed.findUnique({
      where: { id },
    });

    if (!existingBreed) {
      throw new NotFoundException(`Breed with ID ${id} not found`);
    }

    return this.prisma.breed.update({
      where: { id },
      data: updateBreedDto,
    });
  }

  async remove(id: string) {
    const existingBreed = await this.prisma.breed.findUnique({
      where: { id },
    });

    if (!existingBreed) {
      throw new NotFoundException(`Breed with ID ${id} not found`);
    }

    // Check if breed is being used
    const [catCount, pedigreeCount] = await Promise.all([
      this.prisma.cat.count({ where: { breedId: id } }),
      this.prisma.pedigree.count({ where: { breedId: id } }),
    ]);

    if (catCount > 0 || pedigreeCount > 0) {
      throw new NotFoundException(
        `Cannot delete breed: ${catCount} cats and ${pedigreeCount} pedigrees are using this breed`,
      );
    }

    return this.prisma.breed.delete({
      where: { id },
    });
  }

  async getStatistics() {
    const [totalBreeds, mostPopularBreeds, breedDistribution] =
      await Promise.all([
        this.prisma.breed.count(),
        this.prisma.breed.findMany({
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
          by: ["breedId"],
          _count: true,
          orderBy: {
            _count: {
              breedId: "desc",
            },
          },
        }),
      ]);

    return {
      totalBreeds,
      mostPopularBreeds,
      breedDistribution,
    };
  }
}
