# データベース クイックリファレンス

## 🚀 接続情報
- **URL**: `postgresql://catuser:catpassword@localhost:5432/catmanagement`
- **Driver**: PostgreSQL 14
- **ORM**: Prisma v5.22.0

## 📋 テーブル一覧

| テーブル | 主要フィールド | 説明 |
|---------|-------------|------|
| `users` | id, email, role | ユーザー管理 |
| `breeds` | id, code, name | 猫種マスタ |
| `coat_colors` | id, code, name | 毛色マスタ |
| `cats` | id, name, breedId, colorId | 猫基本情報 |
| `pedigrees` | id, pedigreeId, catName | 血統書 |
| `breeding_records` | id, maleId, femaleId | 繁殖記録 |
| `care_records` | id, catId, careType | ケア記録 |
| `schedules` | id, title, scheduleDate | スケジュール |
| `tags` | id, name, color | タグマスタ |
| `cat_tags` | catId, tagId | 猫-タグ関連 |

## 🔗 主要リレーション

```
users → cats (ownerId)
cats → breeds (breedId)
cats → coat_colors (colorId)
cats → cats (fatherId, motherId) [家系]
cats → pedigrees (catId)
cats ↔ tags (cat_tags経由)
```

## 📊 Enum値

### UserRole
- `USER`, `ADMIN`, `SUPER_ADMIN`

### Gender
- `MALE`, `FEMALE`

### BreedingStatus
- `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `FAILED`

### CareType
- `VACCINATION`, `HEALTH_CHECK`, `GROOMING`, `DENTAL_CARE`, `MEDICATION`, `SURGERY`, `OTHER`

### ScheduleType
- `BREEDING`, `CARE`, `APPOINTMENT`, `REMINDER`, `MAINTENANCE`

### ScheduleStatus
- `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

### Priority
- `LOW`, `MEDIUM`, `HIGH`, `URGENT`

## 🛠️ よく使うクエリ

### 猫の家系情報
```sql
SELECT c.name, f.name as father, m.name as mother 
FROM cats c
LEFT JOIN cats f ON c.fatherId = f.id
LEFT JOIN cats m ON c.motherId = m.id;
```

### 猫の品種・毛色情報
```sql
SELECT c.name, b.name as breed, cc.name as color
FROM cats c
LEFT JOIN breeds b ON c.breedId = b.id
LEFT JOIN coat_colors cc ON c.colorId = cc.id;
```

### 未来のスケジュール
```sql
SELECT title, scheduleDate, priority
FROM schedules 
WHERE scheduleDate > NOW() 
ORDER BY scheduleDate;
```

## 🗂️ ファイル場所
- **詳細ドキュメント**: `DATABASE_SCHEMA.md`
- **Prismaスキーマ**: `backend/prisma/schema.prisma`
- **マイグレーション**: `backend/prisma/migrations/`
