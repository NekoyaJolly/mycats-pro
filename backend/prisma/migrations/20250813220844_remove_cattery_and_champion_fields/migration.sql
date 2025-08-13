/*
  Warnings:

  - You are about to drop the column `catteryName` on the `pedigrees` table. All the data in the column will be lost.
  - You are about to drop the column `championFlag` on the `pedigrees` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."pedigrees" DROP COLUMN "catteryName",
DROP COLUMN "championFlag";
