/*
  Warnings:

  - You are about to drop the column `color_id` on the `cats` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `cats` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `cats` table. All the data in the column will be lost.
  - You are about to drop the column `legacy_breed` on the `cats` table. All the data in the column will be lost.
  - You are about to drop the column `legacy_color` on the `cats` table. All the data in the column will be lost.
  - You are about to drop the column `microchip_id` on the `cats` table. All the data in the column will be lost.
  - You are about to drop the column `pattern` on the `cats` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `cats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[microchip_number]` on the table `cats` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[category_id,name]` on the table `tag_groups` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ReminderTimingType" AS ENUM ('ABSOLUTE', 'RELATIVE');

-- CreateEnum
CREATE TYPE "public"."ReminderOffsetUnit" AS ENUM ('MINUTE', 'HOUR', 'DAY', 'WEEK', 'MONTH');

-- CreateEnum
CREATE TYPE "public"."ReminderRelativeTo" AS ENUM ('START_DATE', 'END_DATE', 'CUSTOM_DATE');

-- CreateEnum
CREATE TYPE "public"."ReminderChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "public"."ReminderRepeatFrequency" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "public"."MedicalVisitType" AS ENUM ('CHECKUP', 'EMERGENCY', 'SURGERY', 'FOLLOW_UP', 'VACCINATION', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."MedicalRecordStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."cats" DROP CONSTRAINT "cats_color_id_fkey";

-- DropIndex
DROP INDEX "public"."cats_microchip_id_key";

-- AlterTable
ALTER TABLE "public"."cats" DROP COLUMN "color_id",
DROP COLUMN "image_url",
DROP COLUMN "is_active",
DROP COLUMN "legacy_breed",
DROP COLUMN "legacy_color",
DROP COLUMN "microchip_id",
DROP COLUMN "pattern",
DROP COLUMN "weight",
ADD COLUMN     "coat_color_id" TEXT,
ADD COLUMN     "is_in_house" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "microchip_number" TEXT,
ALTER COLUMN "registration_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."schedules" ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "recurrence_rule" TEXT,
ADD COLUMN     "timezone" TEXT;

-- AlterTable
ALTER TABLE "public"."tag_automation_rules" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."tag_automation_runs" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."tag_categories" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."tag_groups" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."schedule_reminders" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "timing_type" "public"."ReminderTimingType" NOT NULL,
    "remind_at" TIMESTAMP(3),
    "offset_value" INTEGER,
    "offset_unit" "public"."ReminderOffsetUnit",
    "relative_to" "public"."ReminderRelativeTo",
    "channel" "public"."ReminderChannel" NOT NULL,
    "repeat_frequency" "public"."ReminderRepeatFrequency",
    "repeat_interval" INTEGER,
    "repeat_count" INTEGER,
    "repeat_until" TIMESTAMP(3),
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schedule_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."care_tags" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "parent_id" TEXT,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."schedule_tags" (
    "schedule_id" TEXT NOT NULL,
    "care_tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_tags_pkey" PRIMARY KEY ("schedule_id","care_tag_id")
);

-- CreateTable
CREATE TABLE "public"."medical_records" (
    "id" TEXT NOT NULL,
    "cat_id" TEXT NOT NULL,
    "schedule_id" TEXT,
    "recorded_by" TEXT NOT NULL,
    "visit_date" TIMESTAMP(3) NOT NULL,
    "visit_type" "public"."MedicalVisitType",
    "clinic_name" TEXT,
    "veterinarian_name" TEXT,
    "symptom_summary" TEXT,
    "symptom_details" JSONB,
    "diagnosis" TEXT,
    "treatment_plan" TEXT,
    "medications" JSONB,
    "follow_up_action" TEXT,
    "follow_up_date" TIMESTAMP(3),
    "status" "public"."MedicalRecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medical_record_attachments" (
    "id" TEXT NOT NULL,
    "medical_record_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "file_name" TEXT,
    "file_type" TEXT,
    "file_size" INTEGER,
    "captured_at" TIMESTAMP(3),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_record_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medical_record_tags" (
    "medical_record_id" TEXT NOT NULL,
    "care_tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_record_tags_pkey" PRIMARY KEY ("medical_record_id","care_tag_id")
);

-- CreateIndex
CREATE INDEX "schedule_reminders_schedule_id_idx" ON "public"."schedule_reminders"("schedule_id");

-- CreateIndex
CREATE UNIQUE INDEX "care_tags_slug_key" ON "public"."care_tags"("slug");

-- CreateIndex
CREATE INDEX "care_tags_parent_id_idx" ON "public"."care_tags"("parent_id");

-- CreateIndex
CREATE INDEX "care_tags_level_idx" ON "public"."care_tags"("level");

-- CreateIndex
CREATE INDEX "medical_records_cat_id_idx" ON "public"."medical_records"("cat_id");

-- CreateIndex
CREATE INDEX "medical_records_visit_date_idx" ON "public"."medical_records"("visit_date");

-- CreateIndex
CREATE INDEX "medical_records_schedule_id_idx" ON "public"."medical_records"("schedule_id");

-- CreateIndex
CREATE INDEX "medical_record_attachments_medical_record_id_idx" ON "public"."medical_record_attachments"("medical_record_id");

-- CreateIndex
CREATE UNIQUE INDEX "cats_microchip_number_key" ON "public"."cats"("microchip_number");

-- CreateIndex
CREATE INDEX "cats_coat_color_id_idx" ON "public"."cats"("coat_color_id");

-- CreateIndex
CREATE INDEX "schedules_end_date_idx" ON "public"."schedules"("end_date");

-- CreateIndex
CREATE UNIQUE INDEX "tag_groups_category_id_name_key" ON "public"."tag_groups"("category_id", "name");

-- AddForeignKey
ALTER TABLE "public"."cats" ADD CONSTRAINT "cats_coat_color_id_fkey" FOREIGN KEY ("coat_color_id") REFERENCES "public"."coat_colors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedule_reminders" ADD CONSTRAINT "schedule_reminders_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."care_tags" ADD CONSTRAINT "care_tags_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."care_tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedule_tags" ADD CONSTRAINT "schedule_tags_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."schedule_tags" ADD CONSTRAINT "schedule_tags_care_tag_id_fkey" FOREIGN KEY ("care_tag_id") REFERENCES "public"."care_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_records" ADD CONSTRAINT "medical_records_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "public"."cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_records" ADD CONSTRAINT "medical_records_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_records" ADD CONSTRAINT "medical_records_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_record_attachments" ADD CONSTRAINT "medical_record_attachments_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "public"."medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_record_tags" ADD CONSTRAINT "medical_record_tags_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "public"."medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_record_tags" ADD CONSTRAINT "medical_record_tags_care_tag_id_fkey" FOREIGN KEY ("care_tag_id") REFERENCES "public"."care_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
