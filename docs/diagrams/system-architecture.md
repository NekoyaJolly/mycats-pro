# 📊 システム構成図

## 🏗️ 全体アーキテクチャ

### システム構成概要図

```mermaid
graph TB
    subgraph "ユーザー"
        U1[ブリーダー]
        U2[管理者]
        U3[獣医師]
    end
    
    subgraph "フロントエンド層"
        FE[Next.js Frontend<br/>Port: 3000]
        UI[Mantine UI<br/>コンポーネント]
    end
    
    subgraph "バックエンド層"
        API[NestJS API Server<br/>Port: 3004]
        AUTH[認証サービス<br/>JWT]
        VALID[バリデーション<br/>Class Validator]
    end
    
    subgraph "ビジネスロジック層"
        CAT[猫管理サービス]
        PED[血統管理サービス]
        BREED[繁殖管理サービス]
        CARE[ケア管理サービス]
        TAG[タグ管理サービス]
    end
    
    subgraph "データ層"
        ORM[Prisma ORM]
        DB[(PostgreSQL<br/>Database)]
        CACHE[(Redis Cache<br/>※将来実装)]
    end
    
    subgraph "外部サービス"
        MAIL[メール通知<br/>※将来実装]
        FILE[ファイルストレージ<br/>※将来実装]
    end
    
    U1 --> FE
    U2 --> FE
    U3 --> FE
    
    FE --> UI
    FE --> API
    
    API --> AUTH
    API --> VALID
    AUTH --> CAT
    AUTH --> PED
    AUTH --> BREED
    AUTH --> CARE
    AUTH --> TAG
    
    CAT --> ORM
    PED --> ORM
    BREED --> ORM
    CARE --> ORM
    TAG --> ORM
    
    ORM --> DB
    ORM --> CACHE
    
    CARE --> MAIL
    CAT --> FILE
```

### ネットワーク構成図

```mermaid
graph LR
    subgraph "クライアント"
        PC[PC ブラウザ]
        MOBILE[モバイル ブラウザ]
    end
    
    subgraph "Webサーバー"
        NGINX[Nginx<br/>リバースプロキシ]
    end
    
    subgraph "アプリケーションサーバー"
        NEXT[Next.js<br/>:3000]
        NEST[NestJS<br/>:3004]
    end
    
    subgraph "データベースサーバー"
        POSTGRES[(PostgreSQL<br/>:5432)]
    end
    
    PC --> NGINX
    MOBILE --> NGINX
    
    NGINX --> NEXT
    NGINX --> NEST
    
    NEXT --> NEST
    NEST --> POSTGRES
```

## 🔧 デプロイメント構成

### 開発環境構成

```mermaid
graph TB
    subgraph "開発者PC"
        DEV_FE[Next.js Dev Server<br/>localhost:3000]
        DEV_BE[NestJS Dev Server<br/>localhost:3004]
        DEV_DB[(PostgreSQL<br/>localhost:5432)]
    end
    
    DEV_FE --> DEV_BE
    DEV_BE --> DEV_DB
    
    DEV_FE -.-> |Hot Reload| DEV_FE
    DEV_BE -.-> |Watch Mode| DEV_BE
```

### ステージング環境構成

```mermaid
graph TB
    subgraph "ステージングサーバー"
        STG_NGINX[Nginx]
        STG_FE[Next.js Build<br/>:3000]
        STG_BE[NestJS Production<br/>:3004]
        STG_DB[(PostgreSQL<br/>:5432)]
    end
    
    STG_NGINX --> STG_FE
    STG_NGINX --> STG_BE
    STG_FE --> STG_BE
    STG_BE --> STG_DB
```

### 本番環境構成（将来）

```mermaid
graph TB
    subgraph "Load Balancer"
        LB[ALB / Nginx]
    end
    
    subgraph "Web Tier"
        WEB1[Web Server 1]
        WEB2[Web Server 2]
    end
    
    subgraph "App Tier"
        APP1[App Server 1]
        APP2[App Server 2]
    end
    
    subgraph "Cache Tier"
        REDIS[(Redis Cluster)]
    end
    
    subgraph "Database Tier"
        DB_MASTER[(PostgreSQL<br/>Master)]
        DB_SLAVE[(PostgreSQL<br/>Read Replica)]
    end
    
    subgraph "Storage"
        S3[Object Storage<br/>Images/Files]
    end
    
    LB --> WEB1
    LB --> WEB2
    
    WEB1 --> APP1
    WEB2 --> APP2
    
    APP1 --> REDIS
    APP2 --> REDIS
    
    APP1 --> DB_MASTER
    APP2 --> DB_MASTER
    APP1 --> DB_SLAVE
    APP2 --> DB_SLAVE
    
    APP1 --> S3
    APP2 --> S3
```

## 🛡️ セキュリティ構成

### 認証・認可フロー

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth API
    participant B as Business API
    participant D as Database
    
    U->>F: ログイン要求
    F->>A: 認証情報送信
    A->>D: ユーザー検証
    D-->>A: 認証結果
    A-->>F: JWT Token発行
    
    Note over F: Tokenをメモリに保存
    
    U->>F: API要求
    F->>B: Request + JWT
    B->>B: Token検証
    B->>D: 認可済みデータアクセス
    D-->>B: データ返却
    B-->>F: レスポンス
    F-->>U: 画面表示
```

### データアクセス制御

```mermaid
graph TB
    subgraph "ユーザーロール"
        ADMIN[管理者<br/>全データアクセス]
        BREEDER[ブリーダー<br/>自分のデータのみ]
        VET[獣医師<br/>健康データのみ]
        VIEWER[閲覧者<br/>参照のみ]
    end
    
    subgraph "データアクセス権限"
        CAT_CRUD[猫データ CRUD]
        PED_CRUD[血統データ CRUD]
        CARE_CRUD[ケアデータ CRUD]
        BREED_CRUD[繁殖データ CRUD]
        
        CAT_READ[猫データ 参照]
        PED_READ[血統データ 参照]
        CARE_READ[ケアデータ 参照]
        BREED_READ[繁殖データ 参照]
    end
    
    ADMIN --> CAT_CRUD
    ADMIN --> PED_CRUD
    ADMIN --> CARE_CRUD
    ADMIN --> BREED_CRUD
    
    BREEDER --> CAT_CRUD
    BREEDER --> PED_CRUD
    BREEDER --> CARE_CRUD
    BREEDER --> BREED_CRUD
    
    VET --> CAT_READ
    VET --> CARE_CRUD
    
    VIEWER --> CAT_READ
    VIEWER --> PED_READ
    VIEWER --> CARE_READ
    VIEWER --> BREED_READ
```

## 📊 データフロー図

### 猫登録フロー

```mermaid
graph TD
    A[猫情報入力] --> B[フロントエンドバリデーション]
    B --> C[API送信]
    C --> D[バックエンドバリデーション]
    D --> E[重複チェック]
    E --> F[データベース保存]
    F --> G[血統書自動作成]
    G --> H[レスポンス返却]
    H --> I[画面更新]
    
    E -.-> |重複エラー| J[エラー表示]
    D -.-> |バリデーションエラー| J
    
    style A fill:#e1f5fe
    style I fill:#c8e6c9
    style J fill:#ffcdd2
```

### 血統検索フロー

```mermaid
graph TD
    A[検索条件入力] --> B[フロントエンド前処理]
    B --> C[API要求]
    C --> D[クエリ構築]
    D --> E[データベース検索]
    E --> F[血統関係構築]
    F --> G[家系図データ生成]
    G --> H[レスポンス返却]
    H --> I[家系図表示]
    
    E --> |キャッシュ確認| K[Redis Cache]
    K -.-> |キャッシュヒット| G
    K -.-> |キャッシュミス| E
    
    style A fill:#e1f5fe
    style I fill:#c8e6c9
```

### 繁殖管理フロー

```mermaid
graph TD
    A[交配計画入力] --> B[血統適合性チェック]
    B --> C[近親交配警告]
    C --> D[交配記録保存]
    D --> E[妊娠期間計算]
    E --> F[出産予定日設定]
    F --> G[ケアスケジュール自動作成]
    G --> H[通知スケジュール設定]
    H --> I[完了通知]
    
    B -.-> |不適合| J[警告表示]
    C -.-> |近親交配検出| K[アラート表示]
    
    style A fill:#e1f5fe
    style I fill:#c8e6c9
    style J fill:#fff3e0
    style K fill:#ffcdd2
```

## 🔄 バックアップ・災害復旧

### バックアップ構成

```mermaid
graph TB
    subgraph "本番システム"
        PROD_DB[(本番DB)]
        PROD_FILES[アプリファイル]
    end
    
    subgraph "バックアップストレージ"
        BACKUP_DB[(DBバックアップ<br/>日次・週次)]
        BACKUP_FILES[ファイルバックアップ<br/>日次)]
        BACKUP_CONFIG[設定ファイル<br/>変更時)]
    end
    
    subgraph "オフサイトストレージ"
        OFFSITE_DB[(リモートDBバックアップ<br/>週次)]
        OFFSITE_FILES[リモートファイル<br/>週次)]
    end
    
    PROD_DB -.-> |pg_dump| BACKUP_DB
    PROD_FILES -.-> |tar/rsync| BACKUP_FILES
    PROD_FILES -.-> |git| BACKUP_CONFIG
    
    BACKUP_DB -.-> |転送| OFFSITE_DB
    BACKUP_FILES -.-> |転送| OFFSITE_FILES
```

### 災害復旧手順

```mermaid
graph TD
    A[障害検知] --> B[障害レベル判定]
    B --> C{復旧方法選択}
    
    C -->|レベル1<br/>アプリ再起動| D[アプリケーション再起動]
    C -->|レベル2<br/>ロールバック| E[前バージョンロールバック]
    C -->|レベル3<br/>データ復旧| F[バックアップからDB復旧]
    C -->|レベル4<br/>システム再構築| G[システム全体再構築]
    
    D --> H[動作確認]
    E --> H
    F --> H
    G --> H
    
    H --> I{正常?}
    I -->|Yes| J[復旧完了]
    I -->|No| K[上位レベル復旧実行]
    K --> C
    
    style A fill:#ffcdd2
    style J fill:#c8e6c9
```

## 📱 将来拡張構成

### マイクロサービス化（将来）

```mermaid
graph TB
    subgraph "API Gateway"
        GW[API Gateway<br/>認証・ルーティング]
    end
    
    subgraph "マイクロサービス"
        USER_SVC[ユーザー管理<br/>サービス]
        CAT_SVC[猫管理<br/>サービス]
        PED_SVC[血統管理<br/>サービス]
        BREED_SVC[繁殖管理<br/>サービス]
        CARE_SVC[ケア管理<br/>サービス]
        NOTIFY_SVC[通知<br/>サービス]
    end
    
    subgraph "データストア"
        USER_DB[(ユーザーDB)]
        CAT_DB[(猫データDB)]
        PED_DB[(血統DB)]
        BREED_DB[(繁殖DB)]
        CARE_DB[(ケアDB)]
    end
    
    subgraph "共通サービス"
        MESSAGE_Q[メッセージキュー]
        CONFIG_SVC[設定管理]
        LOG_SVC[ログ集約]
    end
    
    GW --> USER_SVC
    GW --> CAT_SVC
    GW --> PED_SVC
    GW --> BREED_SVC
    GW --> CARE_SVC
    
    USER_SVC --> USER_DB
    CAT_SVC --> CAT_DB
    PED_SVC --> PED_DB
    BREED_SVC --> BREED_DB
    CARE_SVC --> CARE_DB
    
    CARE_SVC --> MESSAGE_Q
    MESSAGE_Q --> NOTIFY_SVC
    
    USER_SVC --> CONFIG_SVC
    CAT_SVC --> CONFIG_SVC
    PED_SVC --> CONFIG_SVC
    
    USER_SVC --> LOG_SVC
    CAT_SVC --> LOG_SVC
    PED_SVC --> LOG_SVC
```

---

**図表バージョン**: 1.0  
**最終更新日**: 2025年8月9日  
**作成者**: システム設計チーム
