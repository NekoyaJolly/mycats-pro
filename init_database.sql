-- Database initialization for Cat Management System
-- This script creates all necessary tables based on the Prisma schema

-- Create enums
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');
CREATE TYPE "BreedingStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED');
CREATE TYPE "CareType" AS ENUM ('VACCINATION', 'HEALTH_CHECK', 'GROOMING', 'DENTAL_CARE', 'MEDICATION', 'SURGERY', 'OTHER');
CREATE TYPE "ScheduleType" AS ENUM ('BREEDING', 'CARE', 'APPOINTMENT', 'REMINDER', 'MAINTENANCE');
CREATE TYPE "ScheduleStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clerkId" TEXT NOT NULL UNIQUE,
    "email" TEXT NOT NULL UNIQUE,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create cats table
CREATE TABLE IF NOT EXISTS "cats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "registrationId" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "breed" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "pattern" TEXT,
    "gender" "Gender" NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "weight" DOUBLE PRECISION,
    "microchipId" TEXT UNIQUE,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "imageUrl" TEXT,
    "fatherId" TEXT,
    "motherId" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "cats_fatherId_fkey" FOREIGN KEY ("fatherId") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "cats_motherId_fkey" FOREIGN KEY ("motherId") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "cats_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create breeding_records table
CREATE TABLE IF NOT EXISTS "breeding_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "breeding_records_maleId_fkey" FOREIGN KEY ("maleId") REFERENCES "cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "breeding_records_femaleId_fkey" FOREIGN KEY ("femaleId") REFERENCES "cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "breeding_records_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create care_records table
CREATE TABLE IF NOT EXISTS "care_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "care_records_catId_fkey" FOREIGN KEY ("catId") REFERENCES "cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "care_records_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create schedules table
CREATE TABLE IF NOT EXISTS "schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduleDate" TIMESTAMP(3) NOT NULL,
    "scheduleType" "ScheduleType" NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "catId" TEXT,
    "assignedTo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "schedules_catId_fkey" FOREIGN KEY ("catId") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "schedules_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create tags table
CREATE TABLE IF NOT EXISTS "tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create cat_tags table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS "cat_tags" (
    "catId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("catId", "tagId"),
    CONSTRAINT "cat_tags_catId_fkey" FOREIGN KEY ("catId") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cat_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Prisma migration table
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checksum" TEXT NOT NULL,
    "finished_at" TIMESTAMP(3),
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0
);

-- Insert initial migration record
INSERT INTO "_prisma_migrations" ("id", "checksum", "migration_name", "started_at", "applied_steps_count")
VALUES ('manual-init-' || extract(epoch from now())::text, 'manual-init', 'manual_database_initialization', CURRENT_TIMESTAMP, 1)
ON CONFLICT ("id") DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_cats_owner" ON "cats"("ownerId");
CREATE INDEX IF NOT EXISTS "idx_cats_registration" ON "cats"("registrationId");
CREATE INDEX IF NOT EXISTS "idx_breeding_records_male" ON "breeding_records"("maleId");
CREATE INDEX IF NOT EXISTS "idx_breeding_records_female" ON "breeding_records"("femaleId");
CREATE INDEX IF NOT EXISTS "idx_care_records_cat" ON "care_records"("catId");
CREATE INDEX IF NOT EXISTS "idx_schedules_cat" ON "schedules"("catId");
CREATE INDEX IF NOT EXISTS "idx_schedules_assignee" ON "schedules"("assignedTo");
CREATE INDEX IF NOT EXISTS "idx_schedules_date" ON "schedules"("scheduleDate");
