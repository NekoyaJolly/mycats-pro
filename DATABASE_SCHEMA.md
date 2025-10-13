# 🗄️ データベース設計

## 📋 概要

本プロジェクトでは、PostgreSQL 15+ と Prisma 6.14.0 ORM を使用して猫生体管理システムのデータベースを構築しています。本番環境デプロイ時には、以下に示すスキーマが自動的に生成されます。

## 📚 ドキュメント構成

- **[本ドキュメント](./DATABASE_SCHEMA.md)** - データベース設計の概要
- **[詳細スキーマ仕様](./docs/DATABASE_PRODUCTION_SCHEMA.md)** - 本番環境の完全なテーブル・リレーション仕様
- **[クイックリファレンス](./DATABASE_QUICK_REF.md)** - 開発者向け簡易リファレンス

## 🗂️ 主要テーブル一覧（15テーブル）

| No. | テーブル名           | 物理名                   | 概要                       | 主要フィールド |
| --- | -------------------- | ------------------------ | -------------------------- | -------------- |
| 1   | ユーザー             | `users`                  | システム利用者管理         | email, name, role, clerk_id |
| 2   | ログイン試行         | `login_attempts`         | セキュリティ監査ログ       | user_id, email, success, ip_address |
| 3   | 猫種マスタ           | `breeds`                 | 猫の品種定義               | code, name, description |
| 4   | 毛色マスタ           | `coat_colors`            | 毛色分類定義               | code, name, description |
| 5   | 猫基本情報           | `cats`                   | 猫の個体情報               | name, birth_date, gender, breed_id |
| 6   | 交配記録             | `breeding_records`       | 交配・繁殖履歴             | male_id, female_id, breeding_date, status |
| 7   | ケア記録             | `care_records`           | 医療・ケア履歴             | cat_id, care_type, care_date, description |
| 8   | スケジュール         | `schedules`              | 予定・タスク管理           | title, schedule_date, type, status, cat_id |
| 9   | タグカテゴリ         | `tag_categories`         | タグの分類カテゴリ定義     | key, name, scopes, display_order |
| 10  | タグマスタ           | `tags`                   | カテゴリ配下のタグ定義     | category_id, name, allows_manual, allows_automation |
| 11  | タグ自動化ルール     | `tag_automation_rules`   | 自動付与ルール定義         | key, trigger_type, event_type, priority |
| 12  | タグ自動化実行       | `tag_automation_runs`    | 自動付与実行履歴           | rule_id, status, started_at |
| 13  | タグ付与履歴         | `tag_assignment_history` | タグ付与/剥奪の履歴管理     | cat_id, tag_id, action, source |
| 14  | 猫タグ関連           | `cat_tags`               | 猫とタグの多対多           | cat_id, tag_id |
| 15  | 血統情報             | `pedigrees`              | 血統書・家系図             | pedigree_id, cat_name, father_pedigree_id, mother_pedigree_id |


## 🔗 主要リレーション設計

### 1. ユーザー中心のリレーション

```
users (1) ──────────→ (∞) cats                [所有関係]
  │
  ├── (∞) breeding_records                     [記録者として]
  ├── (∞) care_records                         [記録者として]
  ├── (∞) schedules                            [担当者として]
  └── (∞) login_attempts                       [ログイン履歴]
```

### 2. 猫中心のリレーション

```
cats (1) ────────────→ (∞) cats                [親子関係・自己参照]
  │
  ├── (∞) breeding_records                     [オス/メスとして参加]
  ├── (∞) care_records                         [ケア対象として]
  ├── (∞) schedules                            [スケジュール対象として]
  ├── (∞) pedigrees                            [血統記録として]
  └── (∞) cat_tags ←→ (∞) tags                 [多対多タグ関係]

breeds (1) ──────────→ (∞) cats                [品種分類]
coat_colors (1) ─────→ (∞) cats                [毛色分類]
```

### 3. 血統関係のリレーション

```
pedigrees (1) ───────→ (∞) pedigrees           [血統関係・自己参照]
  │                                             ├─ 父親関係
  │                                             ├─ 母親関係
  │                                             ├─ 父方祖父関係
  │                                             ├─ 父方祖母関係
  │                                             ├─ 母方祖父関係
  │                                             └─ 母方祖母関係
  │
  ├── breeds (∞) ──────→ (1)                   [品種情報]
  └── coat_colors (∞) ─→ (1)                   [毛色情報]
```

## 📊 列挙型（Enum）定義

### ユーザー関連

- **UserRole**: `USER`, `ADMIN`, `SUPER_ADMIN`

### 猫関連

- **Gender**: `MALE`, `FEMALE`

### 交配関連

- **BreedingStatus**: `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `FAILED`

### ケア関連

- **CareType**: `VACCINATION`, `HEALTH_CHECK`, `GROOMING`, `DENTAL_CARE`, `MEDICATION`, `SURGERY`, `OTHER`

### スケジュール関連

- **ScheduleType**: `BREEDING`, `CARE`, `APPOINTMENT`, `REMINDER`, `MAINTENANCE`
- **ScheduleStatus**: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- **Priority**: `LOW`, `MEDIUM`, `HIGH`, `URGENT`

### タグ関連

- **TagAssignmentAction**: `ASSIGNED`, `UNASSIGNED`
- **TagAssignmentSource**: `MANUAL`, `AUTOMATION`, `SYSTEM`
- **TagAutomationTriggerType**: `EVENT`, `SCHEDULE`, `MANUAL`
- **TagAutomationEventType**: `BREEDING_PLANNED`, `BREEDING_CONFIRMED`, `PREGNANCY_CONFIRMED`, `KITTEN_REGISTERED`, `AGE_THRESHOLD`, `CUSTOM`
- **TagAutomationRunStatus**: `PENDING`, `COMPLETED`, `FAILED`

## 🔑 重要な制約とインデックス

### 一意制約（UNIQUE）

- `users`: `clerk_id`, `email`
- `breeds`: `code`, `name`
- `coat_colors`: `code`, `name`
- `cats`: `registration_id`, `microchip_id`
- `tag_categories`: `key`
- `tags`: (`category_id`, `name`)
- `tag_automation_rules`: `key`
- `pedigrees`: `pedigree_id`

### 外部キー制約の削除動作

- **CASCADE削除**: `login_attempts`, `care_records`, `cat_tags`, `tag_assignment_history`
- **SET NULL**: `cats` (父母関係), `pedigrees` (血統関係), `schedules`
- **RESTRICT**: `users`関連の重要なレコード

### パフォーマンス用インデックス

- 検索頻度の高いフィールド（`owner_id`, `breed_id`, `birth_date` など）
- 外部キーフィールド
- 日付範囲検索用フィールド

## 🚀 本番環境デプロイ時のデータベース生成

### 1. 自動生成されるテーブル

```bash
# Prismaマイグレーション実行時に以下が自動生成される
- 11個のメインテーブル
- 7個の列挙型（Enum）
- 外部キー制約
- インデックス
- デフォルト値設定
```

### 2. 初期データの投入

```bash
# 本番環境では以下の初期データが必要
npm run db:seed  # マスタデータの投入

# 含まれるデータ:
- 管理者ユーザー
- 基本品種データ（breeds）
- 基本毛色データ（coat_colors）
- 基本タグデータ（tags）
```

### 3. 本番環境のデータベース設定

```bash
# 環境変数設定
DATABASE_URL="postgresql://user:pass@host:5432/mycats_production"

# デプロイコマンド
pnpm -w run db:generate  # Prismaクライアント生成
pnpm -w run db:deploy    # 本番環境マイグレーション実行
```

## 📈 データ規模の想定

### 推定レコード数（本格運用時）

- **users**: 100-1,000 レコード
- **cats**: 1,000-10,000 レコード
- **pedigrees**: 5,000-50,000 レコード
- **breeding_records**: 500-5,000 レコード
- **care_records**: 5,000-50,000 レコード
- **schedules**: 1,000-10,000 レコード

### ストレージ容量想定

- **小規模運用**: 100MB - 1GB
- **中規模運用**: 1GB - 10GB
- **大規模運用**: 10GB - 100GB

## 🔍 開発・運用時の参考

### よく使用されるクエリパターン

1. **所有者別猫一覧**: `users` → `cats` JOIN
2. **猫の血統検索**: `pedigrees` 自己JOIN（再帰）
3. **期間別ケア履歴**: `care_records` 日付範囲検索
4. **予定済みスケジュール**: `schedules` ステータス・日付フィルタ

### メンテナンス項目

- **日次**: バックアップ、統計情報更新
- **週次**: インデックス最適化
- **月次**: データアーカイブ、容量分析

---

## 📖 詳細情報の参照

データベースの詳細な仕様、フィールド定義、リレーションの詳細については以下をご確認ください：

**→ [本番環境データベーススキーマ詳細](./docs/DATABASE_PRODUCTION_SCHEMA.md)**

このドキュメントには以下の詳細情報が含まれています：

- 全テーブルのフィールド定義
- データ型・制約の詳細
- リレーション設計の詳細
- 推奨インデックス設定
- パフォーマンス最適化
- 監視・メンテナンス指針

---

_最終更新: 2025年1月_  
_管理: 猫生体管理システム開発チーム_
