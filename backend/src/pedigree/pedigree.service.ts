import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

import { CreatePedigreeDto, UpdatePedigreeDto, PedigreeQueryDto } from "./dto";
import {
  PedigreeWhereInput,
  PedigreeCreateResponse,
  PedigreeListResponse,
  PedigreeSuccessResponse,
  PedigreeTreeNode,
} from "./types/pedigree.types";

@Injectable()
export class PedigreeService {
  constructor(private prisma: PrismaService) {}

  async create(createPedigreeDto: CreatePedigreeDto): Promise<PedigreeCreateResponse> {
    // Prisma の型に適合するようにデータを準備
    const createData = {
      pedigreeId: createPedigreeDto.pedigreeId,
      catName: createPedigreeDto.catName,
      ...(createPedigreeDto.title && { title: createPedigreeDto.title }),
      ...(createPedigreeDto.gender !== undefined && { gender: createPedigreeDto.gender }),
      ...(createPedigreeDto.eyeColor && { eyeColor: createPedigreeDto.eyeColor }),
      ...(createPedigreeDto.birthDate && { 
        birthDate: new Date(createPedigreeDto.birthDate) 
      }),
      ...(createPedigreeDto.registrationDate && { 
        registrationDate: new Date(createPedigreeDto.registrationDate) 
      }),
      ...(createPedigreeDto.breederName && { breederName: createPedigreeDto.breederName }),
      ...(createPedigreeDto.ownerName && { ownerName: createPedigreeDto.ownerName }),
      ...(createPedigreeDto.brotherCount !== undefined && { brotherCount: createPedigreeDto.brotherCount }),
      ...(createPedigreeDto.sisterCount !== undefined && { sisterCount: createPedigreeDto.sisterCount }),
      ...(createPedigreeDto.notes && { notes: createPedigreeDto.notes }),
      ...(createPedigreeDto.notes2 && { notes2: createPedigreeDto.notes2 }),
      ...(createPedigreeDto.otherNo && { otherNo: createPedigreeDto.otherNo }),
      ...(createPedigreeDto.oldCode && { oldCode: createPedigreeDto.oldCode }),
      ...(createPedigreeDto.catId && { catId: createPedigreeDto.catId }),
      ...(createPedigreeDto.breedId && { breedId: createPedigreeDto.breedId }),
      ...(createPedigreeDto.colorId && { colorId: createPedigreeDto.colorId }),
      ...(createPedigreeDto.pedigreeIssueDate && { 
        pedigreeIssueDate: new Date(createPedigreeDto.pedigreeIssueDate) 
      }),
      ...(createPedigreeDto.breedCode !== undefined && { breedCode: createPedigreeDto.breedCode }),
      ...(createPedigreeDto.coatColorCode !== undefined && { coatColorCode: createPedigreeDto.coatColorCode }),
      ...(createPedigreeDto.fatherPedigreeId && { fatherPedigreeId: createPedigreeDto.fatherPedigreeId }),
      ...(createPedigreeDto.motherPedigreeId && { motherPedigreeId: createPedigreeDto.motherPedigreeId }),
      ...(createPedigreeDto.paternalGrandfatherId && { paternalGrandfatherId: createPedigreeDto.paternalGrandfatherId }),
      ...(createPedigreeDto.paternalGrandmotherId && { paternalGrandmotherId: createPedigreeDto.paternalGrandmotherId }),
      ...(createPedigreeDto.maternalGrandfatherId && { maternalGrandfatherId: createPedigreeDto.maternalGrandfatherId }),
      ...(createPedigreeDto.maternalGrandmotherId && { maternalGrandmotherId: createPedigreeDto.maternalGrandmotherId }),
    };

    const result = await this.prisma.pedigree.create({
      data: createData,
      include: {
        breed: { select: { name: true } },
        color: { select: { name: true } },
        cat: { select: { id: true, name: true } },
        fatherPedigree: { select: { id: true, catName: true } },
        motherPedigree: { select: { id: true, catName: true } },
      },
    });

    return { success: true, data: result };
  }

  async findAll(query: PedigreeQueryDto): Promise<PedigreeListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      breedId,
      colorId,
      gender,
      catName2: _catName2,
      eyeColor,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: PedigreeWhereInput = {};

    // Search functionality
    if (search) {
      where.OR = [
        { catName: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
        { breederName: { contains: search, mode: "insensitive" } },
        { ownerName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filters
    if (breedId) where.breedId = breedId;
    if (colorId) where.colorId = colorId;
    if (gender) where.gender = parseInt(gender);
    if (eyeColor) where.eyeColor = eyeColor;

    const [pedigrees, total] = await Promise.all([
      this.prisma.pedigree.findMany({
        where,
        skip,
        take: limit,
        include: {
          breed: { select: { name: true } },
          color: { select: { name: true } },
          cat: { select: { id: true, name: true } },
          fatherPedigree: { select: { id: true, catName: true } },
          motherPedigree: { select: { id: true, catName: true } },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.pedigree.count({ where }),
    ]);

    return {
      success: true,
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
      throw new NotFoundException(
        `Pedigree with pedigree ID ${pedigreeId} not found`,
      );
    }

    return pedigree;
  }

  async update(id: string, updatePedigreeDto: UpdatePedigreeDto): Promise<PedigreeCreateResponse> {
    const existingPedigree = await this.prisma.pedigree.findUnique({
      where: { id },
    });

    if (!existingPedigree) {
      throw new NotFoundException(`Pedigree with ID ${id} not found`);
    }

    // Prisma の型に適合するようにデータを準備
    const updateData = {
      ...(updatePedigreeDto.pedigreeId && { pedigreeId: updatePedigreeDto.pedigreeId }),
      ...(updatePedigreeDto.catName && { catName: updatePedigreeDto.catName }),
      ...(updatePedigreeDto.title && { title: updatePedigreeDto.title }),
      ...(updatePedigreeDto.gender !== undefined && { gender: updatePedigreeDto.gender }),
      ...(updatePedigreeDto.eyeColor && { eyeColor: updatePedigreeDto.eyeColor }),
      ...(updatePedigreeDto.birthDate && { 
        birthDate: new Date(updatePedigreeDto.birthDate) 
      }),
      ...(updatePedigreeDto.registrationDate && { 
        registrationDate: new Date(updatePedigreeDto.registrationDate) 
      }),
      ...(updatePedigreeDto.pedigreeIssueDate && { 
        pedigreeIssueDate: new Date(updatePedigreeDto.pedigreeIssueDate) 
      }),
      ...(updatePedigreeDto.breederName && { breederName: updatePedigreeDto.breederName }),
      ...(updatePedigreeDto.ownerName && { ownerName: updatePedigreeDto.ownerName }),
      ...(updatePedigreeDto.brotherCount !== undefined && { brotherCount: updatePedigreeDto.brotherCount }),
      ...(updatePedigreeDto.sisterCount !== undefined && { sisterCount: updatePedigreeDto.sisterCount }),
      ...(updatePedigreeDto.notes && { notes: updatePedigreeDto.notes }),
      ...(updatePedigreeDto.notes2 && { notes2: updatePedigreeDto.notes2 }),
      ...(updatePedigreeDto.otherNo && { otherNo: updatePedigreeDto.otherNo }),
      ...(updatePedigreeDto.oldCode && { oldCode: updatePedigreeDto.oldCode }),
      ...(updatePedigreeDto.catId && { catId: updatePedigreeDto.catId }),
      ...(updatePedigreeDto.breedId && { breedId: updatePedigreeDto.breedId }),
      ...(updatePedigreeDto.colorId && { colorId: updatePedigreeDto.colorId }),
      ...(updatePedigreeDto.breedCode !== undefined && { breedCode: updatePedigreeDto.breedCode }),
      ...(updatePedigreeDto.coatColorCode !== undefined && { coatColorCode: updatePedigreeDto.coatColorCode }),
      ...(updatePedigreeDto.fatherPedigreeId && { fatherPedigreeId: updatePedigreeDto.fatherPedigreeId }),
      ...(updatePedigreeDto.motherPedigreeId && { motherPedigreeId: updatePedigreeDto.motherPedigreeId }),
      ...(updatePedigreeDto.paternalGrandfatherId && { paternalGrandfatherId: updatePedigreeDto.paternalGrandfatherId }),
      ...(updatePedigreeDto.paternalGrandmotherId && { paternalGrandmotherId: updatePedigreeDto.paternalGrandmotherId }),
      ...(updatePedigreeDto.maternalGrandfatherId && { maternalGrandfatherId: updatePedigreeDto.maternalGrandfatherId }),
      ...(updatePedigreeDto.maternalGrandmotherId && { maternalGrandmotherId: updatePedigreeDto.maternalGrandmotherId }),
    };

    const result = await this.prisma.pedigree.update({
      where: { id },
      data: updateData,
      include: {
        breed: { select: { name: true } },
        color: { select: { name: true } },
        cat: { select: { id: true, name: true } },
        fatherPedigree: { select: { id: true, catName: true } },
        motherPedigree: { select: { id: true, catName: true } },
      },
    });

    return { success: true, data: result };
  }

  async remove(id: string): Promise<PedigreeSuccessResponse> {
    const existingPedigree = await this.prisma.pedigree.findUnique({
      where: { id },
    });

    if (!existingPedigree) {
      throw new NotFoundException(`Pedigree with ID ${id} not found`);
    }

    await this.prisma.pedigree.delete({
      where: { id },
    });

    return { success: true };
  }

  async getFamily(id: string, generations: number = 3): Promise<PedigreeTreeNode> {
    const pedigree = await this.findOne(id);

    // Build family tree recursively
    const buildFamilyTree = async (
      pedigreeData: PedigreeTreeNode,
      currentGeneration: number,
    ): Promise<PedigreeTreeNode> => {
      if (currentGeneration >= generations) {
        return pedigreeData;
      }

      const result: PedigreeTreeNode = { ...pedigreeData };

      if (pedigreeData.fatherPedigreeId) {
        const father = await this.prisma.pedigree.findUnique({
          where: { id: pedigreeData.fatherPedigreeId },
          include: {
            breed: { select: { name: true } },
            color: { select: { name: true } },
          },
        });
        if (father) {
          result.father = await buildFamilyTree(father as PedigreeTreeNode, currentGeneration + 1);
        }
      }

      if (pedigreeData.motherPedigreeId) {
        const mother = await this.prisma.pedigree.findUnique({
          where: { id: pedigreeData.motherPedigreeId },
          include: {
            breed: { select: { name: true } },
            color: { select: { name: true } },
          },
        });
        if (mother) {
          result.mother = await buildFamilyTree(mother as PedigreeTreeNode, currentGeneration + 1);
        }
      }

      return result;
    };

    return buildFamilyTree(pedigree as PedigreeTreeNode, 0);
  }

  async getFamilyTree(id: string, generations: number = 3): Promise<PedigreeTreeNode> {
    return this.getFamily(id, generations);
  }

  async getDescendants(id: string) {
    const pedigree = await this.findOne(id);

    const descendants = await this.prisma.pedigree.findMany({
      where: {
        OR: [{ fatherPedigreeId: id }, { motherPedigreeId: id }],
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
