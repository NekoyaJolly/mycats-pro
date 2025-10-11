-- AlterTable
ALTER TABLE "schedules"
ADD COLUMN "care_type" "CareType";

-- CreateIndex
CREATE INDEX "schedules_care_type_idx" ON "public"."schedules"("care_type");
