/*
  Warnings:

  - You are about to rename the column `registration_id` to `registration_number` on the `cats` table.

*/
-- DropIndex
DROP INDEX "public"."cats_registration_id_key";

-- AlterTable
ALTER TABLE "public"."cats" RENAME COLUMN "registration_id" TO "registration_number";

-- CreateIndex
CREATE UNIQUE INDEX "cats_registration_number_key" ON "public"."cats"("registration_number");
