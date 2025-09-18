# 🚀 本番環境デプロイ時のデータベース構築手順

## 📋 概要

本ドキュメントは、猫生体管理システム（My Cats）を本番環境にデプロイする際のデータベース設定・構築手順を詳述しています。Prismaを使用して自動的にPostgreSQLデータベースのスキーマが生成されます。

## 🔧 前提条件

### システム要件

- **PostgreSQL**: 15以上
- **Node.js**: 20.x以上
- **pnpm**: 最新版
- **メモリ**: 最小2GB、推奨4GB以上
- **ストレージ**: 最小10GB、推奨50GB以上

### ネットワーク要件

- PostgreSQLポート（5432）へのアクセス
- アプリケーションポート（3004）の開放

## 📝 デプロイ手順

### 1. 環境変数の設定

本番環境用の`.env.production`ファイルを作成：

```bash
# データベース接続（必須）
DATABASE_URL="postgresql://username:password@hostname:5432/mycats_production"

# アプリケーション設定
NODE_ENV=production
PORT=3004

# JWT設定（セキュリティ重要）
JWT_SECRET="your-production-jwt-secret-256-bit-minimum"
JWT_EXPIRES_IN="1h"

# CORS設定
CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com"

# セキュリティ設定
BCRYPT_ROUNDS=12

# Prisma設定
PRISMA_QUERY_ENGINE_LIBRARY="true"
```

### 2. 依存関係のインストール

```bash
# プロジェクトルートで実行
cd /path/to/mycats

# 依存関係インストール（lockfile使用）
pnpm install --frozen-lockfile

# または npm の場合
npm ci
```

### 3. Prismaクライアントの生成

```bash
# Prismaクライアント生成
pnpm -w run db:generate

# 実行されるコマンド:
# dotenv -e ./.env.production -- prisma generate --schema ./backend/prisma/schema.prisma
```

### 4. データベースマイグレーション実行

```bash
# 本番環境マイグレーション
pnpm -w run db:deploy

# 実行されるコマンド:
# dotenv -e ./.env.production -- prisma migrate deploy --schema ./backend/prisma/schema.prisma
```

### 5. 初期データ投入（オプション）

```bash
# マスタデータ投入
pnpm --filter backend run seed
```

### 6. アプリケーションビルド

```bash
# バックエンドビルド
pnpm --filter backend run build

# フロントエンドビルド
pnpm --filter frontend run build
```

### 7. 本番サーバー起動

```bash
# 本番モードで起動
NODE_ENV=production node backend/dist/main.js
```

## 🗄️ 生成されるデータベース構造

### 自動生成されるテーブル一覧

マイグレーション実行後、以下のテーブルがPostgreSQLに自動生成されます：

```sql
-- 1. ユーザー管理
CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "clerk_id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "first_name" TEXT,
  "last_name" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "password_hash" TEXT,
  "refresh_token" TEXT,
  "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
  "locked_until" TIMESTAMP(3),
  "last_login_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- 2. ログイン試行
CREATE TABLE "login_attempts" (
  "id" TEXT NOT NULL,
  "user_id" TEXT,
  "email" TEXT NOT NULL,
  "ip_address" TEXT,
  "user_agent" TEXT,
  "success" BOOLEAN NOT NULL,
  "reason" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id")
);

-- 3. 猫種マスタ
CREATE TABLE "breeds" (
  "id" TEXT NOT NULL,
  "code" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "breeds_pkey" PRIMARY KEY ("id")
);

-- 4. 毛色マスタ
CREATE TABLE "coat_colors" (
  "id" TEXT NOT NULL,
  "code" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "coat_colors_pkey" PRIMARY KEY ("id")
);

-- 5. 猫基本情報
CREATE TABLE "cats" (
  "id" TEXT NOT NULL,
  "registration_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "breed_id" TEXT,
  "color_id" TEXT,
  "legacy_breed" TEXT,
  "legacy_color" TEXT,
  "pattern" TEXT,
  "gender" "Gender" NOT NULL,
  "birth_date" TIMESTAMP(3) NOT NULL,
  "weight" DOUBLE PRECISION,
  "microchip_id" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "image_url" TEXT,
  "father_id" TEXT,
  "mother_id" TEXT,
  "owner_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "cats_pkey" PRIMARY KEY ("id")
);

-- 6. 交配記録
CREATE TABLE "breeding_records" (
  "id" TEXT NOT NULL,
  "male_id" TEXT NOT NULL,
  "female_id" TEXT NOT NULL,
  "breeding_date" TIMESTAMP(3) NOT NULL,
  "expected_due_date" TIMESTAMP(3),
  "actual_due_date" TIMESTAMP(3),
  "number_of_kittens" INTEGER,
  "notes" TEXT,
  "status" "BreedingStatus" NOT NULL DEFAULT 'PLANNED',
  "recorded_by" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "breeding_records_pkey" PRIMARY KEY ("id")
);

-- 7. ケア記録
CREATE TABLE "care_records" (
  "id" TEXT NOT NULL,
  "cat_id" TEXT NOT NULL,
  "care_type" "CareType" NOT NULL,
  "description" TEXT NOT NULL,
  "care_date" TIMESTAMP(3) NOT NULL,
  "next_due_date" TIMESTAMP(3),
  "cost" DOUBLE PRECISION,
  "veterinarian" TEXT,
  "notes" TEXT,
  "recorded_by" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "care_records_pkey" PRIMARY KEY ("id")
);

-- 8. スケジュール
CREATE TABLE "schedules" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "schedule_date" TIMESTAMP(3) NOT NULL,
  "schedule_type" "ScheduleType" NOT NULL,
  "status" "ScheduleStatus" NOT NULL DEFAULT 'PENDING',
  "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
  "cat_id" TEXT,
  "assigned_to" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- 9. タグマスタ
CREATE TABLE "tags" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT NOT NULL DEFAULT '#3B82F6',
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- 10. 血統情報
CREATE TABLE "pedigrees" (
  "id" TEXT NOT NULL,
  "pedigree_id" TEXT NOT NULL,
  "cat_id" TEXT,
  "title" TEXT,
  "cat_name" TEXT NOT NULL,
  "cat_name2" TEXT,
  "breed_id" TEXT,
  "breed_code" INTEGER,
  "gender" INTEGER,
  "eye_color" TEXT,
  "color_id" TEXT,
  "coat_color_code" INTEGER,
  "birth_date" TIMESTAMP(3),
  "registration_date" TIMESTAMP(3),
  "pedigree_issue_date" TIMESTAMP(3),
  "breeder_name" TEXT,
  "owner_name" TEXT,
  "brother_count" INTEGER,
  "sister_count" INTEGER,
  "notes" TEXT,
  "notes2" TEXT,
  "other_no" TEXT,
  "old_code" TEXT,
  "father_pedigree_id" TEXT,
  "mother_pedigree_id" TEXT,
  "paternal_grandfather_id" TEXT,
  "paternal_grandmother_id" TEXT,
  "maternal_grandfather_id" TEXT,
  "maternal_grandmother_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pedigrees_pkey" PRIMARY KEY ("id")
);

-- 11. 猫タグ関連（中間テーブル）
CREATE TABLE "cat_tags" (
  "cat_id" TEXT NOT NULL,
  "tag_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "cat_tags_pkey" PRIMARY KEY ("cat_id","tag_id")
);
```

### 自動生成される列挙型（Enum）

```sql
-- ユーザーロール
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- 性別
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- 交配ステータス
CREATE TYPE "BreedingStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- ケア種別
CREATE TYPE "CareType" AS ENUM ('VACCINATION', 'HEALTH_CHECK', 'GROOMING', 'DENTAL_CARE', 'MEDICATION', 'SURGERY', 'OTHER');

-- スケジュール種別
CREATE TYPE "ScheduleType" AS ENUM ('BREEDING', 'CARE', 'APPOINTMENT', 'REMINDER', 'MAINTENANCE');

-- スケジュールステータス
CREATE TYPE "ScheduleStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- 優先度
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
```

### 自動生成される制約・インデックス

```sql
-- 一意制約
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "breeds_code_key" ON "breeds"("code");
CREATE UNIQUE INDEX "breeds_name_key" ON "breeds"("name");
CREATE UNIQUE INDEX "coat_colors_code_key" ON "coat_colors"("code");
CREATE UNIQUE INDEX "coat_colors_name_key" ON "coat_colors"("name");
CREATE UNIQUE INDEX "cats_registration_id_key" ON "cats"("registration_id");
CREATE UNIQUE INDEX "cats_microchip_id_key" ON "cats"("microchip_id");
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");
CREATE UNIQUE INDEX "pedigrees_pedigree_id_key" ON "pedigrees"("pedigree_id");

-- 外部キー制約
ALTER TABLE "login_attempts" ADD CONSTRAINT "login_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cats" ADD CONSTRAINT "cats_breed_id_fkey" FOREIGN KEY ("breed_id") REFERENCES "breeds"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cats" ADD CONSTRAINT "cats_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "coat_colors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cats" ADD CONSTRAINT "cats_father_id_fkey" FOREIGN KEY ("father_id") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cats" ADD CONSTRAINT "cats_mother_id_fkey" FOREIGN KEY ("mother_id") REFERENCES "cats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cats" ADD CONSTRAINT "cats_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- ... その他の外部キー制約
```

## 🔧 初期データの投入

### 必要な初期データ

本番環境では以下の初期データが必要です：

```sql
-- 1. 管理者ユーザー
INSERT INTO "users" ("id", "clerk_id", "email", "role", "is_active")
VALUES ('admin-uuid', 'admin-clerk-id', 'admin@example.com', 'SUPER_ADMIN', true);

-- 2. 基本猫種データ
INSERT INTO "breeds" ("id", "code", "name", "description")
VALUES
  ('breed-1', 1, 'アメリカンショートヘア', '人気の短毛種'),
  ('breed-2', 2, 'ペルシャ', '長毛の代表的品種'),
  ('breed-3', 3, 'ラグドール', '大型で温厚な性格');

-- 3. 基本毛色データ
INSERT INTO "coat_colors" ("id", "code", "name", "description")
VALUES
  ('color-1', 1, 'ブラック', '黒色'),
  ('color-2', 2, 'ホワイト', '白色'),
  ('color-3', 3, 'ブラウン', '茶色');

-- 4. 基本タグ
INSERT INTO "tags" ("id", "name", "color", "description")
VALUES
  ('tag-1', '室内飼い', '#10B981', '完全室内飼育'),
  ('tag-2', '繁殖用', '#F59E0B', '繁殖に使用'),
  ('tag-3', 'ペット', '#3B82F6', 'ペット用途');
```

## 🛡️ セキュリティ設定

### データベースユーザー権限

```sql
-- 専用ユーザー作成
CREATE USER mycats_app WITH PASSWORD 'secure_password';

-- 必要最小限の権限付与
GRANT CONNECT ON DATABASE mycats_production TO mycats_app;
GRANT USAGE ON SCHEMA public TO mycats_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mycats_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO mycats_app;
```

### 接続セキュリティ

```bash
# SSL接続の有効化
DATABASE_URL="postgresql://mycats_app:password@hostname:5432/mycats_production?sslmode=require"

# 接続プール設定
DATABASE_URL="postgresql://mycats_app:password@hostname:5432/mycats_production?connection_limit=10&pool_timeout=20"
```

## 📊 パフォーマンス最適化

### 推奨インデックス作成

```sql
-- 検索パフォーマンス向上用インデックス
CREATE INDEX "idx_cats_owner_id" ON "cats"("owner_id");
CREATE INDEX "idx_cats_breed_id" ON "cats"("breed_id");
CREATE INDEX "idx_cats_birth_date" ON "cats"("birth_date");
CREATE INDEX "idx_care_records_cat_id_date" ON "care_records"("cat_id", "care_date");
CREATE INDEX "idx_schedules_assigned_date" ON "schedules"("assigned_to", "schedule_date");
CREATE INDEX "idx_pedigrees_father" ON "pedigrees"("father_pedigree_id");
CREATE INDEX "idx_pedigrees_mother" ON "pedigrees"("mother_pedigree_id");
```

### PostgreSQL設定調整

```sql
-- postgresql.conf の推奨設定
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
```

## 🔍 ヘルスチェック・監視

### アプリケーションヘルスチェック

```bash
# データベース接続確認
curl http://localhost:3004/health

# 期待するレスポンス:
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  }
}
```

### データベース監視クエリ

```sql
-- 接続数確認
SELECT count(*) as connections FROM pg_stat_activity;

-- テーブルサイズ確認
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 実行中クエリ確認
SELECT
  query,
  state,
  query_start,
  state_change
FROM pg_stat_activity
WHERE state = 'active';
```

## 🚨 トラブルシューティング

### よくある問題と解決策

**1. マイグレーション失敗**

```bash
# 原因: データベース接続エラー
# 解決: DATABASE_URL の確認

# マイグレーション状態確認
pnpm --filter backend run prisma:status

# マニュアルマイグレーション
pnpm --filter backend run prisma:migrate -- deploy --schema ./prisma/schema.prisma
```

**2. Prismaクライアント生成エラー**

```bash
# 原因: スキーマ構文エラー
# 解決: schema.prisma の構文確認

# クライアント再生成
rm -rf node_modules/.prisma
pnpm -w run db:generate
```

**3. 外部キー制約エラー**

```bash
# 原因: 参照整合性違反
# 解決: 依存関係順序での投入

# 制約確認
psql $DATABASE_URL -c "\d+ cats"
```

## 📋 デプロイチェックリスト

- [ ] PostgreSQL 15以上がインストール済み
- [ ] Node.js 20以上がインストール済み
- [ ] 本番用環境変数ファイル（.env.production）作成済み
- [ ] DATABASE_URL が正しく設定済み
- [ ] JWT_SECRET が安全な値に設定済み
- [ ] 依存関係インストール完了
- [ ] Prismaクライアント生成完了
- [ ] データベースマイグレーション完了
- [ ] 初期データ投入完了
- [ ] アプリケーションビルド完了
- [ ] ヘルスチェック成功
- [ ] SSL証明書設定済み（HTTPS）
- [ ] ファイアウォール設定完了
- [ ] バックアップ設定完了
- [ ] 監視設定完了

---

**関連ドキュメント**:

- [データベース詳細仕様](./DATABASE_PRODUCTION_SCHEMA.md)
- [ER図とシステム構成](./DATABASE_ER_DIAGRAM.md)
- [開発者向けクイックリファレンス](../DATABASE_QUICK_REF.md)

_最終更新: 2025年1月_  
_作成者: 猫生体管理システム開発チーム_
