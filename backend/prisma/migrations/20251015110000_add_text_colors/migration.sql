-- Add text and border color support to tags domain
ALTER TABLE "tag_categories" ADD COLUMN IF NOT EXISTS "text_color" TEXT DEFAULT '#111827';

ALTER TABLE "tag_groups" ADD COLUMN IF NOT EXISTS "color" TEXT DEFAULT '#3B82F6';
ALTER TABLE "tag_groups" ADD COLUMN IF NOT EXISTS "text_color" TEXT DEFAULT '#111827';

ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "text_color" TEXT NOT NULL DEFAULT '#FFFFFF';

-- Backfill existing rows to ensure no NULL values
UPDATE "tag_categories" SET "text_color" = COALESCE("text_color", '#111827');
UPDATE "tag_groups" SET "color" = COALESCE("color", '#3B82F6');
UPDATE "tag_groups" SET "text_color" = COALESCE("text_color", '#111827');
UPDATE "tags" SET "text_color" = '#FFFFFF' WHERE "text_color" IS NULL;
