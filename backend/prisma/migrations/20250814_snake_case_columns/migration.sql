-- Align column names to snake_case across all tables
-- Safe to run after prior migrations; uses ALTER TABLE ... RENAME COLUMN

-- users
ALTER TABLE "public"."users"
  RENAME COLUMN "clerkId" TO "clerk_id";
ALTER TABLE "public"."users"
  RENAME COLUMN "firstName" TO "first_name";
ALTER TABLE "public"."users"
  RENAME COLUMN "lastName" TO "last_name";
ALTER TABLE "public"."users"
  RENAME COLUMN "isActive" TO "is_active";
ALTER TABLE "public"."users"
  RENAME COLUMN "passwordHash" TO "password_hash";
-- refreshToken was added by 20250813224356_add_refresh_token_field
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'refreshToken'
  ) THEN
    ALTER TABLE "public"."users" RENAME COLUMN "refreshToken" TO "refresh_token";
  END IF;
END $$;
ALTER TABLE "public"."users"
  RENAME COLUMN "failedLoginAttempts" TO "failed_login_attempts";
ALTER TABLE "public"."users"
  RENAME COLUMN "lockedUntil" TO "locked_until";
ALTER TABLE "public"."users"
  RENAME COLUMN "lastLoginAt" TO "last_login_at";
ALTER TABLE "public"."users"
  RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "public"."users"
  RENAME COLUMN "updatedAt" TO "updated_at";

-- login_attempts
ALTER TABLE "public"."login_attempts"
  RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "public"."login_attempts"
  RENAME COLUMN "ipAddress" TO "ip_address";
ALTER TABLE "public"."login_attempts"
  RENAME COLUMN "userAgent" TO "user_agent";
ALTER TABLE "public"."login_attempts"
  RENAME COLUMN "createdAt" TO "created_at";

-- breeds
ALTER TABLE "public"."breeds"
  RENAME COLUMN "isActive" TO "is_active";
ALTER TABLE "public"."breeds"
  RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "public"."breeds"
  RENAME COLUMN "updatedAt" TO "updated_at";

-- coat_colors
ALTER TABLE "public"."coat_colors"
  RENAME COLUMN "isActive" TO "is_active";
ALTER TABLE "public"."coat_colors"
  RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "public"."coat_colors"
  RENAME COLUMN "updatedAt" TO "updated_at";

-- cats
ALTER TABLE "public"."cats"
  RENAME COLUMN "registrationId" TO "registration_id";
ALTER TABLE "public"."cats"
  RENAME COLUMN "breedId" TO "breed_id";
ALTER TABLE "public"."cats"
  RENAME COLUMN "colorId" TO "color_id";
ALTER TABLE "public"."cats"
  RENAME COLUMN "legacyBreed" TO "legacy_breed";
ALTER TABLE "public"."cats"
  RENAME COLUMN "legacyColor" TO "legacy_color";
ALTER TABLE "public"."cats"
  RENAME COLUMN "birthDate" TO "birth_date";
ALTER TABLE "public"."cats"
  RENAME COLUMN "microchipId" TO "microchip_id";
ALTER TABLE "public"."cats"
  RENAME COLUMN "isActive" TO "is_active";
ALTER TABLE "public"."cats"
  RENAME COLUMN "imageUrl" TO "image_url";
ALTER TABLE "public"."cats"
  RENAME COLUMN "fatherId" TO "father_id";
ALTER TABLE "public"."cats"
  RENAME COLUMN "motherId" TO "mother_id";
ALTER TABLE "public"."cats"
  RENAME COLUMN "ownerId" TO "owner_id";
ALTER TABLE "public"."cats"
  RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "public"."cats"
  RENAME COLUMN "updatedAt" TO "updated_at";

-- breeding_records
ALTER TABLE "public"."breeding_records"
  RENAME COLUMN "maleId" TO "male_id";
ALTER TABLE "public"."breeding_records"
  RENAME COLUMN "femaleId" TO "female_id";
ALTER TABLE "public"."breeding_records"
  RENAME COLUMN "breedingDate" TO "breeding_date";
ALTER TABLE "public"."breeding_records"
  RENAME COLUMN "expectedDueDate" TO "expected_due_date";
ALTER TABLE "public"."breeding_records"
  RENAME COLUMN "actualDueDate" TO "actual_due_date";
ALTER TABLE "public"."breeding_records"
  RENAME COLUMN "numberOfKittens" TO "number_of_kittens";
ALTER TABLE "public"."breeding_records"
  RENAME COLUMN "recordedBy" TO "recorded_by";
ALTER TABLE "public"."breeding_records"
  RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "public"."breeding_records"
  RENAME COLUMN "updatedAt" TO "updated_at";

-- care_records
ALTER TABLE "public"."care_records"
  RENAME COLUMN "catId" TO "cat_id";
ALTER TABLE "public"."care_records"
  RENAME COLUMN "careType" TO "care_type";
ALTER TABLE "public"."care_records"
  RENAME COLUMN "careDate" TO "care_date";
ALTER TABLE "public"."care_records"
  RENAME COLUMN "nextDueDate" TO "next_due_date";
ALTER TABLE "public"."care_records"
  RENAME COLUMN "recordedBy" TO "recorded_by";
ALTER TABLE "public"."care_records"
  RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "public"."care_records"
  RENAME COLUMN "updatedAt" TO "updated_at";

-- schedules
ALTER TABLE "public"."schedules"
  RENAME COLUMN "scheduleDate" TO "schedule_date";
ALTER TABLE "public"."schedules"
  RENAME COLUMN "scheduleType" TO "schedule_type";
ALTER TABLE "public"."schedules"
  RENAME COLUMN "catId" TO "cat_id";
ALTER TABLE "public"."schedules"
  RENAME COLUMN "assignedTo" TO "assigned_to";
ALTER TABLE "public"."schedules"
  RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "public"."schedules"
  RENAME COLUMN "updatedAt" TO "updated_at";

-- tags
ALTER TABLE "public"."tags"
  RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "public"."tags"
  RENAME COLUMN "updatedAt" TO "updated_at";

-- pedigrees
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "pedigreeId" TO "pedigree_id";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "catId" TO "cat_id";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "catName" TO "cat_name";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "catName2" TO "cat_name2";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "breedId" TO "breed_id";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "breedCode" TO "breed_code";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "eyeColor" TO "eye_color";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "colorId" TO "color_id";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "coatColorCode" TO "coat_color_code";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "birthDate" TO "birth_date";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "registrationDate" TO "registration_date";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "pedigreeIssueDate" TO "pedigree_issue_date";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "breederName" TO "breeder_name";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "ownerName" TO "owner_name";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "brotherCount" TO "brother_count";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "sisterCount" TO "sister_count";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "otherNo" TO "other_no";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "oldCode" TO "old_code";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "fatherPedigreeId" TO "father_pedigree_id";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "motherPedigreeId" TO "mother_pedigree_id";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "paternalGrandfatherId" TO "paternal_grandfather_id";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "paternalGrandmotherId" TO "paternal_grandmother_id";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "maternalGrandfatherId" TO "maternal_grandfather_id";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "maternalGrandmotherId" TO "maternal_grandmother_id";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "public"."pedigrees"
  RENAME COLUMN "updatedAt" TO "updated_at";

-- cat_tags
ALTER TABLE "public"."cat_tags"
  RENAME COLUMN "catId" TO "cat_id";
ALTER TABLE "public"."cat_tags"
  RENAME COLUMN "tagId" TO "tag_id";
ALTER TABLE "public"."cat_tags"
  RENAME COLUMN "createdAt" TO "created_at";

-- Optional: rename key indexes to snake_case for consistency
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='users_clerkId_key') THEN
    ALTER INDEX "public"."users_clerkId_key" RENAME TO "users_clerk_id_key";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='cats_registrationId_key') THEN
    ALTER INDEX "public"."cats_registrationId_key" RENAME TO "cats_registration_id_key";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='cats_microchipId_key') THEN
    ALTER INDEX "public"."cats_microchipId_key" RENAME TO "cats_microchip_id_key";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='pedigrees_pedigreeId_key') THEN
    ALTER INDEX "public"."pedigrees_pedigreeId_key" RENAME TO "pedigrees_pedigree_id_key";
  END IF;
END $$;
