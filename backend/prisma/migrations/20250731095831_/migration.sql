-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "BreedingStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "CareType" AS ENUM ('VACCINATION', 'HEALTH_CHECK', 'GROOMING', 'DENTAL_CARE', 'MEDICATION', 'SURGERY', 'OTHER');

-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('BREEDING', 'CARE', 'APPOINTMENT', 'REMINDER', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breeds" (
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
CREATE TABLE "coat_colors" (
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
CREATE TABLE "cats" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breedId" TEXT,
    "colorId" TEXT,
    "legacyBreed" TEXT,
    "legacyColor" TEXT,
    "pattern" TEXT,
    "gender" "Gender" NOT NULL,
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
CREATE TABLE "breeding_records" (
    "id" TEXT NOT NULL,
    "maleId" TEXT NOT NULL,
    "femaleId" TEXT NOT NULL,
    "breedingDate" TIMESTAMP(3) NOT NULL,
    "expectedDueDate" TIMESTAMP(3),
    "actualDueDate" TIMESTAMP(3),
    "numberOfKittens" INTEGER,
    "notes" TEXT,
    "status" "BreedingStatus" NOT NULL DEFAULT 'PLANNED',
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breeding_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_records" (
    "id" TEXT NOT NULL,
    "catId" TEXT NOT NULL,
    "careType" "CareType" NOT NULL,
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
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduleDate" TIMESTAMP(3) NOT NULL,
    "scheduleType" "ScheduleType" NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "catId" TEXT,
    "assignedTo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedigrees" (
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

    CONSTRAINT "pedigrees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cat_tags" (
    "catId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cat_tags_pkey" PRIMARY KEY ("catId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "breeds_code_key" ON "breeds"("code");

-- CreateIndex
CREATE UNIQUE INDEX "breeds_name_key" ON "breeds"("name");

-- CreateIndex
CREATE UNIQUE INDEX "coat_colors_code_key" ON "coat_colors"("code");

-- CreateIndex
CREATE UNIQUE INDEX "coat_colors_name_key" ON "coat_colors"("name");

-- CreateIndex
CREATE UNIQUE INDEX "cats_registrationId_key" ON "cats"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "cats_microchipId_key" ON "cats"("microchipId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pedigrees_pedigreeId_key" ON "pedigrees"("pedigreeId");

-- AddForeignKey
ALTER TABLE "cats" ADD CONSTRAINT "cats_breedId_fkey" FOREIGN KEY ("breedId") REFERENCES "breeds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cats" ADD CONSTRAINT "cats_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "coat_colors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cats" ADD CONSTRAINT "cats_fatherId_fkey" FOREIGN KEY ("fatherId") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cats" ADD CONSTRAINT "cats_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cats" ADD CONSTRAINT "cats_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_records" ADD CONSTRAINT "breeding_records_maleId_fkey" FOREIGN KEY ("maleId") REFERENCES "cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_records" ADD CONSTRAINT "breeding_records_femaleId_fkey" FOREIGN KEY ("femaleId") REFERENCES "cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_records" ADD CONSTRAINT "breeding_records_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_records" ADD CONSTRAINT "care_records_catId_fkey" FOREIGN KEY ("catId") REFERENCES "cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_records" ADD CONSTRAINT "care_records_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_catId_fkey" FOREIGN KEY ("catId") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedigrees" ADD CONSTRAINT "pedigrees_catId_fkey" FOREIGN KEY ("catId") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedigrees" ADD CONSTRAINT "pedigrees_breedId_fkey" FOREIGN KEY ("breedId") REFERENCES "breeds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedigrees" ADD CONSTRAINT "pedigrees_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "coat_colors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedigrees" ADD CONSTRAINT "pedigrees_fatherPedigreeId_fkey" FOREIGN KEY ("fatherPedigreeId") REFERENCES "pedigrees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedigrees" ADD CONSTRAINT "pedigrees_motherPedigreeId_fkey" FOREIGN KEY ("motherPedigreeId") REFERENCES "pedigrees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedigrees" ADD CONSTRAINT "pedigrees_paternalGrandfatherId_fkey" FOREIGN KEY ("paternalGrandfatherId") REFERENCES "pedigrees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedigrees" ADD CONSTRAINT "pedigrees_paternalGrandmotherId_fkey" FOREIGN KEY ("paternalGrandmotherId") REFERENCES "pedigrees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedigrees" ADD CONSTRAINT "pedigrees_maternalGrandfatherId_fkey" FOREIGN KEY ("maternalGrandfatherId") REFERENCES "pedigrees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedigrees" ADD CONSTRAINT "pedigrees_maternalGrandmotherId_fkey" FOREIGN KEY ("maternalGrandmotherId") REFERENCES "pedigrees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cat_tags" ADD CONSTRAINT "cat_tags_catId_fkey" FOREIGN KEY ("catId") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cat_tags" ADD CONSTRAINT "cat_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
