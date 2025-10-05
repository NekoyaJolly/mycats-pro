/*
  Warnings:

  - Changed the type of `gender` on the `cats` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."cats" DROP COLUMN "gender",
ADD COLUMN     "gender" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "reset_password_expires" TIMESTAMP(3),
ADD COLUMN     "reset_password_token" TEXT;

-- DropEnum
DROP TYPE "public"."Gender";

-- CreateTable
CREATE TABLE "public"."genders" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "genders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "genders_code_key" ON "public"."genders"("code");

-- CreateIndex
CREATE UNIQUE INDEX "genders_name_key" ON "public"."genders"("name");

-- AddForeignKey
ALTER TABLE "public"."pedigrees" ADD CONSTRAINT "pedigrees_breed_code_fkey" FOREIGN KEY ("breed_code") REFERENCES "public"."breeds"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedigrees" ADD CONSTRAINT "pedigrees_coat_color_code_fkey" FOREIGN KEY ("coat_color_code") REFERENCES "public"."coat_colors"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pedigrees" ADD CONSTRAINT "pedigrees_gender_code_fkey" FOREIGN KEY ("gender_code") REFERENCES "public"."genders"("code") ON DELETE SET NULL ON UPDATE CASCADE;
