-- CreateEnum
CREATE TYPE "public"."PregnancyStatus" AS ENUM ('PENDING', 'CONFIRMED', 'NEGATIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."BirthStatus" AS ENUM ('EXPECTED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."pregnancy_checks" (
    "id" TEXT NOT NULL,
    "male_id" TEXT NOT NULL,
    "female_id" TEXT NOT NULL,
    "male_name" TEXT NOT NULL,
    "female_name" TEXT NOT NULL,
    "mating_date" TIMESTAMP(3) NOT NULL,
    "check_date" TIMESTAMP(3) NOT NULL,
    "status" "public"."PregnancyStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "recorded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pregnancy_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."birth_plans" (
    "id" TEXT NOT NULL,
    "male_id" TEXT NOT NULL,
    "female_id" TEXT NOT NULL,
    "male_name" TEXT NOT NULL,
    "female_name" TEXT NOT NULL,
    "mating_date" TIMESTAMP(3) NOT NULL,
    "expected_date" TIMESTAMP(3) NOT NULL,
    "actual_date" TIMESTAMP(3),
    "status" "public"."BirthStatus" NOT NULL DEFAULT 'EXPECTED',
    "number_of_kittens" INTEGER,
    "notes" TEXT,
    "recorded_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "birth_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pregnancy_checks_male_id_idx" ON "public"."pregnancy_checks"("male_id");

-- CreateIndex
CREATE INDEX "pregnancy_checks_female_id_idx" ON "public"."pregnancy_checks"("female_id");

-- CreateIndex
CREATE INDEX "pregnancy_checks_check_date_idx" ON "public"."pregnancy_checks"("check_date");

-- CreateIndex
CREATE INDEX "birth_plans_male_id_idx" ON "public"."birth_plans"("male_id");

-- CreateIndex
CREATE INDEX "birth_plans_female_id_idx" ON "public"."birth_plans"("female_id");

-- CreateIndex
CREATE INDEX "birth_plans_expected_date_idx" ON "public"."birth_plans"("expected_date");

-- AddForeignKey
ALTER TABLE "public"."pregnancy_checks" ADD CONSTRAINT "pregnancy_checks_male_id_fkey" FOREIGN KEY ("male_id") REFERENCES "public"."cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pregnancy_checks" ADD CONSTRAINT "pregnancy_checks_female_id_fkey" FOREIGN KEY ("female_id") REFERENCES "public"."cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pregnancy_checks" ADD CONSTRAINT "pregnancy_checks_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."birth_plans" ADD CONSTRAINT "birth_plans_male_id_fkey" FOREIGN KEY ("male_id") REFERENCES "public"."cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."birth_plans" ADD CONSTRAINT "birth_plans_female_id_fkey" FOREIGN KEY ("female_id") REFERENCES "public"."cats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."birth_plans" ADD CONSTRAINT "birth_plans_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
