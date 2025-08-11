-- Align DB schema with prisma schema
-- 1) Add missing columns to pedigrees
ALTER TABLE "pedigrees"
  ADD COLUMN IF NOT EXISTS "catName2" TEXT,
  ADD COLUMN IF NOT EXISTS "pedigreeIssueDate" TIMESTAMP(3);

-- 2) Ensure login_attempts columns (camelCase) exist; create if table was created differently in older envs
DO $$
BEGIN
  -- Add camelCase columns if the table exists and columns are missing
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'login_attempts'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'login_attempts' AND column_name = 'userId'
    ) THEN
      ALTER TABLE "login_attempts" ADD COLUMN "userId" TEXT;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'login_attempts' AND column_name = 'ipAddress'
    ) THEN
      ALTER TABLE "login_attempts" ADD COLUMN "ipAddress" TEXT;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'login_attempts' AND column_name = 'userAgent'
    ) THEN
      ALTER TABLE "login_attempts" ADD COLUMN "userAgent" TEXT;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'login_attempts' AND column_name = 'createdAt'
    ) THEN
      ALTER TABLE "login_attempts" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
  END IF;
END $$;

-- 3) Optional: link userId FK if not present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'login_attempts' AND column_name = 'userId'
  ) THEN
    -- Add FK only if not exists
    IF NOT EXISTS (
      SELECT 1 
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_schema = 'public' AND tc.table_name = 'login_attempts' AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN
      ALTER TABLE "login_attempts"
        ADD CONSTRAINT "login_attempts_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
  END IF;
END $$;
