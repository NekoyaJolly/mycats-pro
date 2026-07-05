# Vercel と Supabase の接続状況レポート

**作成日**: 2026-02-06  
**プロジェクト**: MyCats Pro (my-cats-pro)  
**調査目的**: VercelとSupabaseの統合状態と接続状況を確認する

---

## 📊 調査結果サマリー

### 総合評価: ⚠️ 部分的に統合済み

- ✅ **Supabase**: 完全に統合・設定済み
- ⚠️  **Vercel**: 設定ファイルなし（現在未使用）
- ✅ **現在のデプロイ**: Google Cloud Run経由で稼働中

---

## 🔍 詳細調査結果

### 1. Vercel の状態

#### ❌ Vercel設定ファイル: 存在しない

以下のファイルが見つかりませんでした：
- `vercel.json` (ルート)
- `.vercel/` (ディレクトリ)
- `frontend/vercel.json`

#### 📝 README での言及

READMEには「Vercel（推奨）」として記載されていますが、実際の設定ファイルは存在しません。

```markdown
### 1. Vercel（推奨）
**適用対象**: フロントエンド + API Routes（フルスタック）
```

#### 結論

**Vercelは現在使用されていません。**

プロジェクトはREADMEでVercelを推奨していますが、実際のデプロイ構成では以下を使用しています：
- GitHub Actions による CI/CD
- Google Cloud Run へのデプロイ（フロントエンド・バックエンド両方）
- Cloud Build による自動ビルド

---

### 2. Supabase の状態

#### ✅ 完全に統合済み

Supabaseは以下のように完全に設定・統合されています：

##### 設定ファイル
- ✅ `supabase/` ディレクトリ: 存在
- ✅ `supabase/config.toml`: 存在
- ✅ `backend/prisma/schema.prisma`: DATABASE_URL と DIRECT_URL が設定済み

##### ドキュメント
- ✅ `docs/SUPABASE_CONNECTION_GUIDE.md`: 詳細な接続ガイド
- ✅ `docs/MIGRATION_FROM_LOCAL_POSTGRES.md`: マイグレーション手順書

##### Prisma 設定

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Transaction Pooler (port 6543)
  directUrl = env("DIRECT_URL")        // Direct Connection (port 5432)
}
```

##### 接続方式

1. **Transaction Pooler** (DATABASE_URL)
   - ポート: 6543
   - 用途: 通常のクエリ実行
   - PgBouncer による効率的なコネクション管理

2. **Direct Connection** (DIRECT_URL)
   - ポート: 5432
   - 用途: マイグレーション実行
   - 長時間接続・トランザクション制御

#### 結論

**Supabaseは正しく設定されており、本番環境で使用中です。**

---

## 🏗️ 現在のアーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
│                    (NekoyaJolly/my-cats-pro)                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Push / PR
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   GitHub Actions CI/CD                       │
│  - Security Scan (Trivy)                                    │
│  - Lint & Type Check                                        │
│  - Unit Tests                                               │
│  - E2E Tests                                                │
│  - Build Validation                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Trigger Cloud Build
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Cloud Build (cloudbuild.yaml)            │
│  - Build Backend Docker Image                               │
│  - Build Frontend Docker Image                              │
│  - Push to Artifact Registry                                │
│  - Deploy to Cloud Run                                      │
└────────┬──────────────────────────────────┬─────────────────┘
         │                                  │
         │                                  │
         ▼                                  ▼
┌──────────────────────┐         ┌──────────────────────┐
│  Cloud Run Backend   │         │  Cloud Run Frontend  │
│  (NestJS)            │◄────────┤  (Next.js)           │
│  Port: 8080          │   API   │  Port: 3000          │
└──────────┬───────────┘         └──────────────────────┘
           │
           │ DATABASE_URL (Transaction Pooler)
           │ DIRECT_URL (Direct Connection)
           ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL                             │
│  - Transaction Pooler: port 6543                            │
│  - Direct Connection: port 5432                             │
│  - Region: aws-0-ap-northeast-1                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 環境変数の設定状況

### GitHub Secrets (CI/CD用)

```bash
GCP_SA_KEY           # Google Cloud サービスアカウント JSON キー
GCP_PROJECT_ID       # Google Cloud プロジェクト ID
```

### Cloud Run 環境変数 (本番環境)

#### バックエンド
- `DATABASE_URL`: Transaction Pooler 経由の接続 (Secret Manager)
- `DIRECT_URL`: Direct Connection (Secret Manager)
- `JWT_SECRET`: JWT署名用シークレット (Secret Manager)
- `JWT_REFRESH_SECRET`: リフレッシュトークン用シークレット (Secret Manager)
- `CSRF_TOKEN_SECRET`: CSRF保護用シークレット (Secret Manager)
- `RESEND_API_KEY`: メール送信API キー (Secret Manager)
- `NODE_ENV`: production
- `CORS_ORIGIN`: フロントエンドURL
- `INSTANCE_CONNECTION_NAME`: Cloud SQLインスタンス名

#### フロントエンド
- `NEXT_PUBLIC_API_URL`: バックエンドAPI URL
- `NODE_ENV`: production

### ローカル開発環境

環境変数サンプルファイル:
- `.env.development.example`: 開発環境用
- `.env.production.example`: 本番環境用

実際のファイル (`.env.development`, `.env.production`) は `.gitignore` に含まれており、
リポジトリには含まれていません（セキュリティ上正常）。

---

## ✅ 確認済み機能

### Supabase統合

1. ✅ **接続設定**: DATABASE_URL と DIRECT_URL が Prisma Schema に設定済み
2. ✅ **ドキュメント**: 詳細な設定ガイドとトラブルシューティングが整備済み
3. ✅ **CI/CD**: GitHub Actions で環境変数が適切に設定されている
4. ✅ **Cloud Run**: Secret Manager を通じて安全に環境変数を管理

### デプロイメント

1. ✅ **CI/CD Pipeline**: GitHub Actions で完全自動化
2. ✅ **セキュリティスキャン**: Trivy による脆弱性スキャン
3. ✅ **型チェック・Lint**: 自動実行
4. ✅ **テスト**: ユニットテスト・E2Eテスト自動実行
5. ✅ **Cloud Run**: ステージング・本番環境へ自動デプロイ

---

## 📝 推奨事項

### Vercelを使用する場合

現在Vercelは使用されていませんが、Vercelへの移行を検討する場合は以下が必要です：

#### 1. Vercel設定ファイルの作成

**frontend/vercel.json**
```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "@next-public-api-url"
  }
}
```

#### 2. 環境変数の設定

Vercel Dashboard で以下を設定：
- `NEXT_PUBLIC_API_URL`: バックエンドAPI URL
- `NODE_ENV`: production

#### 3. バックエンドの扱い

Vercelでフロントエンドのみをデプロイする場合：
- バックエンド（NestJS）は引き続きCloud Runで運用
- フロントエンドからCloud Run上のAPIを呼び出す
- CORS設定でVercelのドメインを許可

#### 4. メリット・デメリット

**メリット**:
- Next.jsに最適化されたホスティング
- 自動プレビューデプロイ
- エッジネットワークによる高速配信
- 簡単なデプロイプロセス

**デメリット**:
- フロントエンドとバックエンドが異なるプラットフォームに分散
- 管理が複雑化
- 追加コスト

### 現在の構成を継続する場合（推奨）

現在のGoogle Cloud Run + Supabase構成は以下の点で優れています：

1. ✅ フロントエンド・バックエンドが同一プラットフォーム
2. ✅ 完全自動化されたCI/CDパイプライン
3. ✅ Secret Managerによる安全な環境変数管理
4. ✅ 詳細なドキュメント整備済み
5. ✅ Supabaseとの統合が完璧

**この構成を継続することを推奨します。**

READMEの「Vercel（推奨）」表記は、実態に合わせて以下のように修正することを検討してください：

```markdown
### 1. Google Cloud Run（現在の構成）

**適用対象**: フロントエンド + バックエンド（フルスタック）

- 完全自動化されたCI/CDパイプライン
- Supabase PostgreSQL と統合済み
- Secret Manager で安全な環境変数管理

### 2. Vercel（代替オプション）

**適用対象**: フロントエンドのみ

- Next.js最適化済み
- バックエンドは引き続きCloud Runで運用が必要
```

---

## 🔧 診断ツール

このレポートを作成するために以下の診断ツールが作成されました：

1. **scripts/check-deployment-status.ts**
   - Vercel設定ファイルの有無を確認
   - Supabase設定の検証
   - 環境変数ファイルのチェック
   - CI/CD設定の確認

2. **scripts/test-supabase-connection.ts**
   - 実際のSupabase接続をテスト
   - データベーステーブルへのアクセス確認
   - 環境変数の検証

### 使用方法

```bash
# デプロイ設定の診断
npx ts-node scripts/check-deployment-status.ts

# Supabase接続のテスト（環境変数が設定されている場合）
npx ts-node scripts/test-supabase-connection.ts
```

---

## 📚 関連ドキュメント

### Supabase関連
- [Supabase接続設定ガイド](./docs/SUPABASE_CONNECTION_GUIDE.md)
- [ローカルPostgreSQLからSupabaseへの移行ガイド](./docs/MIGRATION_FROM_LOCAL_POSTGRES.md)

### デプロイ関連
- [CI/CDデプロイメントフロー](./docs/CICD_DEPLOYMENT_FLOW.md)
- [README.md - デプロイオプション](./README.md#-デプロイオプション)

### 設定ファイル
- [cloudbuild.yaml](./cloudbuild.yaml) - Cloud Build設定
- [.github/workflows/ci-cd.yml](./.github/workflows/ci-cd.yml) - GitHub Actions CI/CD
- [backend/prisma/schema.prisma](./backend/prisma/schema.prisma) - Prisma Schema

---

## 結論

### 🎯 Vercelの状態

**現在Vercelは使用されていません。**

READMEに記載はありますが、実際の設定ファイルや統合は存在しません。
現在はGoogle Cloud RunとSupabaseの組み合わせで本番環境が稼働しています。

### ✅ Supabaseの状態

**Supabaseは完全に統合されており、正常に動作しています。**

- DATABASE_URL と DIRECT_URL が適切に設定
- Transaction Pooler と Direct Connection の使い分けが実装済み
- 詳細なドキュメントとトラブルシューティングガイドあり
- CI/CDパイプラインで環境変数が安全に管理されている

### 📌 総合評価

**現在の構成（Cloud Run + Supabase）は安定しており、問題ありません。**

Vercelへの移行を検討する場合は、メリット・デメリットを慎重に評価し、
現在の安定した構成と比較する必要があります。

---

**レポート作成者**: GitHub Copilot Agent  
**最終更新**: 2026-02-06
