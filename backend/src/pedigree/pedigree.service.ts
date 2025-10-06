import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";

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
      ...(createPedigreeDto.birthDate && { birthDate: createPedigreeDto.birthDate }),
      ...(createPedigreeDto.registrationDate && { registrationDate: createPedigreeDto.registrationDate }),
      ...(createPedigreeDto.breederName && { breederName: createPedigreeDto.breederName }),
      ...(createPedigreeDto.ownerName && { ownerName: createPedigreeDto.ownerName }),
      ...(createPedigreeDto.brotherCount !== undefined && { brotherCount: createPedigreeDto.brotherCount }),
      ...(createPedigreeDto.sisterCount !== undefined && { sisterCount: createPedigreeDto.sisterCount }),
      ...(createPedigreeDto.notes && { notes: createPedigreeDto.notes }),
      ...(createPedigreeDto.notes2 && { notes2: createPedigreeDto.notes2 }),
      ...(createPedigreeDto.otherNo && { otherNo: createPedigreeDto.otherNo }),
      ...(createPedigreeDto.oldCode && { oldCode: createPedigreeDto.oldCode }),
      ...(createPedigreeDto.catId && { catId: createPedigreeDto.catId }),
      ...(createPedigreeDto.pedigreeIssueDate && { pedigreeIssueDate: createPedigreeDto.pedigreeIssueDate }),
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
      data: createData as any, // Type assertion for complex nested data
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
    if (breedId) where.breedCode = parseInt(breedId);
    if (colorId) where.coatColorCode = parseInt(colorId);
    if (gender) where.genderCode = parseInt(gender);
    if (eyeColor) where.eyeColor = eyeColor;

    const [pedigrees, total] = await Promise.all([
      this.prisma.pedigree.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          breed: true,
          coatColor: true,
          gender: true,
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
    });

    if (!pedigree) {
      throw new NotFoundException(`Pedigree with ID ${id} not found`);
    }

    return pedigree;
  }

  async findByPedigreeId(pedigreeId: string) {
    const pedigree = await this.prisma.pedigree.findUnique({
      where: { pedigreeId },
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
      ...(updatePedigreeDto.birthDate && { birthDate: updatePedigreeDto.birthDate }),
      ...(updatePedigreeDto.registrationDate && { registrationDate: updatePedigreeDto.registrationDate }),
      ...(updatePedigreeDto.pedigreeIssueDate && { pedigreeIssueDate: updatePedigreeDto.pedigreeIssueDate }),
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
      data: updateData as any, // Type assertion for complex nested data
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
        });
        if (father) {
          result.father = father as PedigreeTreeNode;
        }
      }

      if (pedigreeData.motherPedigreeId) {
        const mother = await this.prisma.pedigree.findUnique({
          where: { id: pedigreeData.motherPedigreeId },
        });
        if (mother) {
          result.mother = mother as PedigreeTreeNode;
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

    const nameConditions: Prisma.PedigreeWhereInput[] = [];

    if (pedigree.catName) {
      nameConditions.push({ fatherCatName: { equals: pedigree.catName } });
      nameConditions.push({ motherCatName: { equals: pedigree.catName } });
    }

    const descendants = nameConditions.length
      ? await this.prisma.pedigree.findMany({
          where: {
            OR: nameConditions,
          },
        })
      : [];

    return {
      pedigree,
      children: descendants,
    };
  }
}
