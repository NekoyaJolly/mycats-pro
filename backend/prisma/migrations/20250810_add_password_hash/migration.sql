-- Add passwordHash column to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
