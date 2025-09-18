import { Prisma } from '@prisma/client';

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