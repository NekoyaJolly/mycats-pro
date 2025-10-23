/*
  Warnings:

  - You are about to drop the column `actual_date` on the `birth_plans` table. All the data in the column will be lost.
  - You are about to drop the column `expected_date` on the `birth_plans` table. All the data in the column will be lost.
  - You are about to drop the column `female_id` on the `birth_plans` table. All the data in the column will be lost.
  - You are about to drop the column `female_name` on the `birth_plans` table. All the data in the column will be lost.
  - You are about to drop the column `male_id` on the `birth_plans` table. All the data in the column will be lost.
  - You are about to drop the column `male_name` on the `birth_plans` table. All the data in the column will be lost.
  - You are about to drop the column `mating_date` on the `birth_plans` table. All the data in the column will be lost.
  - You are about to drop the column `number_of_kittens` on the `birth_plans` table. All the data in the column will be lost.
  - You are about to drop the column `female_id` on the `pregnancy_checks` table. All the data in the column will be lost.
  - You are about to drop the column `female_name` on the `pregnancy_checks` table. All the data in the column will be lost.
  - You are about to drop the column `male_id` on the `pregnancy_checks` table. All the data in the column will be lost.
  - You are about to drop the column `male_name` on the `pregnancy_checks` table. All the data in the column will be lost.
  - You are about to drop the column `mating_date` on the `pregnancy_checks` table. All the data in the column will be lost.
  - Added the required column `expected_birth_date` to the `birth_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mother_id` to the `birth_plans` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mother_id` to the `pregnancy_checks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."birth_plans" DROP CONSTRAINT "birth_plans_female_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."birth_plans" DROP CONSTRAINT "birth_plans_male_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."pregnancy_checks" DROP CONSTRAINT "pregnancy_checks_female_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."pregnancy_checks" DROP CONSTRAINT "pregnancy_checks_male_id_fkey";

-- DropIndex
DROP INDEX "public"."birth_plans_expected_date_idx";

-- DropIndex
DROP INDEX "public"."birth_plans_female_id_idx";

-- DropIndex
DROP INDEX "public"."birth_plans_male_id_idx";

-- DropIndex
DROP INDEX "public"."pregnancy_checks_female_id_idx";

-- DropIndex
DROP INDEX "public"."pregnancy_checks_male_id_idx";

-- AlterTable
ALTER TABLE "public"."birth_plans" DROP COLUMN "actual_date",
DROP COLUMN "expected_date",
DROP COLUMN "female_id",
DROP COLUMN "female_name",
DROP COLUMN "male_id",
DROP COLUMN "male_name",
DROP COLUMN "mating_date",
DROP COLUMN "number_of_kittens",
ADD COLUMN     "actual_birth_date" TIMESTAMP(3),
ADD COLUMN     "actual_kittens" INTEGER,
ADD COLUMN     "expected_birth_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "expected_kittens" INTEGER,
ADD COLUMN     "mother_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."pregnancy_checks" DROP COLUMN "female_id",
DROP COLUMN "female_name",
DROP COLUMN "male_id",
DROP COLUMN "male_name",
DROP COLUMN "mating_date",
ADD COLUMN     "mother_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "birth_plans_mother_id_idx" ON "public"."birth_plans"("mother_id");

-- CreateIndex
CREATE INDEX "birth_plans_expected_birth_date_idx" ON "public"."birth_plans"("expected_birth_date");

-- CreateIndex
CREATE INDEX "pregnancy_checks_mother_id_idx" ON "public"."pregnancy_checks"("mother_id");

-- AddForeignKey
ALTER TABLE "public"."pregnancy_checks" ADD CONSTRAINT "pregnancy_checks_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "public"."cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."birth_plans" ADD CONSTRAINT "birth_plans_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "public"."cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
