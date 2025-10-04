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
    "clerk_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "password_hash" TEXT,
    "refresh_token" TEXT,
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "success" BOOLEAN NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breeds" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breeds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coat_colors" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coat_colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cats" (
    "id" TEXT NOT NULL,
    "registration_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "breed_id" TEXT,
    "color_id" TEXT,
    "legacy_breed" TEXT,
    "legacy_color" TEXT,
    "pattern" TEXT,
    "gender" "Gender" NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "weight" DOUBLE PRECISION,
    "microchip_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "image_url" TEXT,
    "father_id" TEXT,
    "mother_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "pedigree_id" TEXT,

    CONSTRAINT "cats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "breeding_records" (
    "id" TEXT NOT NULL,
    "male_id" TEXT NOT NULL,
    "female_id" TEXT NOT NULL,
    "breeding_date" TIMESTAMP(3) NOT NULL,
    "expected_due_date" TIMESTAMP(3),
    "actual_due_date" TIMESTAMP(3),
    "number_of_kittens" INTEGER,
    "notes" TEXT,
    "status" "BreedingStatus" NOT NULL DEFAULT 'PLANNED',
    "recorded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "breeding_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_records" (
    "id" TEXT NOT NULL,
    "cat_id" TEXT NOT NULL,
    "care_type" "CareType" NOT NULL,
    "description" TEXT NOT NULL,
    "care_date" TIMESTAMP(3) NOT NULL,
    "next_due_date" TIMESTAMP(3),
    "cost" DOUBLE PRECISION,
    "veterinarian" TEXT,
    "notes" TEXT,
    "recorded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "schedule_date" TIMESTAMP(3) NOT NULL,
    "schedule_type" "ScheduleType" NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "cat_id" TEXT,
    "assigned_to" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedigrees" (
    "id" TEXT NOT NULL,
    "pedigree_id" TEXT NOT NULL,
    "title" TEXT,
    "cat_name" TEXT,
    "cat_name2" TEXT,
    "breed_code" INTEGER,
    "gender_code" INTEGER,
    "eye_color" TEXT,
    "coat_color_code" INTEGER,
    "birth_date" TEXT,
    "breeder_name" TEXT,
    "owner_name" TEXT,
    "registration_date" TEXT,
    "brother_count" INTEGER,
    "sister_count" INTEGER,
    "notes" TEXT,
    "notes2" TEXT,
    "other_no" TEXT,
    "father_title" TEXT,
    "father_cat_name" TEXT,
    "father_cat_name2" TEXT,
    "father_coat_color" TEXT,
    "father_eye_color" TEXT,
    "father_jcu" TEXT,
    "father_other_code" TEXT,
    "mother_title" TEXT,
    "mother_cat_name" TEXT,
    "mother_cat_name2" TEXT,
    "mother_coat_color" TEXT,
    "mother_eye_color" TEXT,
    "mother_jcu" TEXT,
    "mother_other_code" TEXT,
    "ff_title" TEXT,
    "ff_cat_name" TEXT,
    "ff_cat_color" TEXT,
    "ff_jcu" TEXT,
    "fm_title" TEXT,
    "fm_cat_name" TEXT,
    "fm_cat_color" TEXT,
    "fm_jcu" TEXT,
    "mf_title" TEXT,
    "mf_cat_name" TEXT,
    "mf_cat_color" TEXT,
    "mf_jcu" TEXT,
    "mm_title" TEXT,
    "mm_cat_name" TEXT,
    "mm_cat_color" TEXT,
    "mm_jcu" TEXT,
    "fff_title" TEXT,
    "fff_cat_name" TEXT,
    "fff_cat_color" TEXT,
    "fff_jcu" TEXT,
    "ffm_title" TEXT,
    "ffm_cat_name" TEXT,
    "ffm_cat_color" TEXT,
    "ffm_jcu" TEXT,
    "fmf_title" TEXT,
    "fmf_cat_name" TEXT,
    "fmf_cat_color" TEXT,
    "fmf_jcu" TEXT,
    "fmm_title" TEXT,
    "fmm_cat_name" TEXT,
    "fmm_cat_color" TEXT,
    "fmm_jcu" TEXT,
    "mff_title" TEXT,
    "mff_cat_name" TEXT,
    "mff_cat_color" TEXT,
    "mff_jcu" TEXT,
    "mfm_title" TEXT,
    "mfm_cat_name" TEXT,
    "mfm_cat_color" TEXT,
    "mfm_jcu" TEXT,
    "mmf_title" TEXT,
    "mmf_cat_name" TEXT,
    "mmf_cat_color" TEXT,
    "mmf_jcu" TEXT,
    "mmm_title" TEXT,
    "mmm_cat_name" TEXT,
    "mmm_cat_color" TEXT,
    "mmm_jcu" TEXT,
    "old_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedigrees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cat_tags" (
    "cat_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cat_tags_pkey" PRIMARY KEY ("cat_id","tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

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
CREATE UNIQUE INDEX "cats_registration_id_key" ON "cats"("registration_id");

-- CreateIndex
CREATE UNIQUE INDEX "cats_microchip_id_key" ON "cats"("microchip_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "pedigrees_pedigree_id_key" ON "pedigrees"("pedigree_id");

-- AddForeignKey
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cats" ADD CONSTRAINT "cats_breed_id_fkey" FOREIGN KEY ("breed_id") REFERENCES "breeds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cats" ADD CONSTRAINT "cats_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "coat_colors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cats" ADD CONSTRAINT "cats_father_id_fkey" FOREIGN KEY ("father_id") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cats" ADD CONSTRAINT "cats_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_records" ADD CONSTRAINT "breeding_records_male_id_fkey" FOREIGN KEY ("male_id") REFERENCES "cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_records" ADD CONSTRAINT "breeding_records_female_id_fkey" FOREIGN KEY ("female_id") REFERENCES "cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "breeding_records" ADD CONSTRAINT "breeding_records_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_records" ADD CONSTRAINT "care_records_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_records" ADD CONSTRAINT "care_records_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cat_tags" ADD CONSTRAINT "cat_tags_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cat_tags" ADD CONSTRAINT "cat_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
