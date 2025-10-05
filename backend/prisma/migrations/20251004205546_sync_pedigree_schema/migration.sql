/*
  Warnings:

  - You are about to drop the column `ff_jcu` on the `pedigrees` table. All the data in the column will be lost.
  - You are about to drop the column `fff_jcu` on the `pedigrees` table. All the data in the column will be lost.
  - You are about to drop the column `ffm_jcu` on the `pedigrees` table. All the data in the column will be lost.
  - You are about to drop the column `fm_jcu` on the `pedigrees` table. All the data in the column will be lost.
  - You are about to drop the column `fmf_jcu` on the `pedigrees` table. All the data in the column will be lost.
  - You are about to drop the column `fmm_jcu` on the `pedigrees` table. All the data in the column will be lost.
  - You are about to drop the column `mf_jcu` on the `pedigrees` table. All the data in the column will be lost.
  - You are about to drop the column `mff_jcu` on the `pedigrees` table. All the data in the column will be lost.
  - You are about to drop the column `mfm_jcu` on the `pedigrees` table. All the data in the column will be lost.
  - You are about to drop the column `mm_jcu` on the `pedigrees` table. All the data in the column will be lost.
  - You are about to drop the column `mmf_jcu` on the `pedigrees` table. All the data in the column will be lost.
  - You are about to drop the column `mmm_jcu` on the `pedigrees` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "pedigrees" DROP COLUMN "ff_jcu",
DROP COLUMN "fff_jcu",
DROP COLUMN "ffm_jcu",
DROP COLUMN "fm_jcu",
DROP COLUMN "fmf_jcu",
DROP COLUMN "fmm_jcu",
DROP COLUMN "mf_jcu",
DROP COLUMN "mff_jcu",
DROP COLUMN "mfm_jcu",
DROP COLUMN "mm_jcu",
DROP COLUMN "mmf_jcu",
DROP COLUMN "mmm_jcu",
ADD COLUMN     "fffjcu" TEXT,
ADD COLUMN     "ffjcu" TEXT,
ADD COLUMN     "ffmjcu" TEXT,
ADD COLUMN     "fmfjcu" TEXT,
ADD COLUMN     "fmjcu" TEXT,
ADD COLUMN     "fmmjcu" TEXT,
ADD COLUMN     "mffjcu" TEXT,
ADD COLUMN     "mfjcu" TEXT,
ADD COLUMN     "mfmjcu" TEXT,
ADD COLUMN     "mmfjcu" TEXT,
ADD COLUMN     "mmjcu" TEXT,
ADD COLUMN     "mmmjcu" TEXT;
