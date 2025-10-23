-- Enable uuid-ossp extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table for tag groups
CREATE TABLE "tag_groups" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tag_groups_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "tag_groups_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "tag_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create a default group for each existing category
INSERT INTO "tag_groups" (
    "id",
    "category_id",
    "name",
    "description",
    "display_order",
    "is_active"
)
SELECT
    uuid_generate_v4(),
    c.id,
    'default',
    c.description,
    c.display_order,
    c.is_active
FROM "tag_categories" c
WHERE NOT EXISTS (
    SELECT 1 FROM "tag_groups" g WHERE g.category_id = c.id
);

-- Add group_id column to tags
ALTER TABLE "tags" ADD COLUMN "group_id" TEXT;

-- Assign existing tags to the default group of their category
UPDATE "tags" t
SET "group_id" = g.id
FROM "tag_groups" g
WHERE g.category_id = t."category_id" AND g."name" = 'default';

-- Ensure all tags were assigned
ALTER TABLE "tags" ALTER COLUMN "group_id" SET NOT NULL;

-- Drop old constraints/indexes based on category
ALTER TABLE "tags" DROP CONSTRAINT "tags_category_id_fkey";
DROP INDEX IF EXISTS "tags_category_id_name_key";

-- Drop category_id column now that group_id is in place
ALTER TABLE "tags" DROP COLUMN "category_id";

-- Create new constraints/indexes based on group
ALTER TABLE "tags"
    ADD CONSTRAINT "tags_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "tag_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE UNIQUE INDEX "tags_group_id_name_key" ON "tags" ("group_id", "name");
CREATE INDEX "tags_group_id_idx" ON "tags" ("group_id");

-- Ensure updated_at auto update compatibility
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updated_at" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_tag_groups
BEFORE UPDATE ON "tag_groups"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
