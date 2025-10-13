# 🗄️ 本番環境データベーススキーマ詳細

## 📋 概要

本ドキュメントは、猫生体管理システム（My Cats）を本番環境にデプロイした際に、Prismaによって生成されるPostgreSQLデータベースの完全なスキーマ定義、テーブル構造、リレーション設計を詳述しています。

### システム情報

- **データベース**: PostgreSQL 15+
- **ORM**: Prisma 6.14.0
- **スキーマファイル**: `backend/prisma/schema.prisma`
- **生成日**: 2025年1月（本番環境デプロイ時点）

---

## 📊 データベース全体構成

### テーブル一覧（15テーブル）

| No. | テーブル名           | 物理名                   | 概要                       |
| --- | -------------------- | ------------------------ | -------------------------- |
| 1   | ユーザー             | `users`                  | システム利用者の管理       |
| 2   | ログイン試行         | `login_attempts`         | セキュリティ監査ログ       |
| 3   | 猫種マスタ           | `breeds`                 | 猫の品種マスタデータ       |
| 4   | 毛色マスタ           | `coat_colors`            | 毛色の分類マスタデータ     |
| 5   | 猫基本情報           | `cats`                   | 猫の個体情報               |
| 6   | 交配記録             | `breeding_records`       | 交配・繁殖履歴             |
| 7   | ケア記録             | `care_records`           | 医療・ケア履歴             |
| 8   | スケジュール         | `schedules`              | 予定・タスク管理           |
| 9   | タグカテゴリ         | `tag_categories`         | タグの分類カテゴリ         |
| 10  | タグマスタ           | `tags`                   | カテゴリ配下のタグ定義     |
| 11  | タグ自動化ルール     | `tag_automation_rules`   | タグ自動付与のルール管理   |
| 12  | タグ自動化実行       | `tag_automation_runs`    | 自動付与の実行履歴         |
| 13  | タグ付与履歴         | `tag_assignment_history` | 手動/自動タグ操作の履歴管理 |
| 14  | 猫タグ関連           | `cat_tags`               | 猫とタグの多対多関連       |
| 15  | 血統情報             | `pedigrees`              | 血統書・家系図データ       |


---

## 🔑 主要テーブル詳細

### 1. ユーザー（users）

**概要**: システム利用者の基本情報と認証データを管理

| フィールド名         | 物理名                  | データ型 | NULL | デフォルト | 説明                     |
| -------------------- | ----------------------- | -------- | ---- | ---------- | ------------------------ |
| ID                   | `id`                    | String   | ✗    | uuid()     | 主キー（UUID）           |
| Clerk ID             | `clerk_id`              | String   | ✗    | -          | 外部認証サービスID       |
| メール               | `email`                 | String   | ✗    | -          | ログイン用メールアドレス |
| 名前（姓）           | `first_name`            | String   | ✓    | -          | ユーザーの姓             |
| 名前（名）           | `last_name`             | String   | ✓    | -          | ユーザーの名             |
| ロール               | `role`                  | UserRole | ✗    | USER       | 権限レベル               |
| 有効フラグ           | `is_active`             | Boolean  | ✗    | true       | アカウント有効性         |
| パスワードハッシュ   | `password_hash`         | String   | ✓    | -          | ハッシュ化パスワード     |
| リフレッシュトークン | `refresh_token`         | String   | ✓    | -          | JWT更新用トークン        |
| ログイン失敗回数     | `failed_login_attempts` | Int      | ✗    | 0          | セキュリティ用カウンタ   |
| ロック期限           | `locked_until`          | DateTime | ✓    | -          | アカウントロック解除時刻 |
| 最終ログイン         | `last_login_at`         | DateTime | ✓    | -          | 最後のログイン時刻       |
| 作成日時             | `created_at`            | DateTime | ✗    | now()      | レコード作成日時         |
| 更新日時             | `updated_at`            | DateTime | ✗    | -          | レコード更新日時         |

**制約**:

- 主キー: `id`
- ユニーク制約: `clerk_id`, `email`

**リレーション**:

- → cats（1対多）: 所有する猫
- → breeding_records（1対多）: 記録した交配履歴
- → care_records（1対多）: 記録したケア履歴
- → schedules（1対多）: 担当するスケジュール
- → login_attempts（1対多）: ログイン試行履歴

### 2. ログイン試行（login_attempts）

**概要**: セキュリティ監査のためのログイン試行ログ

| フィールド名         | 物理名       | データ型 | NULL | デフォルト | 説明                     |
| -------------------- | ------------ | -------- | ---- | ---------- | ------------------------ |
| ID                   | `id`         | String   | ✗    | uuid()     | 主キー（UUID）           |
| ユーザーID           | `user_id`    | String   | ✓    | -          | 対象ユーザー（外部キー） |
| メール               | `email`      | String   | ✗    | -          | 試行されたメールアドレス |
| IPアドレス           | `ip_address` | String   | ✓    | -          | アクセス元IP             |
| ユーザーエージェント | `user_agent` | String   | ✓    | -          | ブラウザ情報             |
| 成功フラグ           | `success`    | Boolean  | ✗    | -          | ログイン成功/失敗        |
| 失敗理由             | `reason`     | String   | ✓    | -          | 失敗時の理由             |
| 試行日時             | `created_at` | DateTime | ✗    | now()      | ログイン試行日時         |

**制約**:

- 主キー: `id`
- 外部キー: `user_id` → users.id（CASCADE削除）

### 3. 猫種マスタ（breeds）

**概要**: 猫の品種を管理するマスタテーブル

| フィールド名 | 物理名        | データ型 | NULL | デフォルト | 説明                  |
| ------------ | ------------- | -------- | ---- | ---------- | --------------------- |
| ID           | `id`          | String   | ✗    | uuid()     | 主キー（UUID）        |
| 猫種コード   | `code`        | Int      | ✗    | -          | 数値コード（CSVから） |
| 猫種名       | `name`        | String   | ✗    | -          | 品種名称              |
| 説明         | `description` | String   | ✓    | -          | 品種の詳細説明        |
| 有効フラグ   | `is_active`   | Boolean  | ✗    | true       | マスタの有効性        |
| 作成日時     | `created_at`  | DateTime | ✗    | now()      | レコード作成日時      |
| 更新日時     | `updated_at`  | DateTime | ✗    | -          | レコード更新日時      |

**制約**:

- 主キー: `id`
- ユニーク制約: `code`, `name`

**リレーション**:

- → cats（1対多）: この品種の猫
- → pedigrees（1対多）: この品種の血統記録

### 4. 毛色マスタ（coat_colors）

**概要**: 猫の毛色を管理するマスタテーブル

| フィールド名 | 物理名        | データ型 | NULL | デフォルト | 説明                  |
| ------------ | ------------- | -------- | ---- | ---------- | --------------------- |
| ID           | `id`          | String   | ✗    | uuid()     | 主キー（UUID）        |
| 毛色コード   | `code`        | Int      | ✗    | -          | 数値コード（CSVから） |
| 毛色名       | `name`        | String   | ✗    | -          | 毛色名称              |
| 説明         | `description` | String   | ✓    | -          | 毛色の詳細説明        |
| 有効フラグ   | `is_active`   | Boolean  | ✗    | true       | マスタの有効性        |
| 作成日時     | `created_at`  | DateTime | ✗    | now()      | レコード作成日時      |
| 更新日時     | `updated_at`  | DateTime | ✗    | -          | レコード更新日時      |

**制約**:

- 主キー: `id`
- ユニーク制約: `code`, `name`

**リレーション**:

- → cats（1対多）: この毛色の猫
- → pedigrees（1対多）: この毛色の血統記録

### 5. 猫基本情報（cats）

**概要**: 猫の個体情報と基本データを管理する中核テーブル

| フィールド名     | 物理名            | データ型 | NULL | デフォルト | 説明               |
| ---------------- | ----------------- | -------- | ---- | ---------- | ------------------ |
| ID               | `id`              | String   | ✗    | uuid()     | 主キー（UUID）     |
| 登録ID           | `registration_id` | String   | ✗    | -          | 一意の登録番号     |
| 名前             | `name`            | String   | ✗    | -          | 猫の名前           |
| 猫種ID           | `breed_id`        | String   | ✓    | -          | 品種（外部キー）   |
| 毛色ID           | `color_id`        | String   | ✓    | -          | 毛色（外部キー）   |
| 従来猫種         | `legacy_breed`    | String   | ✓    | -          | 旧システム用品種   |
| 従来毛色         | `legacy_color`    | String   | ✓    | -          | 旧システム用毛色   |
| 模様             | `pattern`         | String   | ✓    | -          | 毛色の模様詳細     |
| 性別             | `gender`          | Gender   | ✗    | -          | オス/メス          |
| 生年月日         | `birth_date`      | DateTime | ✗    | -          | 誕生日             |
| 体重             | `weight`          | Float    | ✓    | -          | 体重（kg）         |
| マイクロチップID | `microchip_id`    | String   | ✓    | -          | 個体識別チップ     |
| 有効フラグ       | `is_active`       | Boolean  | ✗    | true       | 猫の管理状態       |
| 備考             | `notes`           | String   | ✓    | -          | その他情報         |
| 画像URL          | `image_url`       | String   | ✓    | -          | 写真へのリンク     |
| 父親ID           | `father_id`       | String   | ✓    | -          | 父親猫（外部キー） |
| 母親ID           | `mother_id`       | String   | ✓    | -          | 母親猫（外部キー） |
| 飼い主ID         | `owner_id`        | String   | ✗    | -          | 所有者（外部キー） |
| 作成日時         | `created_at`      | DateTime | ✗    | now()      | レコード作成日時   |
| 更新日時         | `updated_at`      | DateTime | ✗    | -          | レコード更新日時   |

**制約**:

- 主キー: `id`
- ユニーク制約: `registration_id`, `microchip_id`
- 外部キー: `breed_id` → breeds.id, `color_id` → coat_colors.id
- 外部キー: `father_id` → cats.id, `mother_id` → cats.id
- 外部キー: `owner_id` → users.id

**自己参照リレーション**:

- → father（多対1）: 父親猫
- → mother（多対1）: 母親猫
- → fatherOf（1対多）: 父親として関わる子猫
- → motherOf（1対多）: 母親として関わる子猫

**その他リレーション**:

- → maleBreedingRecords（1対多）: オスとしての交配記録
- → femaleBreedingRecords（1対多）: メスとしての交配記録
- → careRecords（1対多）: ケア履歴
- → schedules（1対多）: スケジュール
- → tags（多対多、cat_tags経由）: タグ
- → pedigrees（1対多）: 血統記録

### 6. 交配記録（breeding_records）

**概要**: 猫の交配・繁殖活動の履歴を管理

| フィールド名 | 物理名              | データ型       | NULL | デフォルト | 説明               |
| ------------ | ------------------- | -------------- | ---- | ---------- | ------------------ |
| ID           | `id`                | String         | ✗    | uuid()     | 主キー（UUID）     |
| オス猫ID     | `male_id`           | String         | ✗    | -          | 父親猫（外部キー） |
| メス猫ID     | `female_id`         | String         | ✗    | -          | 母親猫（外部キー） |
| 交配日       | `breeding_date`     | DateTime       | ✗    | -          | 実際の交配日       |
| 予定出産日   | `expected_due_date` | DateTime       | ✓    | -          | 計算上の出産予定日 |
| 実際出産日   | `actual_due_date`   | DateTime       | ✓    | -          | 実際の出産日       |
| 子猫数       | `number_of_kittens` | Int            | ✓    | -          | 生まれた子猫の数   |
| 備考         | `notes`             | String         | ✓    | -          | 交配に関する詳細   |
| ステータス   | `status`            | BreedingStatus | ✗    | PLANNED    | 交配の進行状況     |
| 記録者ID     | `recorded_by`       | String         | ✗    | -          | 記録したユーザー   |
| 作成日時     | `created_at`        | DateTime       | ✗    | now()      | レコード作成日時   |
| 更新日時     | `updated_at`        | DateTime       | ✗    | -          | レコード更新日時   |

**制約**:

- 主キー: `id`
- 外部キー: `male_id` → cats.id, `female_id` → cats.id
- 外部キー: `recorded_by` → users.id

### 7. ケア記録（care_records）

**概要**: 猫の医療・ケア活動の履歴を管理

| フィールド名 | 物理名          | データ型 | NULL | デフォルト | 説明               |
| ------------ | --------------- | -------- | ---- | ---------- | ------------------ |
| ID           | `id`            | String   | ✗    | uuid()     | 主キー（UUID）     |
| 猫ID         | `cat_id`        | String   | ✗    | -          | 対象猫（外部キー） |
| ケア種別     | `care_type`     | CareType | ✗    | -          | ケアの分類         |
| 詳細         | `description`   | String   | ✗    | -          | ケア内容の説明     |
| ケア日       | `care_date`     | DateTime | ✗    | -          | 実施日             |
| 次回予定日   | `next_due_date` | DateTime | ✓    | -          | 次回の予定日       |
| 費用         | `cost`          | Float    | ✓    | -          | かかった費用       |
| 獣医師       | `veterinarian`  | String   | ✓    | -          | 担当獣医師名       |
| 備考         | `notes`         | String   | ✓    | -          | その他詳細         |
| 記録者ID     | `recorded_by`   | String   | ✗    | -          | 記録したユーザー   |
| 作成日時     | `created_at`    | DateTime | ✗    | now()      | レコード作成日時   |
| 更新日時     | `updated_at`    | DateTime | ✗    | -          | レコード更新日時   |

**制約**:

- 主キー: `id`
- 外部キー: `cat_id` → cats.id, `recorded_by` → users.id

### 8. スケジュール（schedules）

**概要**: ケアや交配などの予定・タスクを管理

| フィールド名     | 物理名          | データ型       | NULL | デフォルト | 説明               |
| ---------------- | --------------- | -------------- | ---- | ---------- | ------------------ |
| ID               | `id`            | String         | ✗    | uuid()     | 主キー（UUID）     |
| タイトル         | `title`         | String         | ✗    | -          | スケジュール名     |
| 詳細             | `description`   | String         | ✓    | -          | 詳細説明           |
| 予定日時         | `schedule_date` | DateTime       | ✗    | -          | 実行予定日時       |
| スケジュール種別 | `schedule_type` | ScheduleType   | ✗    | -          | 予定の分類         |
| ステータス       | `status`        | ScheduleStatus | ✗    | PENDING    | 進行状況           |
| 優先度           | `priority`      | Priority       | ✗    | MEDIUM     | 重要度レベル       |
| 猫ID             | `cat_id`        | String         | ✓    | -          | 対象猫（外部キー） |
| 担当者ID         | `assigned_to`   | String         | ✗    | -          | 担当ユーザー       |
| 作成日時         | `created_at`    | DateTime       | ✗    | now()      | レコード作成日時   |
| 更新日時         | `updated_at`    | DateTime       | ✗    | -          | レコード更新日時   |

**制約**:

- 主キー: `id`
- 外部キー: `cat_id` → cats.id, `assigned_to` → users.id

### 9. タグカテゴリ（tag_categories）

**概要**: タグをカテゴリ単位で整理し、対象スコープや表示順を管理

| フィールド名     | 物理名           | データ型 | NULL | デフォルト | 説明                     |
| ---------------- | ---------------- | -------- | ---- | ---------- | ------------------------ |
| ID               | `id`             | String   | ✗    | uuid()     | 主キー（UUID）           |
| キー             | `key`            | String   | ✗    | -          | 一意なカテゴリキー       |
| 名称             | `name`           | String   | ✗    | -          | カテゴリ名               |
| 説明             | `description`    | String   | ✓    | -          | カテゴリ説明             |
| 色               | `color`          | String   | ✓    | #3B82F6    | UI表示用カラー           |
| 表示順           | `display_order`  | Int      | ✗    | 0          | 並び替え用インデックス   |
| スコープ         | `scopes`         | String[] | ✗    | []         | 利用可能なページスコープ |
| 有効フラグ       | `is_active`      | Boolean  | ✗    | true       | 利用可否                 |
| 作成日時         | `created_at`     | DateTime | ✗    | now()      | レコード作成日時         |
| 更新日時         | `updated_at`     | DateTime | ✗    | -          | レコード更新日時         |

**制約**:

- 主キー: `id`
- ユニーク制約: `key`

### 10. タグマスタ（tags）

**概要**: カテゴリ配下の個別タグを定義し、手動/自動付与可否や表示順を制御

| フィールド名           | 物理名              | データ型 | NULL | デフォルト | 説明                       |
| ---------------------- | ------------------- | -------- | ---- | ---------- | -------------------------- |
| ID                     | `id`                | String   | ✗    | uuid()     | 主キー（UUID）             |
| カテゴリID             | `category_id`       | String   | ✗    | -          | 所属カテゴリ（外部キー）   |
| タグ名                 | `name`              | String   | ✗    | -          | タグの名称                 |
| 表示色                 | `color`             | String   | ✗    | #3B82F6    | UI表示用カラー             |
| 説明                   | `description`       | String   | ✓    | -          | タグの用途説明             |
| 表示順                 | `display_order`     | Int      | ✗    | 0          | 並び順                     |
| 手動付与可否           | `allows_manual`     | Boolean  | ✗    | true       | 手動操作で利用可能か       |
| 自動付与可否           | `allows_automation` | Boolean  | ✗    | true       | 自動ルールで利用可能か     |
| メタデータ             | `metadata`          | Json     | ✓    | -          | 任意の付随情報             |
| 有効フラグ             | `is_active`         | Boolean  | ✗    | true       | 利用可否                   |
| 作成日時               | `created_at`        | DateTime | ✗    | now()      | レコード作成日時           |
| 更新日時               | `updated_at`        | DateTime | ✗    | -          | レコード更新日時           |

**制約**:

- 主キー: `id`
- 複合ユニーク制約: (`category_id`, `name`)
- 外部キー: `category_id` → tag_categories.id（CASCADE）

### 11. タグ自動化ルール（tag_automation_rules）

**概要**: イベントやスケジュールをトリガーにタグを自動付与/剥奪するルール

| フィールド名     | 物理名        | データ型                 | NULL | デフォルト | 説明                                 |
| ---------------- | ------------- | ------------------------ | ---- | ---------- | ------------------------------------ |
| ID               | `id`          | String                   | ✗    | uuid()     | 主キー（UUID）                     |
| キー             | `key`         | String                   | ✗    | -          | ルール識別子（ユニーク）           |
| 名称             | `name`        | String                   | ✗    | -          | ルール名                             |
| 説明             | `description` | String                   | ✓    | -          | ルールの説明                         |
| トリガ種別       | `trigger_type`| TagAutomationTriggerType | ✗    | -          | EVENT / SCHEDULE / MANUAL           |
| イベント種別     | `event_type`  | TagAutomationEventType   | ✗    | -          | 具体的なトリガイベント               |
| スコープ         | `scope`       | String                   | ✓    | -          | 適用対象スコープ                     |
| 有効フラグ       | `is_active`   | Boolean                  | ✗    | true       | ルールが有効か                       |
| 優先度           | `priority`    | Int                      | ✗    | 0          | ルール適用優先度                     |
| コンフィグ       | `config`      | Json                     | ✓    | -          | 追加設定（JSON）                     |
| 作成日時         | `created_at`  | DateTime                 | ✗    | now()      | 作成日時                             |
| 更新日時         | `updated_at`  | DateTime                 | ✗    | -          | 更新日時                             |

**制約**:

- 主キー: `id`
- ユニーク制約: `key`

### 12. タグ自動化実行（tag_automation_runs）

**概要**: 自動化ルールの実行履歴と処理結果を保存

| フィールド名       | 物理名          | データ型               | NULL | デフォルト | 説明                     |
| ------------------ | --------------- | ---------------------- | ---- | ---------- | ------------------------ |
| ID                 | `id`            | String                 | ✗    | uuid()     | 主キー（UUID）           |
| ルールID           | `rule_id`       | String                 | ✗    | -          | 関連ルール（外部キー）   |
| イベントペイロード | `event_payload` | Json                   | ✓    | -          | 実行時の入力データ       |
| ステータス         | `status`        | TagAutomationRunStatus | ✗    | PENDING    | 実行状態                 |
| 開始時刻           | `started_at`    | DateTime               | ✓    | -          | 開始時間                 |
| 完了時刻           | `completed_at`  | DateTime               | ✓    | -          | 完了時間                 |
| エラーメッセージ   | `error_message` | String                 | ✓    | -          | 失敗時メッセージ         |
| 作成日時           | `created_at`    | DateTime               | ✗    | now()      | レコード作成日時         |
| 更新日時           | `updated_at`    | DateTime               | ✗    | -          | レコード更新日時         |

**制約**:

- 主キー: `id`
- 外部キー: `rule_id` → tag_automation_rules.id（CASCADE）
- インデックス: `rule_id`

### 13. タグ付与履歴（tag_assignment_history）

**概要**: 手動/自動を問わずタグ付与・剥奪操作の履歴を保管

| フィールド名 | 物理名              | データ型             | NULL | デフォルト | 説明                           |
| ------------ | ------------------- | -------------------- | ---- | ---------- | ------------------------------ |
| ID           | `id`                | String               | ✗    | uuid()     | 主キー（UUID）                 |
| 猫ID         | `cat_id`            | String               | ✗    | -          | 対象猫（外部キー）             |
| タグID       | `tag_id`            | String               | ✗    | -          | 対象タグ（外部キー）           |
| ルールID     | `rule_id`           | String               | ✓    | -          | 自動化ルール（任意）           |
| 実行ID       | `automation_run_id` | String               | ✓    | -          | 自動化実行履歴（任意）         |
| アクション   | `action`            | TagAssignmentAction  | ✗    | ASSIGNED   | ASSIGNED / UNASSIGNED         |
| ソース       | `source`            | TagAssignmentSource  | ✗    | MANUAL     | MANUAL / AUTOMATION / SYSTEM |
| 理由         | `reason`            | String               | ✓    | -          | 操作理由                       |
| メタデータ   | `metadata`          | Json                 | ✓    | -          | 追加情報                       |
| 作成日時     | `created_at`        | DateTime             | ✗    | now()      | レコード作成日時               |

**制約**:

- 主キー: `id`
- 外部キー: `cat_id` → cats.id（CASCADE）
- 外部キー: `tag_id` → tags.id（CASCADE）
- 外部キー: `rule_id` → tag_automation_rules.id（SET NULL）
- 外部キー: `automation_run_id` → tag_automation_runs.id（SET NULL）
- インデックス: `cat_id`, `tag_id`, `rule_id`, `automation_run_id`
### 14. 血統情報（pedigrees）

**概要**: 血統書データと家系図情報を管理する複雑なテーブル

| フィールド名 | 物理名                | データ型 | NULL | デフォルト | 説明                   |
| ------------ | --------------------- | -------- | ---- | ---------- | ---------------------- |
| ID           | `id`                  | String   | ✗    | uuid()     | 主キー（UUID）         |
| 血統書ID     | `pedigree_id`         | String   | ✗    | -          | 血統書の識別番号       |
| 猫ID         | `cat_id`              | String   | ✓    | -          | 対象猫（外部キー）     |
| タイトル     | `title`               | String   | ✓    | -          | 称号・タイトル         |
| 猫名         | `cat_name`            | String   | ✗    | -          | 血統書記載名           |
| 猫名2        | `cat_name2`           | String   | ✓    | -          | 別名・通称             |
| 猫種ID       | `breed_id`            | String   | ✓    | -          | 品種（外部キー）       |
| 猫種コード   | `breed_code`          | Int      | ✓    | -          | 品種の数値コード       |
| 性別         | `gender`              | Int      | ✓    | -          | 性別（1=オス、2=メス） |
| 目色         | `eye_color`           | String   | ✓    | -          | 目の色                 |
| 毛色ID       | `color_id`            | String   | ✓    | -          | 毛色（外部キー）       |
| 毛色コード   | `coat_color_code`     | Int      | ✓    | -          | 毛色の数値コード       |
| 生年月日     | `birth_date`          | DateTime | ✓    | -          | 誕生日                 |
| 登録日       | `registration_date`   | DateTime | ✓    | -          | 血統書登録日           |
| 発行日       | `pedigree_issue_date` | DateTime | ✓    | -          | 血統書発行日           |
| 繁殖者名     | `breeder_name`        | String   | ✓    | -          | ブリーダー名           |
| 所有者名     | `owner_name`          | String   | ✓    | -          | 所有者名               |
| 兄弟数       | `brother_count`       | Int      | ✓    | -          | 兄弟の数               |
| 姉妹数       | `sister_count`        | Int      | ✓    | -          | 姉妹の数               |
| 備考         | `notes`               | String   | ✓    | -          | 摘要                   |
| 備考2        | `notes2`              | String   | ✓    | -          | 摘要2                  |
| 他団体番号   | `other_no`            | String   | ✓    | -          | 他の登録団体番号       |
| 旧コード     | `old_code`            | String   | ✓    | -          | 旧システムコード       |
| 作成日時     | `created_at`          | DateTime | ✗    | now()      | レコード作成日時       |
| 更新日時     | `updated_at`          | DateTime | ✗    | -          | レコード更新日時       |

**血統関係フィールド**:

| フィールド名 | 物理名                    | データ型 | NULL | 説明           |
| ------------ | ------------------------- | -------- | ---- | -------------- |
| 父血統ID     | `father_pedigree_id`      | String   | ✓    | 父親の血統記録 |
| 母血統ID     | `mother_pedigree_id`      | String   | ✓    | 母親の血統記録 |
| 父方祖父ID   | `paternal_grandfather_id` | String   | ✓    | 父方の祖父     |
| 父方祖母ID   | `paternal_grandmother_id` | String   | ✓    | 父方の祖母     |
| 母方祖父ID   | `maternal_grandfather_id` | String   | ✓    | 母方の祖父     |
| 母方祖母ID   | `maternal_grandmother_id` | String   | ✓    | 母方の祖母     |

**制約**:

- 主キー: `id`
- ユニーク制約: `pedigree_id`
- 外部キー: `cat_id` → cats.id
- 外部キー: `breed_id` → breeds.id, `color_id` → coat_colors.id
- 自己参照外部キー: 各血統関係フィールド → pedigrees.id

**自己参照リレーション**:

- → fatherPedigree（多対1）: 父親血統
- → motherPedigree（多対1）: 母親血統
- → paternalGrandfather（多対1）: 父方祖父
- → paternalGrandmother（多対1）: 父方祖母
- → maternalGrandfather（多対1）: 母方祖父
- → maternalGrandmother（多対1）: 母方祖母
- → fatherOf（1対多）: 父親としての子孫


### 15. 猫タグ関連（cat_tags）

**概要**: 猫とタグの多対多関係を管理する中間テーブル

| フィールド名 | 物理名       | データ型 | NULL | デフォルト | 説明                 |
| ------------ | ------------ | -------- | ---- | ---------- | -------------------- |
| 猫ID         | `cat_id`     | String   | ✗    | -          | 対象猫（外部キー）   |
| タグID       | `tag_id`     | String   | ✗    | -          | 対象タグ（外部キー） |
| 作成日時     | `created_at` | DateTime | ✗    | now()      | 関連作成日時         |

**制約**:

- 複合主キー: `(cat_id, tag_id)`
- 外部キー: `cat_id` → cats.id（CASCADE削除）
- 外部キー: `tag_id` → tags.id（CASCADE削除）

---

## 🔗 リレーション設計詳細

### 主要リレーション図

```
users (1) ──────────→ (∞) cats
  │                      │
  │                      ├── (∞) breeding_records
  │                      ├── (∞) care_records
  │                      ├── (∞) schedules
  │                      ├── (∞) pedigrees
  │                      └── (∞) cat_tags (∞) ──→ (1) tags
  │
  ├── (∞) breeding_records
  ├── (∞) care_records
  ├── (∞) schedules
  └── (∞) login_attempts

breeds (1) ──────────→ (∞) cats
          └──────────→ (∞) pedigrees

coat_colors (1) ─────→ (∞) cats
               └─────→ (∞) pedigrees

cats (1) ────────────→ (∞) cats (自己参照: 親子関係)

pedigrees (1) ───────→ (∞) pedigrees (自己参照: 血統関係)
```

### 1. ユーザー中心のリレーション

**users → cats（1対多）**

- 関係: 一人のユーザーが複数の猫を所有
- 外部キー: cats.owner_id → users.id
- 削除制約: RESTRICT（ユーザー削除時は猫の所有権移転が必要）

**users → breeding_records（1対多）**

- 関係: 一人のユーザーが複数の交配記録を作成
- 外部キー: breeding_records.recorded_by → users.id
- 削除制約: RESTRICT（記録の整合性保持）

**users → care_records（1対多）**

- 関係: 一人のユーザーが複数のケア記録を作成
- 外部キー: care_records.recorded_by → users.id
- 削除制約: RESTRICT（記録の整合性保持）

**users → schedules（1対多）**

- 関係: 一人のユーザーが複数のスケジュールを担当
- 外部キー: schedules.assigned_to → users.id
- 削除制約: RESTRICT（スケジュールの再割り当てが必要）

**users → login_attempts（1対多）**

- 関係: 一人のユーザーが複数のログイン試行履歴を持つ
- 外部キー: login_attempts.user_id → users.id
- 削除制約: CASCADE（ユーザー削除時に履歴も削除）

### 2. 猫中心のリレーション

**cats → cats（自己参照、親子関係）**

- father関係: cats.father_id → cats.id（多対1）
- mother関係: cats.mother_id → cats.id（多対1）
- fatherOf関係: 1対多（逆方向）
- motherOf関係: 1対多（逆方向）
- 削除制約: SET NULL（親が削除されても子は残る）

**breeds → cats（1対多）**

- 関係: 一つの品種に複数の猫が属する
- 外部キー: cats.breed_id → breeds.id
- 削除制約: SET NULL（品種削除時はNULLに設定）

**coat_colors → cats（1対多）**

- 関係: 一つの毛色に複数の猫が属する
- 外部キー: cats.color_id → coat_colors.id
- 削除制約: SET NULL（毛色削除時はNULLに設定）

**cats → breeding_records（1対多、双方向）**

- male関係: breeding_records.male_id → cats.id
- female関係: breeding_records.female_id → cats.id
- 削除制約: RESTRICT（交配記録がある猫は削除不可）

**cats → care_records（1対多）**

- 関係: 一匹の猫が複数のケア記録を持つ
- 外部キー: care_records.cat_id → cats.id
- 削除制約: CASCADE（猫削除時にケア記録も削除）

**cats → schedules（1対多）**

- 関係: 一匹の猫が複数のスケジュールを持つ
- 外部キー: schedules.cat_id → cats.id
- 削除制約: SET NULL（猫削除時はスケジュールは汎用に変更）

**cats → pedigrees（1対多）**

- 関係: 一匹の猫が複数の血統記録を持つ（稀）
- 外部キー: pedigrees.cat_id → cats.id
- 削除制約: SET NULL（猫削除時も血統記録は保持）

### 3. 血統関係のリレーション

**pedigrees → pedigrees（自己参照、血統関係）**

**直系血統関係**:

- fatherPedigree: pedigrees.father_pedigree_id → pedigrees.id
- motherPedigree: pedigrees.mother_pedigree_id → pedigrees.id
- fatherOf: 1対多（逆方向）
- motherOf: 1対多（逆方向）

**祖父母関係**:

- paternalGrandfather: pedigrees.paternal_grandfather_id → pedigrees.id
- paternalGrandmother: pedigrees.paternal_grandmother_id → pedigrees.id
- maternalGrandfather: pedigrees.maternal_grandfather_id → pedigrees.id
- maternalGrandmother: pedigrees.maternal_grandmother_id → pedigrees.id
- 各祖父母からの逆方向1対多関係

**削除制約**: SET NULL（血統記録削除時も関係性は保持）

**breeds → pedigrees（1対多）**

- 関係: 一つの品種に複数の血統記録
- 外部キー: pedigrees.breed_id → breeds.id
- 削除制約: SET NULL

**coat_colors → pedigrees（1対多）**

- 関係: 一つの毛色に複数の血統記録
- 外部キー: pedigrees.color_id → coat_colors.id
- 削除制約: SET NULL

### 4. タグ関係のリレーション

**cats ↔ tags（多対多、cat_tags経由）**

- 中間テーブル: cat_tags
- 関係1: cat_tags.cat_id → cats.id
- 関係2: cat_tags.tag_id → tags.id
- 削除制約: CASCADE（猫またはタグ削除時に関連も削除）

---

## 📋 列挙型（Enum）定義

### 1. UserRole（ユーザーロール）

```
USER         - 一般ユーザー
ADMIN        - 管理者
SUPER_ADMIN  - スーパー管理者
```

### 2. Gender（性別）

```
MALE    - オス
FEMALE  - メス
```

### 3. BreedingStatus（交配ステータス）

```
PLANNED      - 計画中
IN_PROGRESS  - 進行中
COMPLETED    - 完了
FAILED       - 失敗
```

### 4. CareType（ケア種別）

```
VACCINATION   - 予防接種
HEALTH_CHECK  - 健康診断
GROOMING      - グルーミング
DENTAL_CARE   - 歯科ケア
MEDICATION    - 投薬
SURGERY       - 手術
OTHER         - その他
```

### 5. ScheduleType（スケジュール種別）

```
BREEDING     - 繁殖関連
CARE         - ケア関連
APPOINTMENT  - 診察予約
REMINDER     - リマインダー
MAINTENANCE  - メンテナンス
```

### 6. ScheduleStatus（スケジュールステータス）

```
PENDING      - 未実行
IN_PROGRESS  - 実行中
COMPLETED    - 完了
CANCELLED    - キャンセル
```

### 7. Priority（優先度）

```
LOW     - 低
MEDIUM  - 中
HIGH    - 高
URGENT  - 緊急
```

---

## 🔒 制約とインデックス

### 主要制約一覧

**一意制約（UNIQUE）**:

- users.clerk_id
- users.email
- breeds.code, breeds.name
- coat_colors.code, coat_colors.name
- cats.registration_id
- cats.microchip_id
- tags.name
- pedigrees.pedigree_id

**外部キー制約（FOREIGN KEY）**:

- 全リレーションに適用
- 削除時の動作は関係性により設定

**非NULL制約（NOT NULL）**:

- 必須フィールドに適用
- 主キー、必須の業務データ

### 推奨インデックス

**パフォーマンス向上のため以下のインデックスを推奨**:

```sql
-- ユーザー検索用
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 猫検索用
CREATE INDEX idx_cats_owner_id ON cats(owner_id);
CREATE INDEX idx_cats_breed_id ON cats(breed_id);
CREATE INDEX idx_cats_color_id ON cats(color_id);
CREATE INDEX idx_cats_birth_date ON cats(birth_date);
CREATE INDEX idx_cats_gender ON cats(gender);

-- 血統検索用
CREATE INDEX idx_pedigrees_cat_id ON pedigrees(cat_id);
CREATE INDEX idx_pedigrees_father_pedigree_id ON pedigrees(father_pedigree_id);
CREATE INDEX idx_pedigrees_mother_pedigree_id ON pedigrees(mother_pedigree_id);

-- 記録検索用
CREATE INDEX idx_breeding_records_male_id ON breeding_records(male_id);
CREATE INDEX idx_breeding_records_female_id ON breeding_records(female_id);
CREATE INDEX idx_breeding_records_breeding_date ON breeding_records(breeding_date);

CREATE INDEX idx_care_records_cat_id ON care_records(cat_id);
CREATE INDEX idx_care_records_care_date ON care_records(care_date);
CREATE INDEX idx_care_records_care_type ON care_records(care_type);

CREATE INDEX idx_schedules_cat_id ON schedules(cat_id);
CREATE INDEX idx_schedules_assigned_to ON schedules(assigned_to);
CREATE INDEX idx_schedules_schedule_date ON schedules(schedule_date);
CREATE INDEX idx_schedules_status ON schedules(status);
```

---

## 🚀 本番環境デプロイ時のデータベース設定

### 1. 環境変数設定

```bash
# データベース接続
DATABASE_URL="postgresql://username:password@localhost:5432/mycats_production"

# Prisma設定
PRISMA_QUERY_ENGINE_LIBRARY="true"
```

### 2. デプロイ手順

```bash
# 1. 依存関係インストール
pnpm install --frozen-lockfile

# 2. Prismaクライアント生成
pnpm -w run db:generate

# 3. データベースマイグレーション
pnpm -w run db:deploy

# 4. アプリケーションビルド
pnpm run build

# 5. 本番サーバー起動
NODE_ENV=production node backend/dist/main.js
```

### 3. データベース初期化

**本番環境では以下の初期データが必要**:

1. **管理者ユーザー**: システム管理用
2. **基本品種データ**: breeds テーブル
3. **基本毛色データ**: coat_colors テーブル
4. **基本タグ**: tags テーブル

### 4. バックアップ戦略

**推奨バックアップ設定**:

- **定期バックアップ**: 日次自動バックアップ
- **差分バックアップ**: 時間単位の差分保存
- **レプリケーション**: 読み取り専用レプリカの設定
- **ポイントインタイムリカバリ**: WALログの保持

---

## 📈 パフォーマンス考慮事項

### 1. データベース設計上の最適化

**正規化レベル**: 第3正規形まで適用
**非正規化箇所**: パフォーマンス重視箇所での意図的な非正規化
**アーカイブ戦略**: 古いデータの別テーブル移行

### 2. クエリ最適化

**頻繁なクエリパターン**:

- 所有者別猫一覧
- 猫の血統検索
- 期間別ケア記録
- 予定済みスケジュール

**最適化されたクエリ例**:

```sql
-- 所有者の猫一覧（関連データ含む）
SELECT c.*, b.name as breed_name, cc.name as color_name
FROM cats c
LEFT JOIN breeds b ON c.breed_id = b.id
LEFT JOIN coat_colors cc ON c.color_id = cc.id
WHERE c.owner_id = $1 AND c.is_active = true
ORDER BY c.birth_date DESC;

-- 血統3世代検索
WITH RECURSIVE pedigree_tree AS (
  SELECT id, cat_name, father_pedigree_id, mother_pedigree_id, 0 as generation
  FROM pedigrees WHERE id = $1
  UNION ALL
  SELECT p.id, p.cat_name, p.father_pedigree_id, p.mother_pedigree_id, pt.generation + 1
  FROM pedigrees p
  JOIN pedigree_tree pt ON (p.id = pt.father_pedigree_id OR p.id = pt.mother_pedigree_id)
  WHERE pt.generation < 3
)
SELECT * FROM pedigree_tree;
```

---

## 🔍 監視とメンテナンス

### 1. データベース監視項目

**パフォーマンス監視**:

- クエリ実行時間
- インデックス使用率
- テーブルサイズ
- 接続数

**データ整合性監視**:

- 孤立レコードの検出
- 制約違反の確認
- データ品質チェック

### 2. 定期メンテナンス

**日次メンテナンス**:

- 統計情報更新
- ログローテーション
- バックアップ実行

**週次メンテナンス**:

- インデックス再構築
- 断片化解消
- パフォーマンス分析

**月次メンテナンス**:

- データアーカイブ
- 容量分析
- セキュリティ監査

---

## 📚 参考情報

### 関連ドキュメント

- [README.md](../README.md) - プロジェクト概要
- [docs/system-design.md](./system-design.md) - システム設計
- [DATABASE_QUICK_REF.md](../DATABASE_QUICK_REF.md) - クイックリファレンス

### 技術仕様

- **Prisma**: https://www.prisma.io/docs
- **PostgreSQL**: https://www.postgresql.org/docs/
- **NestJS**: https://docs.nestjs.com/

---

_最終更新: 2025年1月_  
_作成者: 猫生体管理システム開発チーム_
