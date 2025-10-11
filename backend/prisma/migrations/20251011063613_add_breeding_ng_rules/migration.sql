-- CreateEnum
CREATE TYPE "public"."BreedingNgRuleType" AS ENUM ('TAG_COMBINATION', 'INDIVIDUAL_PROHIBITION', 'GENERATION_LIMIT');

-- CreateTable
CREATE TABLE "public"."breeding_ng_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."BreedingNgRuleType" NOT NULL DEFAULT 'TAG_COMBINATION',
    "male_conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "female_conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "male_names" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "female_names" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "generation_limit" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breeding_ng_rules_pkey" PRIMARY KEY ("id")
);
