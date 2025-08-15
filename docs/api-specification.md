# 🔌 API仕様書

## 📋 API概要

**ベースURL**: `http://localhost:3004/api/v1`  
**認証方式**: JWT Bearer Token  
**データ形式**: JSON  
**文字エンコーディング**: UTF-8

### 共通レスポンス仕様（グローバル適用）

- 成功時: `{ success: true, data: <payload>, meta?: <pagination> }`
- 失敗時: `{ success: false, error: { code, message, details? }, timestamp, path }`
- 備考: NestJS の Global Interceptor/Exception Filter により全エンドポイントへ自動適用。
  - TransformResponseInterceptor: 任意の戻り値を `{ success: true, data }` へ統一。`{ data, meta }` 構造は `meta` を保持。
  - GlobalExceptionFilter: 例外を `{ success: false, error: ... }` へ統一。Prisma の代表的なエラー（P2002/2025/2003/2014）をHTTPステータスとコードへマッピング。

## 🔐 認証

### 認証エンドポイント

共通ポリシー:

- emailは受信時に trim + lowercase で正規化します（大文字小文字・前後空白の差異を許容）。
- ユーザー検索は unique 制約に従い findUnique(email) を使用します。
- パスワードは強度検証後に Argon2 でハッシュ化保存します（旧bcryptからはログイン成功時に自動移行）。

#### POST /auth/login

ユーザーログイン

##### リクエスト: POST /auth/login

```json
{ "email": "user@example.com", "password": "password123" }
```

##### レスポンス: POST /auth/login

```json
{
  "success": true,
  "data": {
    "access_token": "<jwt>",
    "refresh_token": "<jwt>",
    "user": { "id": "user-123", "email": "user@example.com", "role": "breeder" }
  }
}
```

#### POST /auth/refresh

トークンリフレッシュ

##### リクエスト: POST /auth/refresh

```json
{ "refresh_token": "<jwt>" }
```

##### レスポンス: POST /auth/refresh

```json
{
  "success": true,
  "data": {
    "access_token": "<jwt>",
    "refresh_token": "<jwt>"
  }
}
```

#### POST /auth/register

ポリシー:

- メールは正規化後に一意制約で重複を検出し、既存の場合 409(CONFLICT) を返します。
- 作成時に内部用の clerkId を自動採番（例: `local_<uuid>`）。

##### リクエスト: POST /auth/register

```json
{ "email": "User@example.com ", "password": "Secret123!" }
```

##### レスポンス: POST /auth/register

```json
{ "success": true, "data": { "id": "user-123", "email": "user@example.com" } }
```

エラー例:

- 409 CONFLICT: 既に登録済みのメール
- 400 BAD_REQUEST: パスワード強度不足

#### POST /auth/request-password-reset

#### POST /auth/set-password

パスワード設定（初回/再設定リンク経由など）

#### POST /auth/change-password

ログイン中ユーザーのパスワード変更

#### POST /auth/logout

リフレッシュトークンの無効化とサインアウト処理

ポリシー: メールの存在有無に関わらず成功レスポンスを返します（利用者推測防止）。

##### リクエスト: POST /auth/request-password-reset

```json
{ "email": "user@example.com" }
```

## 🐱 猫管理API

### GET /cats

猫一覧取得

#### クエリパラメータ: GET /cats

| パラメータ | 型     | 必須 | 説明                            |
| ---------- | ------ | ---- | ------------------------------- |
| page       | number | -    | ページ番号（デフォルト: 1）     |
| limit      | number | -    | 取得件数（デフォルト: 20）      |
| search     | string | -    | 名前での検索                    |
| breed_id   | string | -    | 猫種でのフィルタ                |
| gender     | string | -    | 性別でのフィルタ（male/female） |
| status     | string | -    | ステータスでのフィルタ          |

#### レスポンス: GET /cats

```json
{
  "success": true,
  "data": [
    {
      "id": "cat-123",
      "name": "みけ",
      "birth_date": "2023-06-15",
      "gender": "female",
      "breed": {
        "id": "breed-001",
        "name_ja": "日本猫",
        "name_en": "Japanese Bobtail"
      },
      "coat_color": {
        "id": "color-001",
        "name_ja": "三毛",
        "name_en": "Calico"
      },
      "status": "active",
      "microchip_id": "392123456789012",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "total_pages": 8
  }
}
```

### POST /cats

猫新規登録

#### リクエスト: POST /cats

```json
{
  "name": "たま",
  "birth_date": "2024-03-20",
  "gender": "male",
  "breed_id": "breed-002",
  "coat_color_id": "color-005",
  "microchip_id": "392123456789013",
  "notes": "性格は人懐っこい"
}
```

#### レスポンス: POST /cats

```json
{
  "success": true,
  "data": {
    "id": "cat-124",
    "name": "たま",
    "birth_date": "2024-03-20",
    "gender": "male",
    // ... 他の猫情報
    "created_at": "2024-08-09T10:30:00Z"
  }
}
```

### GET /cats/:id

猫詳細取得

#### レスポンス: GET /cats/:id

```json
{
  "success": true,
  "data": {
    "id": "cat-123",
    "name": "みけ",
    "birth_date": "2023-06-15",
    "gender": "female",
    "breed": {
      /* breed info */
    },
    "coat_color": {
      /* coat color info */
    },
    "pedigree": {
      "id": "ped-123",
      "registration_number": "JCR2023-001234",
      "father": {
        /* father cat info */
      },
      "mother": {
        /* mother cat info */
      }
    },
    "care_schedules": [
      {
        "id": "care-001",
        "care_type": "vaccination",
        "scheduled_date": "2024-09-01",
        "status": "pending"
      }
    ],
    "tags": [
      {
        "id": "tag-001",
        "name": "人懐っこい",
        "category": "personality",
        "color": "#ff6b6b"
      }
    ]
  }
}
```

### PUT /cats/:id

猫情報更新

#### リクエスト: PUT /cats/:id

```json
{
  "name": "みけちゃん",
  "notes": "更新されたメモ",
  "status": "active"
}
```

### DELETE /cats/:id

### GET /cats/statistics

統計情報の取得（実装あり）

### GET /cats/:id/breeding-history

個体の繁殖履歴（実装あり）

### GET /cats/:id/care-history

個体のケア履歴（実装あり）

猫情報削除（論理削除）

## 📜 血統書管理API

### GET /pedigrees

血統書一覧取得

#### クエリパラメータ: GET /pedigrees

| パラメータ | 型     | 必須 | 説明                     |
| ---------- | ------ | ---- | ------------------------ |
| page       | number | -    | ページ番号               |
| limit      | number | -    | 取得件数                 |
| search     | string | -    | 血統書番号・猫名での検索 |
| generation | number | -    | 世代での絞り込み         |

#### レスポンス: GET /pedigrees

```json
{
  "success": true,
  "data": [
    {
      "id": "ped-123",
      "cat": {
        "id": "cat-123",
        "name": "みけ"
      },
      "registration_number": "JCR2023-001234",
      "father": {
        "id": "cat-100",
        "name": "父猫太郎",
        "registration_number": "JCR2021-005678"
      },
      "mother": {
        "id": "cat-101",
        "name": "母猫花子",
        "registration_number": "JCR2022-001111"
      },
      "generation": 3,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    /* pagination info */
  }
}
```

### POST /pedigrees

血統書新規登録

#### リクエスト: POST /pedigrees

```json
{
  "cat_id": "cat-123",
  "registration_number": "JCR2024-002345",
  "father_id": "cat-100",
  "mother_id": "cat-101",
  "breeder_name": "山田ブリーダー",
  "registration_date": "2024-08-01"
}
```

### GET /pedigrees/:id/family-tree

家系図取得（指定世代まで）

#### クエリパラメータ: GET /pedigrees/:id/family-tree

| パラメータ  | 型     | 必須 | 説明                        |
| ----------- | ------ | ---- | --------------------------- |
| generations | number | -    | 取得世代数（デフォルト: 3） |

#### レスポンス: GET /pedigrees/:id/family-tree

### GET /pedigrees/pedigree-id/:pedigreeId

血統書番号から検索（実装あり）

### GET /pedigrees/:id/family

直系の親情報ツリー（実装あり）

### GET /pedigrees/:id/descendants

子孫一覧（実装あり）

```json
{
  "success": true,
  "data": {
    "root": {
      "id": "cat-123",
      "name": "みけ",
      "generation": 0
    },
    "ancestors": [
      {
        "id": "cat-100",
        "name": "父猫太郎",
        "generation": 1,
        "relationship": "father",
        "parent_id": "cat-123"
      },
      {
        "id": "cat-101",
        "name": "母猫花子",
        "generation": 1,
        "relationship": "mother",
        "parent_id": "cat-123"
      }
      // ... 祖父母世代以降
    ]
  }
}
```

## 💕 繁殖管理API

### GET /breeding

繁殖記録一覧取得

#### レスポンス: GET /breeding

```json
{
  "success": true,
  "data": [
    {
      "id": "breed-001",
      "mother": {
        "id": "cat-101",
        "name": "母猫花子"
      },
      "father": {
        "id": "cat-100",
        "name": "父猫太郎"
      },
      "mating_date": "2024-06-01",
      "expected_birth_date": "2024-08-01",
      "actual_birth_date": "2024-08-03",
      "kitten_count": 4,
      "status": "completed",
      "notes": "順調な出産でした"
    }
  ],
  "meta": {
    /* pagination info */
  }
}
```

### POST /breeding

繁殖記録新規登録

#### リクエスト: POST /breeding

```json
{
  "mother_id": "cat-101",
  "father_id": "cat-100",
  "mating_date": "2024-06-01",
  "expected_birth_date": "2024-08-01",
  "notes": "初回交配"
}
```

## 🏥 ケア管理API

### GET /care/schedules

ケアスケジュール一覧取得

#### クエリパラメータ: GET /care/schedules

| パラメータ | 型     | 必須 | 説明                   |
| ---------- | ------ | ---- | ---------------------- |
| cat_id     | string | -    | 特定の猫のスケジュール |
| care_type  | string | -    | ケア種別でのフィルタ   |
| status     | string | -    | ステータスでのフィルタ |
| date_from  | string | -    | 開始日（YYYY-MM-DD）   |
| date_to    | string | -    | 終了日（YYYY-MM-DD）   |

#### レスポンス: GET /care/schedules

```json
{
  "success": true,
  "data": [
    {
      "id": "care-001",
      "cat": {
        "id": "cat-123",
        "name": "みけ"
      },
      "care_type": "vaccination",
      "care_name": "3種混合ワクチン",
      "scheduled_date": "2024-09-01",
      "completed_date": null,
      "status": "pending",
      "notes": "年1回の定期接種",
      "reminder_sent": false
    }
  ],
  "meta": {
    /* pagination info */
  }
}
```

### POST /care/schedules

ケアスケジュール新規登録

#### リクエスト: POST /care/schedules

```json
{
  "cat_id": "cat-123",
  "care_type": "vaccination",
  "care_name": "3種混合ワクチン",
  "scheduled_date": "2024-09-01",
  "notes": "年1回の定期接種"
}
```

### PATCH/PUT /care/schedules/:id/complete（実装あり）

ケア完了マーク（PATCH/PUTどちらでも可）

#### リクエスト: PUT /care/schedules/:id/complete

```json
{
  "completed_date": "2024-08-09",
  "notes": "問題なく完了",
  "next_scheduled_date": "2025-08-09"
}
```

## 🏷️ タグ・マスタデータAPI

### GET /tags

### POST /tags（実装あり）

タグの作成（認証必須）

### DELETE /tags/:id（実装あり）

タグの削除（認証必須）

タグ一覧取得

#### レスポンス: GET /tags

```json
{
  "success": true,
  "data": [
    {
      "id": "tag-001",
      "name": "人懐っこい",
      "category": "personality",
      "color": "#ff6b6b",
      "description": "人に良く懐く性格",
      "usage_count": 23
    }
  ]
}
```

### GET /breeds

### POST /breeds（実装あり・管理者のみ）

### PATCH /breeds/:id（実装あり・管理者のみ）

### DELETE /breeds/:id（実装あり・管理者のみ）

猫種マスタ取得

#### レスポンス: GET /breeds

```json
{
  "success": true,
  "data": [
    {
      "id": "breed-001",
      "name_ja": "日本猫",
      "name_en": "Japanese Bobtail",
      "category": "shorthair",
      "description": "日本古来の猫種"
    }
  ]
}
```

### GET /coat-colors

### POST /coat-colors（実装あり・管理者のみ）

### PATCH /coat-colors/:id（実装あり・管理者のみ）

### DELETE /coat-colors/:id（実装あり・管理者のみ）

毛色マスタ取得

#### レスポンス: GET /coat-colors

```json
{
  "success": true,
  "data": [
    {
      "id": "color-001",
      "name_ja": "三毛",
      "name_en": "Calico",
      "color_code": "#F5DEB3",
      "pattern": "tricolor"
    }
  ]
}
```

## ⚠️ エラーレスポンス

### エラー形式

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "入力データに不正があります",
    "details": [
      {
        "field": "name",
        "message": "名前は必須です"
      }
    ]
  }
}
```

### エラーコード一覧

| コード               | HTTP Status | 説明                   |
| -------------------- | ----------- | ---------------------- |
| VALIDATION_ERROR     | 400         | 入力値検証エラー       |
| AUTHENTICATION_ERROR | 401         | 認証エラー             |
| AUTHORIZATION_ERROR  | 403         | 認可エラー             |
| NOT_FOUND            | 404         | リソースが見つからない |
| CONFLICT             | 409         | データ競合エラー       |
| INTERNAL_ERROR       | 500         | サーバー内部エラー     |

## 📊 レート制限

- 現行実装: 全エンドポイント共通で 1分間に100リクエスト（ThrottlerModuleのグローバル設定）。
- 将来対応: 認証・アップロードに対する個別制限は未実装（仕様上の目標値: 認証10/分、アップロード5/分）。

## 🔄 バージョニング

- **現在**: v1
- **非互換変更**: 新バージョンでサポート
- **後方互換**: 最低6ヶ月のサポート保証

---

**API バージョン**: 1.0  
**最終更新日**: 2025年8月15日（実装差分反映、全体図リンク追加）  
**Swagger UI**: [http://localhost:3004/api/docs](http://localhost:3004/api/docs)
