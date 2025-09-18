# 🗄️ 本番環境データベース構成図

## ER図（実体関連図）

```mermaid
erDiagram
    %% ユーザー管理
    users {
        string id PK "UUID"
        string clerk_id UK "外部認証ID"
        string email UK "メールアドレス"
        string first_name "姓"
        string last_name "名"
        enum role "権限レベル"
        boolean is_active "有効フラグ"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    login_attempts {
        string id PK "UUID"
        string user_id FK "ユーザーID"
        string email "試行メール"
        string ip_address "IPアドレス"
        boolean success "成功フラグ"
        datetime created_at "試行日時"
    }

    %% マスタデータ
    breeds {
        string id PK "UUID"
        int code UK "猫種コード"
        string name UK "品種名"
        string description "説明"
        boolean is_active "有効フラグ"
        datetime created_at "作成日時"
    }

    coat_colors {
        string id PK "UUID"
        int code UK "毛色コード"
        string name UK "毛色名"
        string description "説明"
        boolean is_active "有効フラグ"
        datetime created_at "作成日時"
    }

    tags {
        string id PK "UUID"
        string name UK "タグ名"
        string color "表示色"
        string description "説明"
        datetime created_at "作成日時"
    }

    %% 猫管理
    cats {
        string id PK "UUID"
        string registration_id UK "登録ID"
        string name "猫の名前"
        string breed_id FK "品種ID"
        string color_id FK "毛色ID"
        enum gender "性別"
        datetime birth_date "生年月日"
        float weight "体重"
        string microchip_id UK "チップID"
        string father_id FK "父親ID"
        string mother_id FK "母親ID"
        string owner_id FK "飼い主ID"
        boolean is_active "有効フラグ"
        datetime created_at "作成日時"
        datetime updated_at "更新日時"
    }

    cat_tags {
        string cat_id PK,FK "猫ID"
        string tag_id PK,FK "タグID"
        datetime created_at "関連作成日時"
    }

    %% 血統管理
    pedigrees {
        string id PK "UUID"
        string pedigree_id UK "血統書ID"
        string cat_id FK "猫ID"
        string cat_name "血統書記載名"
        string breed_id FK "品種ID"
        string color_id FK "毛色ID"
        enum gender "性別"
        datetime birth_date "生年月日"
        string breeder_name "繁殖者名"
        string owner_name "所有者名"
        string father_pedigree_id FK "父血統ID"
        string mother_pedigree_id FK "母血統ID"
        string paternal_grandfather_id FK "父方祖父ID"
        string paternal_grandmother_id FK "父方祖母ID"
        string maternal_grandfather_id FK "母方祖父ID"
        string maternal_grandmother_id FK "母方祖母ID"
        datetime created_at "作成日時"
    }

    %% 交配・ケア管理
    breeding_records {
        string id PK "UUID"
        string male_id FK "オス猫ID"
        string female_id FK "メス猫ID"
        datetime breeding_date "交配日"
        datetime expected_due_date "予定出産日"
        datetime actual_due_date "実際出産日"
        int number_of_kittens "子猫数"
        enum status "ステータス"
        string recorded_by FK "記録者ID"
        datetime created_at "作成日時"
    }

    care_records {
        string id PK "UUID"
        string cat_id FK "猫ID"
        enum care_type "ケア種別"
        string description "内容説明"
        datetime care_date "ケア実施日"
        datetime next_due_date "次回予定日"
        float cost "費用"
        string veterinarian "獣医師名"
        string recorded_by FK "記録者ID"
        datetime created_at "作成日時"
    }

    schedules {
        string id PK "UUID"
        string title "タイトル"
        datetime schedule_date "予定日時"
        enum schedule_type "スケジュール種別"
        enum status "ステータス"
        enum priority "優先度"
        string cat_id FK "猫ID"
        string assigned_to FK "担当者ID"
        datetime created_at "作成日時"
    }

    %% リレーション定義

    %% ユーザー関連
    users ||--o{ cats : "所有"
    users ||--o{ breeding_records : "記録"
    users ||--o{ care_records : "記録"
    users ||--o{ schedules : "担当"
    users ||--o{ login_attempts : "履歴"

    %% 猫関連
    cats ||--o{ cats : "親子関係"
    cats ||--o{ breeding_records : "オスとして"
    cats ||--o{ breeding_records : "メスとして"
    cats ||--o{ care_records : "ケア対象"
    cats ||--o{ schedules : "スケジュール対象"
    cats ||--o{ pedigrees : "血統記録"
    cats ||--o{ cat_tags : "タグ関連"

    %% マスタ関連
    breeds ||--o{ cats : "品種分類"
    breeds ||--o{ pedigrees : "血統品種"
    coat_colors ||--o{ cats : "毛色分類"
    coat_colors ||--o{ pedigrees : "血統毛色"
    tags ||--o{ cat_tags : "タグ定義"

    %% 血統関連（自己参照）
    pedigrees ||--o{ pedigrees : "父系血統"
    pedigrees ||--o{ pedigrees : "母系血統"
    pedigrees ||--o{ pedigrees : "祖父母血統"
```

## システム構成図

```mermaid
graph TB
    subgraph "アプリケーション層"
        A[Next.js Frontend<br/>Port: 3000]
        B[NestJS Backend<br/>Port: 3004]
    end

    subgraph "データアクセス層"
        C[Prisma ORM<br/>v6.14.0]
    end

    subgraph "データベース層"
        D[PostgreSQL 15+<br/>本番環境]
    end

    subgraph "データベース構成"
        E[ユーザー管理<br/>users, login_attempts]
        F[マスタデータ<br/>breeds, coat_colors, tags]
        G[猫管理<br/>cats, cat_tags]
        H[血統管理<br/>pedigrees]
        I[活動記録<br/>breeding_records, care_records]
        J[スケジュール<br/>schedules]
    end

    A --> B
    B --> C
    C --> D
    D --> E
    D --> F
    D --> G
    D --> H
    D --> I
    D --> J

    style D fill:#e1f5fe
    style C fill:#f3e5f5
    style B fill:#e8f5e8
    style A fill:#fff3e0
```

## データフロー図

```mermaid
flowchart LR
    subgraph "データ入力"
        U[ユーザー登録]
        C[猫登録]
        P[血統書インポート]
        M[マスタデータ]
    end

    subgraph "中核テーブル"
        UT[users]
        CT[cats]
        PT[pedigrees]
        BT[breeds]
        CCT[coat_colors]
    end

    subgraph "活動記録"
        BR[breeding_records]
        CR[care_records]
        SC[schedules]
    end

    subgraph "関連管理"
        TG[tags]
        CTG[cat_tags]
        LA[login_attempts]
    end

    U --> UT
    C --> CT
    P --> PT
    M --> BT
    M --> CCT

    UT --> CT
    UT --> BR
    UT --> CR
    UT --> SC
    UT --> LA

    CT --> BR
    CT --> CR
    CT --> SC
    CT --> PT
    CT --> CTG

    BT --> CT
    BT --> PT
    CCT --> CT
    CCT --> PT

    TG --> CTG

    style UT fill:#ffcdd2
    style CT fill:#c8e6c9
    style PT fill:#fff9c4
```

## テーブル関連強度

| 関係の種類               | 強度 | 説明             | 削除時動作 |
| ------------------------ | ---- | ---------------- | ---------- |
| **強い関連**             | 🔴   | 必須の業務関係   | RESTRICT   |
| users ↔ cats            | 🔴   | 所有関係         | RESTRICT   |
| cats ↔ breeding_records | 🔴   | 交配記録         | RESTRICT   |
| **中程度関連**           | 🟡   | 重要だが独立可能 | SET NULL   |
| cats ↔ cats (親子)      | 🟡   | 親子関係         | SET NULL   |
| cats ↔ pedigrees        | 🟡   | 血統関係         | SET NULL   |
| pedigrees ↔ pedigrees   | 🟡   | 血統系譜         | SET NULL   |
| **弱い関連**             | 🟢   | 付加情報         | CASCADE    |
| users ↔ login_attempts  | 🟢   | ログ情報         | CASCADE    |
| cats ↔ care_records     | 🟢   | ケア履歴         | CASCADE    |
| cats ↔ cat_tags         | 🟢   | タグ関係         | CASCADE    |

## パフォーマンス考慮事項

### 重要なインデックス

```sql
-- 検索頻度が高いフィールド
CREATE INDEX idx_cats_owner_id ON cats(owner_id);
CREATE INDEX idx_cats_breed_id ON cats(breed_id);
CREATE INDEX idx_cats_birth_date ON cats(birth_date);

-- 血統検索用
CREATE INDEX idx_pedigrees_father_pedigree_id ON pedigrees(father_pedigree_id);
CREATE INDEX idx_pedigrees_mother_pedigree_id ON pedigrees(mother_pedigree_id);

-- 記録検索用
CREATE INDEX idx_care_records_cat_id_care_date ON care_records(cat_id, care_date);
CREATE INDEX idx_schedules_assigned_to_schedule_date ON schedules(assigned_to, schedule_date);
```

### クエリ最適化パターン

1. **猫の一覧検索**: owner_id + is_active でのフィルタリング
2. **血統検索**: 再帰クエリによる3世代検索
3. **スケジュール検索**: assigned_to + schedule_date の複合インデックス使用
4. **ケア履歴**: cat_id + care_date の範囲検索

---

_この図は本番環境デプロイ時に生成される実際のデータベース構造を表しています。_  
_詳細な仕様: [DATABASE_PRODUCTION_SCHEMA.md](./DATABASE_PRODUCTION_SCHEMA.md)_
