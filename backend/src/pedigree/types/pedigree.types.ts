import { Prisma } from '@prisma/client';

// Interface for dynamic where conditions with proper typing
export interface PedigreeWhereInput {
  OR?: Array<{
    [key: string]: {
      contains?: string;
      mode?: 'insensitive';
    };
  }>;
  breedId?: string;
  colorId?: string;
  gender?: number;
  eyeColor?: string;
}

// Type for query building without any
export interface QueryFilterInput {
  [key: string]: string | undefined;
}

// Type for safe field mapping
export interface FieldMapping {
  [dtoField: string]: string; // Maps DTO field to database field
}

// Pedigree with relationships for responses
export type PedigreeWithRelations = Prisma.PedigreeGetPayload<{
  include: {
    breed: { select: { name: true } };
    color: { select: { name: true } };
    cat: { select: { id: true, name: true } };
    fatherPedigree: { select: { id: true, catName: true } };
    motherPedigree: { select: { id: true, catName: true } };
  };
}>;

// API Response types
export interface PedigreeCreateResponse {
  success: true;
  data: PedigreeWithRelations;
}

export interface PedigreeListResponse {
  success: true;
  data: PedigreeWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Type for family tree structure
export interface PedigreeTreeNode {
  id: string;
  pedigreeId: string;
  catName: string;
  title?: string;
  gender?: number;
  eyeColor?: string;
  birthDate?: Date;
  breed?: { name: string };
  color?: { name: string };
  fatherPedigreeId?: string;
  motherPedigreeId?: string;
  father?: PedigreeTreeNode;
  mother?: PedigreeTreeNode;
}

export interface PedigreeSuccessResponse {
  success: true;
}