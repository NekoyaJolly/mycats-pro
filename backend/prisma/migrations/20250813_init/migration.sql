-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."BreedingStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."CareType" AS ENUM ('VACCINATION', 'HEALTH_CHECK', 'GROOMING', 'DENTAL_CARE', 'MEDICATION', 'SURGERY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ScheduleType" AS ENUM ('BREEDING', 'CARE', 'APPOINTMENT', 'REMINDER', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "public"."ScheduleStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "passwordHash" TEXT,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."login_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."breeds" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."coat_colors" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coat_colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cats" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breedId" TEXT,
    "colorId" TEXT,
    "legacyBreed" TEXT,
    "legacyColor" TEXT,
    "pattern" TEXT,
    "gender" "public"."Gender" NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "weight" DOUBLE PRECISION,
    "microchipId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "imageUrl" TEXT,
    "fatherId" TEXT,
    "motherId" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."breeding_records" (
    "id" TEXT NOT NULL,
    "maleId" TEXT NOT NULL,
    "femaleId" TEXT NOT NULL,
    "breedingDate" TIMESTAMP(3) NOT NULL,
    "expectedDueDate" TIMESTAMP(3),
    "actualDueDate" TIMESTAMP(3),
    "numberOfKittens" INTEGER,
    "notes" TEXT,
    "status" "public"."BreedingStatus" NOT NULL DEFAULT 'PLANNED',
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breeding_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."care_records" (
    "id" TEXT NOT NULL,
    "catId" TEXT NOT NULL,
    "careType" "public"."CareType" NOT NULL,
    "description" TEXT NOT NULL,
    "careDate" TIMESTAMP(3) NOT NULL,
    "nextDueDate" TIMESTAMP(3),
    "cost" DOUBLE PRECISION,
    "veterinarian" TEXT,
    "notes" TEXT,
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."schedules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduleDate" TIMESTAMP(3) NOT NULL,
    "scheduleType" "public"."ScheduleType" NOT NULL,
    "status" "public"."ScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "public"."Priority" NOT NULL DEFAULT 'MEDIUM',
    "catId" TEXT,
    "assignedTo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pedigrees" (
    "id" TEXT NOT NULL,
    "pedigreeId" TEXT NOT NULL,
    "catId" TEXT,
    "title" TEXT,
    "catteryName" TEXT,
    "catName" TEXT NOT NULL,
    "breedId" TEXT,
    "breedCode" INTEGER,
    "gender" INTEGER,
    "eyeColor" TEXT,
    "colorId" TEXT,
    "coatColorCode" INTEGER,
    "birthDate" TIMESTAMP(3),
    "registrationDate" TIMESTAMP(3),
    "breederName" TEXT,
    "ownerName" TEXT,
    "brotherCount" INTEGER,
    "sisterCount" INTEGER,
    "notes" TEXT,
    "notes2" TEXT,
    "otherNo" TEXT,
    "championFlag" TEXT,
    "oldCode" TEXT,
    "fatherPedigreeId" TEXT,
    "motherPedigreeId" TEXT,
    "paternalGrandfatherId" TEXT,
    "paternalGrandmotherId" TEXT,
    "maternalGrandfatherId" TEXT,
    "maternalGrandmotherId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "catName2" TEXT,
    "pedigreeIssueDate" TIMESTAMP(3),

    CONSTRAINT "pedigrees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cat_tags" (
    "catId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cat_tags_pkey" PRIMARY KEY ("catId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "public"."users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "breeds_code_key" ON "public"."breeds"("code");

-- CreateIndex
CREATE UNIQUE INDEX "breeds_name_key" ON "public"."breeds"("name");

-- CreateIndex
CREATE UNIQUE INDEX "coat_colors_code_key" ON "public"."coat_colors"("code");

-- CreateIndex
CREATE UNIQUE INDEX "coat_colors_name_key" ON "public"."coat_colors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cats_registrationId_key" ON "public"."cats"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "cats_microchipId_key" ON "public"."cats"("microchipId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "public"."tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pedigrees_pedigreeId_key" ON "public"."pedigrees"("pedigreeId");

-- AddForeignKey
ALTER TABLE "public"."login_attempts" ADD CONSTRAINT "login_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cats" ADD CONSTRAINT "cats_breedId_fkey" FOREIGN KEY ("breedId") REFERENCES "public"."breeds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cats" ADD CONSTRAINT "cats_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "public"."coat_colors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cats" ADD CONSTRAINT "cats_fatherId_fkey" FOREIGN KEY ("fatherId") REFERENCES "public"."cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cats" ADD CONSTRAINT "cats_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "public"."cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cats" ADD CONSTRAINT "cats_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."breeding_records" ADD CONSTRAINT "breeding_records_femaleId_fkey" FOREIGN KEY ("femaleId") REFERENCES "public"."cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."breeding_records" ADD CONSTRAINT "breeding_records_maleId_fkey" FOREIGN KEY ("maleId") REFERENCES "public"."cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."breeding_records" ADD CONSTRAINT "breeding_records_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."care_records" ADD CONSTRAINT "care_records_catId_fkey" FOREIGN KEY ("catId") REFERENCES "public"."cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."care_records" ADD CONSTRAINT "care_records_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedules" ADD CONSTRAINT "schedules_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedules" ADD CONSTRAINT "schedules_catId_fkey" FOREIGN KEY ("catId") REFERENCES "public"."cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedigrees" ADD CONSTRAINT "pedigrees_breedId_fkey" FOREIGN KEY ("breedId") REFERENCES "public"."breeds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedigrees" ADD CONSTRAINT "pedigrees_catId_fkey" FOREIGN KEY ("catId") REFERENCES "public"."cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedigrees" ADD CONSTRAINT "pedigrees_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "public"."coat_colors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedigrees" ADD CONSTRAINT "pedigrees_fatherPedigreeId_fkey" FOREIGN KEY ("fatherPedigreeId") REFERENCES "public"."pedigrees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedigrees" ADD CONSTRAINT "pedigrees_maternalGrandfatherId_fkey" FOREIGN KEY ("maternalGrandfatherId") REFERENCES "public"."pedigrees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedigrees" ADD CONSTRAINT "pedigrees_maternalGrandmotherId_fkey" FOREIGN KEY ("maternalGrandmotherId") REFERENCES "public"."pedigrees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedigrees" ADD CONSTRAINT "pedigrees_motherPedigreeId_fkey" FOREIGN KEY ("motherPedigreeId") REFERENCES "public"."pedigrees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedigrees" ADD CONSTRAINT "pedigrees_paternalGrandfatherId_fkey" FOREIGN KEY ("paternalGrandfatherId") REFERENCES "public"."pedigrees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedigrees" ADD CONSTRAINT "pedigrees_paternalGrandmotherId_fkey" FOREIGN KEY ("paternalGrandmotherId") REFERENCES "public"."pedigrees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cat_tags" ADD CONSTRAINT "cat_tags_catId_fkey" FOREIGN KEY ("catId") REFERENCES "public"."cats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cat_tags" ADD CONSTRAINT "cat_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

