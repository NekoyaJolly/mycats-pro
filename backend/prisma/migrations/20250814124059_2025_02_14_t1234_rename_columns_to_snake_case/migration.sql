-- RenameForeignKey
ALTER TABLE "public"."breeding_records" RENAME CONSTRAINT "breeding_records_femaleId_fkey" TO "breeding_records_female_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."breeding_records" RENAME CONSTRAINT "breeding_records_maleId_fkey" TO "breeding_records_male_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."breeding_records" RENAME CONSTRAINT "breeding_records_recordedBy_fkey" TO "breeding_records_recorded_by_fkey";

-- RenameForeignKey
ALTER TABLE "public"."care_records" RENAME CONSTRAINT "care_records_catId_fkey" TO "care_records_cat_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."care_records" RENAME CONSTRAINT "care_records_recordedBy_fkey" TO "care_records_recorded_by_fkey";

-- RenameForeignKey
ALTER TABLE "public"."cat_tags" RENAME CONSTRAINT "cat_tags_catId_fkey" TO "cat_tags_cat_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."cat_tags" RENAME CONSTRAINT "cat_tags_tagId_fkey" TO "cat_tags_tag_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."cats" RENAME CONSTRAINT "cats_breedId_fkey" TO "cats_breed_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."cats" RENAME CONSTRAINT "cats_colorId_fkey" TO "cats_color_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."cats" RENAME CONSTRAINT "cats_fatherId_fkey" TO "cats_father_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."cats" RENAME CONSTRAINT "cats_motherId_fkey" TO "cats_mother_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."cats" RENAME CONSTRAINT "cats_ownerId_fkey" TO "cats_owner_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."login_attempts" RENAME CONSTRAINT "login_attempts_userId_fkey" TO "login_attempts_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."pedigrees" RENAME CONSTRAINT "pedigrees_breedId_fkey" TO "pedigrees_breed_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."pedigrees" RENAME CONSTRAINT "pedigrees_catId_fkey" TO "pedigrees_cat_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."pedigrees" RENAME CONSTRAINT "pedigrees_colorId_fkey" TO "pedigrees_color_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."pedigrees" RENAME CONSTRAINT "pedigrees_fatherPedigreeId_fkey" TO "pedigrees_father_pedigree_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."pedigrees" RENAME CONSTRAINT "pedigrees_maternalGrandfatherId_fkey" TO "pedigrees_maternal_grandfather_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."pedigrees" RENAME CONSTRAINT "pedigrees_maternalGrandmotherId_fkey" TO "pedigrees_maternal_grandmother_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."pedigrees" RENAME CONSTRAINT "pedigrees_motherPedigreeId_fkey" TO "pedigrees_mother_pedigree_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."pedigrees" RENAME CONSTRAINT "pedigrees_paternalGrandfatherId_fkey" TO "pedigrees_paternal_grandfather_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."pedigrees" RENAME CONSTRAINT "pedigrees_paternalGrandmotherId_fkey" TO "pedigrees_paternal_grandmother_id_fkey";

-- RenameForeignKey
ALTER TABLE "public"."schedules" RENAME CONSTRAINT "schedules_assignedTo_fkey" TO "schedules_assigned_to_fkey";

-- RenameForeignKey
ALTER TABLE "public"."schedules" RENAME CONSTRAINT "schedules_catId_fkey" TO "schedules_cat_id_fkey";
