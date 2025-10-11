import type { Prisma, BreedingNgRuleType } from '@prisma/client';

export interface BreedingWhereInput {
  femaleId?: string;
  maleId?: string;
  breedingDate?: {
    gte?: Date;
    lte?: Date;
  };
}

// Type for the Prisma select operations
export type BreedingRecordWithRelations = Prisma.BreedingRecordGetPayload<{
  include: {
    male: { select: { id: true; name: true } };
    female: { select: { id: true; name: true } };
  };
}>;

// Type for the Cat with gender property for validation
export interface CatWithGender {
  id: string;
  gender: string;
}

// API Response types
export interface BreedingListResponse {
  success: true;
  data: BreedingRecordWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BreedingCreateResponse {
  success: true;
  data: BreedingRecordWithRelations;
}

export interface BreedingSuccessResponse {
  success: true;
}

export interface BreedingNgRule {
  id: string;
  name: string;
  description: string | null;
  type: BreedingNgRuleType;
  maleConditions: string[];
  femaleConditions: string[];
  maleNames: string[];
  femaleNames: string[];
  generationLimit: number | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BreedingNgRuleListResponse {
  success: true;
  data: BreedingNgRule[];
}

export interface BreedingNgRuleResponse {
  success: true;
  data: BreedingNgRule;
}