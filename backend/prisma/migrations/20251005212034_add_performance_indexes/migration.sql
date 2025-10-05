-- CreateIndex
CREATE INDEX "breeding_records_male_id_idx" ON "public"."breeding_records"("male_id");

-- CreateIndex
CREATE INDEX "breeding_records_female_id_idx" ON "public"."breeding_records"("female_id");

-- CreateIndex
CREATE INDEX "breeding_records_breeding_date_idx" ON "public"."breeding_records"("breeding_date");

-- CreateIndex
CREATE INDEX "breeding_records_status_idx" ON "public"."breeding_records"("status");

-- CreateIndex
CREATE INDEX "care_records_cat_id_idx" ON "public"."care_records"("cat_id");

-- CreateIndex
CREATE INDEX "care_records_care_date_idx" ON "public"."care_records"("care_date");

-- CreateIndex
CREATE INDEX "care_records_care_type_idx" ON "public"."care_records"("care_type");

-- CreateIndex
CREATE INDEX "cats_breed_id_idx" ON "public"."cats"("breed_id");

-- CreateIndex
CREATE INDEX "cats_father_id_idx" ON "public"."cats"("father_id");

-- CreateIndex
CREATE INDEX "cats_mother_id_idx" ON "public"."cats"("mother_id");

-- CreateIndex
CREATE INDEX "cats_birth_date_idx" ON "public"."cats"("birth_date");

-- CreateIndex
CREATE INDEX "pedigrees_breed_code_idx" ON "public"."pedigrees"("breed_code");

-- CreateIndex
CREATE INDEX "pedigrees_gender_code_idx" ON "public"."pedigrees"("gender_code");

-- CreateIndex
CREATE INDEX "pedigrees_coat_color_code_idx" ON "public"."pedigrees"("coat_color_code");

-- CreateIndex
CREATE INDEX "pedigrees_cat_name_idx" ON "public"."pedigrees"("cat_name");

-- CreateIndex
CREATE INDEX "schedules_schedule_date_idx" ON "public"."schedules"("schedule_date");

-- CreateIndex
CREATE INDEX "schedules_status_idx" ON "public"."schedules"("status");

-- CreateIndex
CREATE INDEX "schedules_cat_id_idx" ON "public"."schedules"("cat_id");

-- CreateIndex
CREATE INDEX "schedules_assigned_to_idx" ON "public"."schedules"("assigned_to");
