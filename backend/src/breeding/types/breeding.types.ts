import type { Prisma, BreedingNgRuleType, PregnancyStatus, BirthStatus } from '@prisma/client';

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

// PregnancyCheck types
export interface PregnancyCheck {
  id: string;
  breedingRecordId: string;
  maleId: string;
  femaleId: string;
  maleName: string;
  femaleName: string;
  matingDate: Date;
  checkDate: Date;
  status: PregnancyStatus;
  notes: string | null;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PregnancyCheckListResponse {
  success: true;
  data: PregnancyCheck[];
}

export interface PregnancyCheckResponse {
  success: true;
  data: PregnancyCheck;
}

// BirthPlan types
export interface BirthPlan {
  id: string;
  breedingRecordId: string;
  maleId: string;
  femaleId: string;
  maleName: string;
  femaleName: string;
  matingDate: Date;
  expectedDate: Date;
  actualBirthDate: Date | null;
  numberOfKittens: number | null;
  status: BirthStatus;
  notes: string | null;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BirthPlanListResponse {
  success: true;
  data: BirthPlan[];
}

export interface BirthPlanResponse {
  success: true;
  data: BirthPlan;
}