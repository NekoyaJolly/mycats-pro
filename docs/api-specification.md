# 🔌 API仕様書

## 📋 API概要

**ベースURL**: `http://localhost:3004/api/v1`  
**認証方式**: JWT Bearer Token  
**データ形式**: JSON  
**文字エンコーディング**: UTF-8

## 🔐 認証

### JWT認証フロー

すべてのAPI（認証エンドポイント除く）はAuthorizationヘッダーにJWTトークンが必要です。

```http
Authorization: Bearer <JWT_TOKEN>
```

### 認証エンドポイント

#### POST /auth/login
ユーザーログイン

**リクエスト**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "田中太郎",
      "role": "breeder"
    }
  }
}
```

#### POST /auth/refresh
トークンリフレッシュ

**リクエスト**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🐱 猫管理API

### GET /cats
猫一覧取得

**クエリパラメータ**
| パラメータ | 型 | 必須 | 説明 |
|------------|----|----|------|
| page | number | - | ページ番号（デフォルト: 1） |
| limit | number | - | 取得件数（デフォルト: 20） |
| search | string | - | 名前での検索 |
| breed_id | string | - | 猫種でのフィルタ |
| gender | string | - | 性別でのフィルタ（male/female） |
| status | string | - | ステータスでのフィルタ |

**レスポンス**
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

**リクエスト**
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

**レスポンス**
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

**レスポンス**
```json
{
  "success": true,
  "data": {
    "id": "cat-123",
    "name": "みけ",
    "birth_date": "2023-06-15",
    "gender": "female",
    "breed": { /* breed info */ },
    "coat_color": { /* coat color info */ },
    "pedigree": {
      "id": "ped-123",
      "registration_number": "JCR2023-001234",
      "father": { /* father cat info */ },
      "mother": { /* mother cat info */ }
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

**リクエスト**
```json
{
  "name": "みけちゃん",
  "notes": "更新されたメモ",
  "status": "active"
}
```

### DELETE /cats/:id
猫情報削除（論理削除）

## 📜 血統書管理API

### GET /pedigrees
血統書一覧取得

**クエリパラメータ**
| パラメータ | 型 | 必須 | 説明 |
|------------|----|----|------|
| page | number | - | ページ番号 |
| limit | number | - | 取得件数 |
| search | string | - | 血統書番号・猫名での検索 |
| generation | number | - | 世代での絞り込み |

**レスポンス**
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
  "meta": { /* pagination info */ }
}
```

### POST /pedigrees
血統書新規登録

**リクエスト**
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

**クエリパラメータ**
| パラメータ | 型 | 必須 | 説明 |
|------------|----|----|------|
| generations | number | - | 取得世代数（デフォルト: 3） |

**レスポンス**
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

**レスポンス**
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
  "meta": { /* pagination info */ }
}
```

### POST /breeding
繁殖記録新規登録

**リクエスト**
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

**クエリパラメータ**
| パラメータ | 型 | 必須 | 説明 |
|------------|----|----|------|
| cat_id | string | - | 特定の猫のスケジュール |
| care_type | string | - | ケア種別でのフィルタ |
| status | string | - | ステータスでのフィルタ |
| date_from | string | - | 開始日（YYYY-MM-DD） |
| date_to | string | - | 終了日（YYYY-MM-DD） |

**レスポンス**
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
  "meta": { /* pagination info */ }
}
```

### POST /care/schedules
ケアスケジュール新規登録

**リクエスト**
```json
{
  "cat_id": "cat-123",
  "care_type": "vaccination",
  "care_name": "3種混合ワクチン",
  "scheduled_date": "2024-09-01",
  "notes": "年1回の定期接種"
}
```

### PUT /care/schedules/:id/complete
ケア完了マーク

**リクエスト**
```json
{
  "completed_date": "2024-08-09",
  "notes": "問題なく完了",
  "next_scheduled_date": "2025-08-09"
}
```

## 🏷️ タグ・マスタデータAPI

### GET /tags
タグ一覧取得

**レスポンス**
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
猫種マスタ取得

**レスポンス**
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
毛色マスタ取得

**レスポンス**
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

| コード | HTTP Status | 説明 |
|--------|-------------|------|
| VALIDATION_ERROR | 400 | 入力値検証エラー |
| AUTHENTICATION_ERROR | 401 | 認証エラー |
| AUTHORIZATION_ERROR | 403 | 認可エラー |
| NOT_FOUND | 404 | リソースが見つからない |
| CONFLICT | 409 | データ競合エラー |
| INTERNAL_ERROR | 500 | サーバー内部エラー |

## 📊 レート制限

- **一般API**: 1分間に100リクエスト
- **認証API**: 1分間に10リクエスト
- **ファイルアップロード**: 1分間に5リクエスト

## 🔄 バージョニング

- **現在**: v1
- **非互換変更**: 新バージョンでサポート
- **後方互換**: 最低6ヶ月のサポート保証

---

**API バージョン**: 1.0  
**最終更新日**: 2025年8月9日  
**Swagger UI**: [http://localhost:3004/api/docs](http://localhost:3004/api/docs)
