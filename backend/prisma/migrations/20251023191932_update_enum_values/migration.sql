/*
  Warnings:

  - The values [COMPLETED,CANCELLED] on the enum `BirthStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING,CANCELLED] on the enum `PregnancyStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."BirthStatus_new" AS ENUM ('EXPECTED', 'BORN', 'ABORTED', 'STILLBORN');
ALTER TABLE "public"."birth_plans" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."birth_plans" ALTER COLUMN "status" TYPE "public"."BirthStatus_new" USING ("status"::text::"public"."BirthStatus_new");
ALTER TYPE "public"."BirthStatus" RENAME TO "BirthStatus_old";
ALTER TYPE "public"."BirthStatus_new" RENAME TO "BirthStatus";
DROP TYPE "public"."BirthStatus_old";
ALTER TABLE "public"."birth_plans" ALTER COLUMN "status" SET DEFAULT 'EXPECTED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "public"."PregnancyStatus_new" AS ENUM ('CONFIRMED', 'SUSPECTED', 'NEGATIVE', 'ABORTED');
ALTER TABLE "public"."pregnancy_checks" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."pregnancy_checks" ALTER COLUMN "status" TYPE "public"."PregnancyStatus_new" USING ("status"::text::"public"."PregnancyStatus_new");
ALTER TYPE "public"."PregnancyStatus" RENAME TO "PregnancyStatus_old";
ALTER TYPE "public"."PregnancyStatus_new" RENAME TO "PregnancyStatus";
DROP TYPE "public"."PregnancyStatus_old";
ALTER TABLE "public"."pregnancy_checks" ALTER COLUMN "status" SET DEFAULT 'SUSPECTED';
COMMIT;

-- AlterTable
ALTER TABLE "public"."pregnancy_checks" ALTER COLUMN "status" SET DEFAULT 'SUSPECTED';
