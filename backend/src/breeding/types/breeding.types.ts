// Define enums locally
export type BreedingNgRuleType = 'TAG_COMBINATION' | 'INDIVIDUAL_PROHIBITION' | 'GENERATION_LIMIT';
export type PregnancyStatus = 'CONFIRMED' | 'SUSPECTED' | 'NEGATIVE' | 'ABORTED';
export type BirthStatus = 'EXPECTED' | 'BORN' | 'ABORTED' | 'STILLBORN';

export interface BreedingWhereInput {
  femaleId?: string;
  maleId?: string;
  breedingDate?: {
    gte?: Date;
    lte?: Date;
  };
}

// Type for the Prisma select operations
export type BreedingRecordWithRelations = {
  id: string;
  maleId: string;
  femaleId: string;
  breedingDate: Date;
  expectedDueDate: Date | null;
  actualDueDate: Date | null;
  numberOfKittens: number | null;
  notes: string | null;
  status: string;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
  male: { id: string; name: string | null } | null;
  female: { id: string; name: string | null } | null;
};

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

// Pregnancy Check types
export type PregnancyCheckWithRelations = {
  id: string;
  motherId: string;
  checkDate: Date;
  status: PregnancyStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  mother: { id: string; name: string | null } | null;
};

export interface PregnancyCheckListResponse {
  success: true;
  data: PregnancyCheckWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PregnancyCheckResponse {
  success: true;
  data: PregnancyCheckWithRelations;
}

// Birth Plan types
export type BirthPlanWithRelations = {
  id: string;
  motherId: string;
  expectedBirthDate: Date;
  actualBirthDate: Date | null;
  status: BirthStatus;
  expectedKittens: number | null;
  actualKittens: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  mother: { id: string; name: string | null } | null;
};

export interface BirthPlanListResponse {
  success: true;
  data: BirthPlanWithRelations[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BirthPlanResponse {
  success: true;
  data: BirthPlanWithRelations;
}