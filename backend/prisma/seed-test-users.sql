-- テスト用ユーザーの作成
-- パスワードはすべて "password123" でArgon2idハッシュ化済み

-- 管理者ユーザー
INSERT INTO "users" (
  "id", 
  "email", 
  "username",
  "password_hash",
  "role", 
  "first_name", 
  "last_name", 
  "created_at", 
  "updated_at"
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@example.com',
  'admin',
  '$argon2id$v=19$m=65536,t=3,p=4$randomsalt12345678901234567890$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLM',
  'ADMIN',
  'Admin',
  'User',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE 
SET 
  password_hash = EXCLUDED.password_hash,
  updated_at = CURRENT_TIMESTAMP;

-- 一般ユーザー
INSERT INTO "users" (
  "id", 
  "email", 
  "username",
  "password_hash",
  "role", 
  "first_name", 
  "last_name", 
  "created_at", 
  "updated_at"
)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'user@example.com',
  'user',
  '$argon2id$v=19$m=65536,t=3,p=4$randomsalt12345678901234567890$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLM',
  'USER',
  'Regular',
  'User',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO UPDATE 
SET 
  password_hash = EXCLUDED.password_hash,
  updated_at = CURRENT_TIMESTAMP;

-- テスト用ユーザー作成完了
-- 
-- ログイン情報:
-- 
-- 管理者アカウント:
--   Email: admin@example.com
--   Password: password123
-- 
-- 一般ユーザーアカウント:
--   Email: user@example.com
--   Password: password123
