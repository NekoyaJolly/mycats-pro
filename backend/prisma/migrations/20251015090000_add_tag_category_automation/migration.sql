-- CreateEnum
CREATE TYPE "TagAssignmentAction" AS ENUM ('ASSIGNED', 'UNASSIGNED');

-- CreateEnum
CREATE TYPE "TagAssignmentSource" AS ENUM ('MANUAL', 'AUTOMATION', 'SYSTEM');

-- CreateEnum
CREATE TYPE "TagAutomationTriggerType" AS ENUM ('EVENT', 'SCHEDULE', 'MANUAL');

-- CreateEnum
CREATE TYPE "TagAutomationEventType" AS ENUM (
    'BREEDING_PLANNED',
    'BREEDING_CONFIRMED',
    'PREGNANCY_CONFIRMED',
    'KITTEN_REGISTERED',
    'AGE_THRESHOLD',
    'CUSTOM'
);

-- CreateEnum
CREATE TYPE "TagAutomationRunStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "tag_categories" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT DEFAULT '#3B82F6',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "scopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_automation_rules" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger_type" "TagAutomationTriggerType" NOT NULL,
    "event_type" "TagAutomationEventType" NOT NULL,
    "scope" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "config" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_automation_runs" (
    "id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "event_payload" JSONB,
    "status" "TagAutomationRunStatus" NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_automation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_assignment_history" (
    "id" TEXT NOT NULL,
    "cat_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "rule_id" TEXT,
    "automation_run_id" TEXT,
    "action" "TagAssignmentAction" NOT NULL DEFAULT 'ASSIGNED',
    "source" "TagAssignmentSource" NOT NULL DEFAULT 'MANUAL',
    "reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_assignment_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tag_categories_key_key" ON "tag_categories"("key");

-- CreateIndex
CREATE UNIQUE INDEX "tag_automation_rules_key_key" ON "tag_automation_rules"("key");

-- AlterTable
ALTER TABLE "tags"
    ADD COLUMN "category_id" TEXT,
    ADD COLUMN "display_order" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "allows_manual" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN "allows_automation" BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN "metadata" JSONB,
    ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

-- Insert default category for legacy tags
INSERT INTO "tag_categories" (
    "id", "key", "name", "description", "color", "display_order", "scopes", "is_active"
) VALUES (
    'tag-cat-legacy-default',
    'legacy_default',
    '既存タグ',
    'カテゴリ導入前に存在していたタグの自動分類用カテゴリ',
    '#3B82F6',
    0,
    ARRAY['cats'],
    true
)
ON CONFLICT ("key") DO NOTHING;

-- Assign all existing tags to the default category
UPDATE "tags"
SET "category_id" = 'tag-cat-legacy-default'
WHERE "category_id" IS NULL;

-- Populate display order for legacy tags based on name ordering
WITH ordered_tags AS (
    SELECT "id", ROW_NUMBER() OVER (ORDER BY "name") - 1 AS rn
    FROM "tags"
)
UPDATE "tags" AS t
SET "display_order" = o.rn
FROM ordered_tags AS o
WHERE t."id" = o."id";

-- After data backfill enforce NOT NULL and constraints
ALTER TABLE "tags"
    ALTER COLUMN "category_id" SET NOT NULL;

-- Drop legacy unique constraint and add scoped unique constraint
DROP INDEX IF EXISTS "tags_name_key";
CREATE UNIQUE INDEX "tags_category_id_name_key" ON "tags"("category_id", "name");

-- AddForeignKey
ALTER TABLE "tags"
    ADD CONSTRAINT "tags_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "tag_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_automation_runs"
    ADD CONSTRAINT "tag_automation_runs_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "tag_automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_assignment_history"
    ADD CONSTRAINT "tag_assignment_history_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "cats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_assignment_history"
    ADD CONSTRAINT "tag_assignment_history_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_assignment_history"
    ADD CONSTRAINT "tag_assignment_history_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "tag_automation_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_assignment_history"
    ADD CONSTRAINT "tag_assignment_history_automation_run_id_fkey" FOREIGN KEY ("automation_run_id") REFERENCES "tag_automation_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddIndex
CREATE INDEX "tag_automation_runs_rule_id_idx" ON "tag_automation_runs"("rule_id");
CREATE INDEX "tag_assignment_history_cat_id_idx" ON "tag_assignment_history"("cat_id");
CREATE INDEX "tag_assignment_history_tag_id_idx" ON "tag_assignment_history"("tag_id");
CREATE INDEX "tag_assignment_history_rule_id_idx" ON "tag_assignment_history"("rule_id");
CREATE INDEX "tag_assignment_history_automation_run_id_idx" ON "tag_assignment_history"("automation_run_id");

