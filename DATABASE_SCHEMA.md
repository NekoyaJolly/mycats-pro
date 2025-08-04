# 猫管理システム データベース構造

## 概要

このドキュメントは猫管理システムのデータベース構造を詳細に説明します。PostgreSQL 14を使用し、PrismaをORMとして採用しています。

---

## テーブル一覧

| テーブル名 | 日本語名 | 説明 |
|-----------|---------|------|
| `users` | ユーザー | システムユーザー情報 |
| `breeds` | 猫種 | 猫の品種マスタ |
| `coat_colors` | 毛色 | 猫の毛色マスタ |
| `cats` | 猫 | 猫の基本情報 |
| `pedigrees` | 血統書 | 血統書データ |
| `breeding_records` | 繁殖記録 | 繁殖活動の記録 |
| `care_records` | ケア記録 | 健康管理・ケア記録 |
| `schedules` | スケジュール | タスク・予定管理 |
| `tags` | タグ | 分類用タグマスタ |
| `cat_tags` | 猫タグ関連 | 猫とタグの中間テーブル |

---

## 詳細テーブル構造

### 1. users テーブル
**ユーザー情報**

| フィールド名 | 型 | 制約 | 説明 |
|-------------|----|----|------|
| `id` | String | PK, UUID | ユーザーID |
| `clerkId` | String | UNIQUE | Clerk認証ID |
| `email` | String | UNIQUE | メールアドレス |
| `firstName` | String? | NULL可 | 名 |
| `lastName` | String? | NULL可 | 姓 |
| `role` | UserRole | DEFAULT: USER | ユーザー権限 |
| `isActive` | Boolean | DEFAULT: true | アクティブ状態 |
| `createdAt` | DateTime | DEFAULT: now() | 作成日時 |
| `updatedAt` | DateTime | 自動更新 | 更新日時 |

**リレーション:**
- `cats[]` - 所有する猫一覧
- `breedingRecords[]` - 記録した繁殖記録
- `careRecords[]` - 記録したケア記録
- `schedules[]` - 割り当てられたスケジュール

**Enum: UserRole**
- `USER` - 一般ユーザー
- `ADMIN` - 管理者
- `SUPER_ADMIN` - スーパー管理者

---

### 2. breeds テーブル
**猫種マスタ**

| フィールド名 | 型 | 制約 | 説明 |
|-------------|----|----|------|
| `id` | String | PK, UUID | 猫種ID |
| `code` | Int | UNIQUE | 猫種コード（CSV由来） |
| `name` | String | UNIQUE | 猫種名称（CSV由来） |
| `description` | String? | NULL可 | 説明 |
| `isActive` | Boolean | DEFAULT: true | アクティブ状態 |
| `createdAt` | DateTime | DEFAULT: now() | 作成日時 |
| `updatedAt` | DateTime | 自動更新 | 更新日時 |

**リレーション:**
- `cats[]` - この猫種の猫一覧
- `pedigrees[]` - この猫種の血統書一覧

---

### 3. coat_colors テーブル
**毛色マスタ**

| フィールド名 | 型 | 制約 | 説明 |
|-------------|----|----|------|
| `id` | String | PK, UUID | 毛色ID |
| `code` | Int | UNIQUE | 毛色コード（CSV由来） |
| `name` | String | UNIQUE | 毛色名称（CSV由来） |
| `description` | String? | NULL可 | 説明 |
| `isActive` | Boolean | DEFAULT: true | アクティブ状態 |
| `createdAt` | DateTime | DEFAULT: now() | 作成日時 |
| `updatedAt` | DateTime | 自動更新 | 更新日時 |

**リレーション:**
- `cats[]` - この毛色の猫一覧
- `pedigrees[]` - この毛色の血統書一覧

---

### 4. cats テーブル
**猫基本情報**

| フィールド名 | 型 | 制約 | 説明 |
|-------------|----|----|------|
| `id` | String | PK, UUID | 猫ID |
| `registrationId` | String | UNIQUE | 登録ID |
| `name` | String | NOT NULL | 猫の名前 |
| `breedId` | String? | FK→breeds.id | 猫種ID |
| `colorId` | String? | FK→coat_colors.id | 毛色ID |
| `legacyBreed` | String? | NULL可 | 旧猫種フィールド（後方互換） |
| `legacyColor` | String? | NULL可 | 旧毛色フィールド（後方互換） |
| `pattern` | String? | NULL可 | 模様 |
| `gender` | Gender | NOT NULL | 性別 |
| `birthDate` | DateTime | NOT NULL | 生年月日 |
| `weight` | Float? | NULL可 | 体重 |
| `microchipId` | String? | UNIQUE | マイクロチップID |
| `isActive` | Boolean | DEFAULT: true | アクティブ状態 |
| `notes` | String? | NULL可 | 備考 |
| `imageUrl` | String? | NULL可 | 画像URL |
| `fatherId` | String? | FK→cats.id | 父猫ID |
| `motherId` | String? | FK→cats.id | 母猫ID |
| `ownerId` | String | FK→users.id | 所有者ID |
| `createdAt` | DateTime | DEFAULT: now() | 作成日時 |
| `updatedAt` | DateTime | 自動更新 | 更新日時 |

**リレーション:**
- `breed` - 所属する猫種
- `color` - 毛色
- `father` - 父猫
- `mother` - 母猫
- `fatherOf[]` - 父親である子猫一覧
- `motherOf[]` - 母親である子猫一覧
- `owner` - 所有者
- `maleBreedingRecords[]` - 雄として参加した繁殖記録
- `femaleBreedingRecords[]` - 雌として参加した繁殖記録
- `careRecords[]` - ケア記録一覧
- `schedules[]` - 関連スケジュール
- `tags[]` - 付与されたタグ（中間テーブル経由）
- `pedigrees[]` - 関連血統書

**Enum: Gender**
- `MALE` - 雄
- `FEMALE` - 雌

---

### 5. pedigrees テーブル
**血統書データ**

| フィールド名 | 型 | 制約 | 説明 |
|-------------|----|----|------|
| `id` | String | PK, UUID | 血統書ID |
| `pedigreeId` | String | UNIQUE | 血統書番号（GP、6桁キー）|
| `catId` | String? | FK→cats.id | 関連猫ID |
| `title` | String? | NULL可 | 猫名前１ |
| `catteryName` | String? | NULL可 | 猫名前２（キャッテリー名） |
| `catName` | String | NOT NULL | 猫名前３ |
| `breedId` | String? | FK→breeds.id | 猫種ID |
| `breedCode` | Int? | NULL可 | 猫種コード |
| `gender` | Int? | NULL可 | 性別（1=雄, 2=雌） |
| `eyeColor` | String? | NULL可 | 目色 |
| `colorId` | String? | FK→coat_colors.id | 毛色ID |
| `coatColorCode` | Int? | NULL可 | 毛色コード |
| `birthDate` | DateTime? | NULL可 | 生年月日 |
| `registrationDate` | DateTime? | NULL可 | 登録年月日 |
| `breederName` | String? | NULL可 | 繁殖者名 |
| `ownerName` | String? | NULL可 | 所有者名 |
| `brotherCount` | Int? | NULL可 | 兄弟の人数 |
| `sisterCount` | Int? | NULL可 | 姉妹の人数 |
| `notes` | String? | NULL可 | 摘要 |
| `notes2` | String? | NULL可 | 摘要２ |
| `otherNo` | String? | NULL可 | 他団体No |
| `championFlag` | String? | NULL可 | チャンピオンフラグ |
| `oldCode` | String? | NULL可 | 旧コード |
| `fatherPedigreeId` | String? | FK→pedigrees.id | 父血統書ID |
| `motherPedigreeId` | String? | FK→pedigrees.id | 母血統書ID |
| `paternalGrandfatherId` | String? | FK→pedigrees.id | 父方祖父ID |
| `paternalGrandmotherId` | String? | FK→pedigrees.id | 父方祖母ID |
| `maternalGrandfatherId` | String? | FK→pedigrees.id | 母方祖父ID |
| `maternalGrandmotherId` | String? | FK→pedigrees.id | 母方祖母ID |
| `createdAt` | DateTime | DEFAULT: now() | 作成日時 |
| `updatedAt` | DateTime | 自動更新 | 更新日時 |

**リレーション:**
- `cat` - 関連する猫
- `breed` - 猫種
- `color` - 毛色
- `fatherPedigree` - 父の血統書
- `motherPedigree` - 母の血統書
- `fatherOf[]` - 父親である血統書一覧
- `motherOf[]` - 母親である血統書一覧
- `paternalGrandfather` - 父方祖父血統書
- `paternalGrandmother` - 父方祖母血統書
- `maternalGrandfather` - 母方祖父血統書
- `maternalGrandmother` - 母方祖母血統書
- 各祖父母の逆リレーション

---

### 6. breeding_records テーブル
**繁殖記録**

| フィールド名 | 型 | 制約 | 説明 |
|-------------|----|----|------|
| `id` | String | PK, UUID | 繁殖記録ID |
| `maleId` | String | FK→cats.id | 雄猫ID |
| `femaleId` | String | FK→cats.id | 雌猫ID |
| `breedingDate` | DateTime | NOT NULL | 交配日 |
| `expectedDueDate` | DateTime? | NULL可 | 出産予定日 |
| `actualDueDate` | DateTime? | NULL可 | 実際の出産日 |
| `numberOfKittens` | Int? | NULL可 | 子猫数 |
| `notes` | String? | NULL可 | 備考 |
| `status` | BreedingStatus | DEFAULT: PLANNED | 繁殖状況 |
| `recordedBy` | String | FK→users.id | 記録者ID |
| `createdAt` | DateTime | DEFAULT: now() | 作成日時 |
| `updatedAt` | DateTime | 自動更新 | 更新日時 |

**リレーション:**
- `male` - 雄猫
- `female` - 雌猫
- `recorder` - 記録者

**Enum: BreedingStatus**
- `PLANNED` - 計画中
- `IN_PROGRESS` - 進行中
- `COMPLETED` - 完了
- `FAILED` - 失敗

---

### 7. care_records テーブル
**ケア記録**

| フィールド名 | 型 | 制約 | 説明 |
|-------------|----|----|------|
| `id` | String | PK, UUID | ケア記録ID |
| `catId` | String | FK→cats.id | 猫ID |
| `careType` | CareType | NOT NULL | ケア種別 |
| `description` | String | NOT NULL | 説明 |
| `careDate` | DateTime | NOT NULL | ケア実施日 |
| `nextDueDate` | DateTime? | NULL可 | 次回予定日 |
| `cost` | Float? | NULL可 | 費用 |
| `veterinarian` | String? | NULL可 | 獣医師名 |
| `notes` | String? | NULL可 | 備考 |
| `recordedBy` | String | FK→users.id | 記録者ID |
| `createdAt` | DateTime | DEFAULT: now() | 作成日時 |
| `updatedAt` | DateTime | 自動更新 | 更新日時 |

**リレーション:**
- `cat` - 対象猫
- `recorder` - 記録者

**Enum: CareType**
- `VACCINATION` - ワクチン接種
- `HEALTH_CHECK` - 健康診断
- `GROOMING` - グルーミング
- `DENTAL_CARE` - 歯科ケア
- `MEDICATION` - 投薬
- `SURGERY` - 手術
- `OTHER` - その他

---

### 8. schedules テーブル
**スケジュール管理**

| フィールド名 | 型 | 制約 | 説明 |
|-------------|----|----|------|
| `id` | String | PK, UUID | スケジュールID |
| `title` | String | NOT NULL | タイトル |
| `description` | String? | NULL可 | 説明 |
| `scheduleDate` | DateTime | NOT NULL | 予定日時 |
| `scheduleType` | ScheduleType | NOT NULL | スケジュール種別 |
| `status` | ScheduleStatus | DEFAULT: PENDING | ステータス |
| `priority` | Priority | DEFAULT: MEDIUM | 優先度 |
| `catId` | String? | FK→cats.id | 関連猫ID（任意） |
| `assignedTo` | String | FK→users.id | 担当者ID |
| `createdAt` | DateTime | DEFAULT: now() | 作成日時 |
| `updatedAt` | DateTime | 自動更新 | 更新日時 |

**リレーション:**
- `cat` - 関連猫（任意）
- `assignee` - 担当者

**Enum: ScheduleType**
- `BREEDING` - 繁殖関連
- `CARE` - ケア関連
- `APPOINTMENT` - 予約
- `REMINDER` - リマインダー
- `MAINTENANCE` - メンテナンス

**Enum: ScheduleStatus**
- `PENDING` - 未実施
- `IN_PROGRESS` - 進行中
- `COMPLETED` - 完了
- `CANCELLED` - キャンセル

**Enum: Priority**
- `LOW` - 低
- `MEDIUM` - 中
- `HIGH` - 高
- `URGENT` - 緊急

---

### 9. tags テーブル
**タグマスタ**

| フィールド名 | 型 | 制約 | 説明 |
|-------------|----|----|------|
| `id` | String | PK, UUID | タグID |
| `name` | String | UNIQUE | タグ名 |
| `color` | String | DEFAULT: "#3B82F6" | 表示色 |
| `description` | String? | NULL可 | 説明 |
| `createdAt` | DateTime | DEFAULT: now() | 作成日時 |
| `updatedAt` | DateTime | 自動更新 | 更新日時 |

**リレーション:**
- `cats[]` - このタグを持つ猫一覧（中間テーブル経由）

---

### 10. cat_tags テーブル
**猫タグ関連（中間テーブル）**

| フィールド名 | 型 | 制約 | 説明 |
|-------------|----|----|------|
| `catId` | String | FK→cats.id | 猫ID |
| `tagId` | String | FK→tags.id | タグID |
| `createdAt` | DateTime | DEFAULT: now() | 作成日時 |

**複合主キー:** `(catId, tagId)`

**リレーション:**
- `cat` - 猫（CASCADE削除）
- `tag` - タグ（CASCADE削除）

---

## リレーション図

```
users (1) ——————— (n) cats
  │                  │
  │                  ├── (n) breeding_records (male/female)
  │                  ├── (n) care_records
  │                  ├── (n) schedules
  │                  ├── (n:m) tags (via cat_tags)
  │                  └── (n) pedigrees
  │
  ├── (n) breeding_records (recorder)
  ├── (n) care_records (recorder)
  └── (n) schedules (assignee)

breeds (1) ——————— (n) cats
  │
  └── (n) pedigrees

coat_colors (1) ——— (n) cats
  │
  └── (n) pedigrees

cats ——————————————— cats (parent-child)
  │
  └── (self-reference: father/mother)

pedigrees ——————————— pedigrees (family tree)
  │
  └── (self-reference: father/mother/grandparents)
```

---

## インデックス

各テーブルには以下のインデックスが自動作成されます：

- **主キー**: 全テーブルの `id` フィールド
- **UNIQUE制約**: `registrationId`, `microchipId`, `pedigreeId`, `email`, `clerkId` など
- **外部キー**: 全リレーションフィールド

---

## 使用例

### 猫の家系図取得
```sql
SELECT 
  c.name,
  f.name as father_name,
  m.name as mother_name
FROM cats c
LEFT JOIN cats f ON c.fatherId = f.id
LEFT JOIN cats m ON c.motherId = m.id;
```

### 血統書の祖父母情報取得
```sql
SELECT 
  p.catName,
  pf.catName as father,
  pm.catName as mother,
  pgf.catName as paternal_grandfather,
  pgm.catName as paternal_grandmother
FROM pedigrees p
LEFT JOIN pedigrees pf ON p.fatherPedigreeId = pf.id
LEFT JOIN pedigrees pm ON p.motherPedigreeId = pm.id
LEFT JOIN pedigrees pgf ON p.paternalGrandfatherId = pgf.id
LEFT JOIN pedigrees pgm ON p.paternalGrandmotherId = pgm.id;
```

---

**最終更新:** 2025年8月4日  
**データベース:** PostgreSQL 14  
**ORM:** Prisma v5.22.0
