import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedigreeDto, UpdatePedigreeDto, PedigreeQueryDto } from './dto';

@Injectable()
export class PedigreeService {
  constructor(private prisma: PrismaService) {}

  async create(createPedigreeDto: CreatePedigreeDto) {
    return this.prisma.pedigree.create({
      data: createPedigreeDto,
      include: {
        breed: true,
        color: true,
        cat: true,
      },
    });
  }

  async findAll(query: PedigreeQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      breedId,
      colorId,
      gender,
      championFlag,
      catteryName,
      eyeColor,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    // Search functionality
    if (search) {
      where.OR = [
        { catName: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { catteryName: { contains: search, mode: 'insensitive' } },
        { breederName: { contains: search, mode: 'insensitive' } },
        { ownerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (breedId) where.breedId = breedId;
    if (colorId) where.colorId = colorId;
    if (gender) where.gender = parseInt(gender);
    if (championFlag) where.championFlag = championFlag;
    if (catteryName) where.catteryName = { contains: catteryName, mode: 'insensitive' };
    if (eyeColor) where.eyeColor = { contains: eyeColor, mode: 'insensitive' };

    const [pedigrees, total] = await Promise.all([
      this.prisma.pedigree.findMany({
        where,
        skip,
        take: limit,
        include: {
          breed: true,
          color: true,
          cat: true,
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
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.pedigree.count({ where }),
    ]);

    return {
      data: pedigrees,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const pedigree = await this.prisma.pedigree.findUnique({
      where: { id },
      include: {
        breed: true,
        color: true,
        cat: true,
        fatherPedigree: {
          include: {
            breed: true,
            color: true,
            fatherPedigree: true,
            motherPedigree: true,
          },
        },
        motherPedigree: {
          include: {
            breed: true,
            color: true,
            fatherPedigree: true,
            motherPedigree: true,
          },
        },
        fatherOf: {
          include: {
            breed: true,
            color: true,
          },
        },
        motherOf: {
          include: {
            breed: true,
            color: true,
          },
        },
      },
    });

    if (!pedigree) {
      throw new NotFoundException(`Pedigree with ID ${id} not found`);
    }

    return pedigree;
  }

  async findByPedigreeId(pedigreeId: string) {
    const pedigree = await this.prisma.pedigree.findUnique({
      where: { pedigreeId },
      include: {
        breed: true,
        color: true,
        cat: true,
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
    });

    if (!pedigree) {
      throw new NotFoundException(`Pedigree with pedigree ID ${pedigreeId} not found`);
    }

    return pedigree;
  }

  async update(id: string, updatePedigreeDto: UpdatePedigreeDto) {
    const existingPedigree = await this.prisma.pedigree.findUnique({
      where: { id },
    });

    if (!existingPedigree) {
      throw new NotFoundException(`Pedigree with ID ${id} not found`);
    }

    return this.prisma.pedigree.update({
      where: { id },
      data: updatePedigreeDto,
      include: {
        breed: true,
        color: true,
        cat: true,
      },
    });
  }

  async remove(id: string) {
    const existingPedigree = await this.prisma.pedigree.findUnique({
      where: { id },
    });

    if (!existingPedigree) {
      throw new NotFoundException(`Pedigree with ID ${id} not found`);
    }

    return this.prisma.pedigree.delete({
      where: { id },
      include: {
        breed: true,
        color: true,
        cat: true,
      },
    });
  }

  async getFamily(id: string, generations: number = 3) {
    const pedigree = await this.findOne(id);
    
    // Build family tree recursively
    const buildFamilyTree = async (pedigreeData: any, currentGeneration: number): Promise<any> => {
      if (currentGeneration >= generations) {
        return pedigreeData;
      }

      const result = { ...pedigreeData };

      if (pedigreeData.fatherPedigreeId) {
        const father = await this.prisma.pedigree.findUnique({
          where: { id: pedigreeData.fatherPedigreeId },
          include: {
            breed: true,
            color: true,
            fatherPedigree: true,
            motherPedigree: true,
          },
        });
        if (father) {
          result.father = await buildFamilyTree(father, currentGeneration + 1);
        }
      }

      if (pedigreeData.motherPedigreeId) {
        const mother = await this.prisma.pedigree.findUnique({
          where: { id: pedigreeData.motherPedigreeId },
          include: {
            breed: true,
            color: true,
            fatherPedigree: true,
            motherPedigree: true,
          },
        });
        if (mother) {
          result.mother = await buildFamilyTree(mother, currentGeneration + 1);
        }
      }

      return result;
    };

    return buildFamilyTree(pedigree, 0);
  }

  async getFamilyTree(id: string, generations: number = 3) {
    return this.getFamily(id, generations);
  }

  async getDescendants(id: string) {
    const pedigree = await this.findOne(id);
    
    const descendants = await this.prisma.pedigree.findMany({
      where: {
        OR: [
          { fatherPedigreeId: id },
          { motherPedigreeId: id },
        ],
      },
      include: {
        breed: true,
        color: true,
        cat: true,
      },
    });

    return {
      pedigree,
      children: descendants,
    };
  }
}
