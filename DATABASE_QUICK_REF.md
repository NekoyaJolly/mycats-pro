# 🔧 データベース クイックリファレンス

## 📁 ファイル構成

- **スキーマ定義**: `backend/prisma/schema.prisma`
- **マイグレーション**: `backend/prisma/migrations/`
- **詳細ドキュメント**: `docs/DATABASE_PRODUCTION_SCHEMA.md`

## ⚙️ 基本コマンド

### 開発環境

```bash
npm run db:migrate      # マイグレーション実行
npm run db:generate     # Prismaクライアント生成
npm run db:studio       # データベースGUI起動
npm run db:seed         # サンプルデータ投入
```

### 本番環境

```bash
pnpm -w run db:generate  # Prismaクライアント生成
pnpm -w run db:deploy    # 本番マイグレーション
NODE_ENV=production node backend/dist/main.js
```

## 🗂️ テーブル構成（11テーブル）

### メインテーブル

| テーブル           | 説明         | 主要検索条件                       |
| ------------------ | ------------ | ---------------------------------- |
| `users`            | ユーザー管理 | email, role                        |
| `cats`             | 猫基本情報   | owner_id, breed_id, name           |
| `pedigrees`        | 血統情報     | pedigree_id, cat_name              |
| `breeding_records` | 交配記録     | male_id, female_id, breeding_date  |
| `care_records`     | ケア履歴     | cat_id, care_type, care_date       |
| `schedules`        | 予定管理     | assigned_to, schedule_date, status |

### マスタテーブル

| テーブル      | 説明 | キーフィールド |
| ------------- | ---- | -------------- |
| `breeds`      | 猫種 | code, name     |
| `coat_colors` | 毛色 | code, name     |
| `tags`        | タグ | name, color    |

### 関連テーブル

| テーブル         | 説明         | 関連           |
| ---------------- | ------------ | -------------- |
| `login_attempts` | ログイン履歴 | user_id        |
| `cat_tags`       | 猫タグ関連   | cat_id, tag_id |

## 🔍 よく使用するクエリパターン

### 1. 所有者の猫一覧

```sql
SELECT c.*, b.name as breed_name, cc.name as color_name
FROM cats c
LEFT JOIN breeds b ON c.breed_id = b.id
LEFT JOIN coat_colors cc ON c.color_id = cc.id
WHERE c.owner_id = ? AND c.is_active = true
ORDER BY c.birth_date DESC;
```

### 2. 猫の血統3世代

```sql
WITH RECURSIVE pedigree_tree AS (
  SELECT id, cat_name, father_pedigree_id, mother_pedigree_id, 0 as generation
  FROM pedigrees WHERE id = ?
  UNION ALL
  SELECT p.id, p.cat_name, p.father_pedigree_id, p.mother_pedigree_id, pt.generation + 1
  FROM pedigrees p
  JOIN pedigree_tree pt ON (p.id = pt.father_pedigree_id OR p.id = pt.mother_pedigree_id)
  WHERE pt.generation < 3
)
SELECT * FROM pedigree_tree;
```

### 3. 期間別ケア記録

```sql
SELECT cr.*, c.name as cat_name, u.email as recorder_email
FROM care_records cr
JOIN cats c ON cr.cat_id = c.id
JOIN users u ON cr.recorded_by = u.id
WHERE cr.care_date BETWEEN ? AND ?
ORDER BY cr.care_date DESC;
```

### 4. 予定スケジュール

```sql
SELECT s.*, c.name as cat_name, u.email as assignee_email
FROM schedules s
LEFT JOIN cats c ON s.cat_id = c.id
JOIN users u ON s.assigned_to = u.id
WHERE s.status = 'PENDING'
  AND s.schedule_date >= CURRENT_DATE
ORDER BY s.schedule_date ASC;
```

## 🔗 重要なリレーション

### 親子関係（cats）

```sql
-- 親猫の子猫一覧
SELECT child.* FROM cats child
WHERE child.father_id = ? OR child.mother_id = ?;

-- 猫の両親
SELECT father.name as father_name, mother.name as mother_name
FROM cats c
LEFT JOIN cats father ON c.father_id = father.id
LEFT JOIN cats mother ON c.mother_id = mother.id
WHERE c.id = ?;
```

### タグ関係（多対多）

```sql
-- 猫のタグ一覧
SELECT t.* FROM tags t
JOIN cat_tags ct ON t.id = ct.tag_id
WHERE ct.cat_id = ?;

-- タグ付きの猫一覧
SELECT c.* FROM cats c
JOIN cat_tags ct ON c.id = ct.cat_id
JOIN tags t ON ct.tag_id = t.id
WHERE t.name = ?;
```

## 🎯 列挙型の値

### UserRole

- `USER` - 一般ユーザー
- `ADMIN` - 管理者
- `SUPER_ADMIN` - スーパー管理者

### Gender

- `MALE` - オス
- `FEMALE` - メス

### BreedingStatus

- `PLANNED` - 計画中
- `IN_PROGRESS` - 進行中
- `COMPLETED` - 完了
- `FAILED` - 失敗

### CareType

- `VACCINATION` - 予防接種
- `HEALTH_CHECK` - 健康診断
- `GROOMING` - グルーミング
- `DENTAL_CARE` - 歯科ケア
- `MEDICATION` - 投薬
- `SURGERY` - 手術
- `OTHER` - その他

### ScheduleStatus

- `PENDING` - 未実行
- `IN_PROGRESS` - 実行中
- `COMPLETED` - 完了
- `CANCELLED` - キャンセル

### Priority

- `LOW` - 低
- `MEDIUM` - 中
- `HIGH` - 高
- `URGENT` - 緊急

## 🔧 メンテナンスコマンド

### データベース状態確認

```bash
npm run prisma:status     # マイグレーション状態
psql $DATABASE_URL -c "\dt"  # テーブル一覧
psql $DATABASE_URL -c "\d cats"  # catsテーブル構造
```

### パフォーマンス確認

```sql
-- テーブルサイズ確認
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- インデックス使用状況
SELECT
  indexrelname,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;
```

## 🚨 トラブルシューティング

### よくある問題

1. **外部キー制約エラー**: 削除時の参照整合性確認
2. **一意制約違反**: 重複データの事前チェック
3. **マイグレーション失敗**: ロールバック後の再実行

### 緊急時コマンド

```bash
# マイグレーション強制リセット（開発環境のみ）
npm run prisma:migrate -- reset

# Prismaクライアント再生成
npm run db:generate

# データベース接続確認
npm run test:health
```

---

**詳細情報**: [DATABASE_PRODUCTION_SCHEMA.md](./docs/DATABASE_PRODUCTION_SCHEMA.md)  
**最終更新**: 2025年1月
