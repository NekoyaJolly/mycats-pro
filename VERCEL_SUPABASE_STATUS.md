# Vercel と Supabase の接続状況確認結果

## 結論

### ✅ Supabase: 正常に接続・設定済み
- データベース接続設定が完璧に整備されています
- Transaction Pooler と Direct Connection が正しく設定されています
- 詳細なドキュメントとマイグレーションガイドが用意されています

### ⚠️ Vercel: 現在は未使用
- Vercelの設定ファイル（vercel.json）は存在しません
- 実際のデプロイ先は **Google Cloud Run** です
- READMEには「Vercel（推奨）」と記載がありますが、実際には使用されていません

---

## 現在のデプロイ構成

```
GitHub → GitHub Actions → Cloud Build → Cloud Run
                                          ↓
                                    Supabase PostgreSQL
```

### デプロイ先
- **フロントエンド**: Google Cloud Run (Next.js)
- **バックエンド**: Google Cloud Run (NestJS)
- **データベース**: Supabase PostgreSQL

### CI/CD
- GitHub Actions で完全自動化
- セキュリティスキャン（Trivy）自動実行
- Lint・型チェック・テスト自動実行
- ステージング・本番環境へ自動デプロイ

---

## Supabase 接続の詳細

### 設定済みの接続方式

1. **Transaction Pooler** (通常のクエリ用)
   - ポート: 6543
   - 環境変数: `DATABASE_URL`
   - PgBouncer による効率的なコネクション管理

2. **Direct Connection** (マイグレーション用)
   - ポート: 5432
   - 環境変数: `DIRECT_URL`
   - データベースマイグレーション実行に必要

### Prisma Schema 設定

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Transaction Pooler
  directUrl = env("DIRECT_URL")        // Direct Connection
}
```

---

## 診断ツールの使い方

### 1. デプロイ設定の確認
```bash
pnpm check:deployment
# または
npm run check:deployment
```

このコマンドで以下を確認できます:
- Vercel設定ファイルの有無
- Supabase設定ファイルの存在
- Prisma Schema の設定状況
- CI/CD設定の確認

### 2. Supabase接続のテスト
```bash
pnpm check:supabase
# または
npm run check:supabase
```

このコマンドで以下をテストできます:
- 環境変数の設定状況
- データベースへの実際の接続
- 各テーブルへのアクセス確認

**注意**: このテストを実行するには、`.env.development` または `.env.production` に以下の環境変数が必要です:
- `DATABASE_URL`
- `DIRECT_URL` (Supabase使用時)

---

## Vercel を使いたい場合

現在 Vercel は使用されていませんが、使いたい場合は以下の手順が必要です:

### 1. Vercel 設定ファイルの作成

`frontend/vercel.json`:
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

### 2. Vercel CLI でデプロイ

```bash
npm i -g vercel
cd frontend
vercel
```

### 3. 環境変数の設定

Vercel Dashboard で以下を設定:
- `NEXT_PUBLIC_API_URL`: バックエンドAPI URL

### 注意点

- Vercel でデプロイするのは **フロントエンドのみ**
- バックエンド（NestJS）は引き続き **Cloud Run** で運用が必要
- フロントエンドとバックエンドが別プラットフォームになるため、管理が複雑化します

---

## 推奨事項

### 現在の構成を継続することを推奨

現在の Google Cloud Run + Supabase 構成には以下のメリットがあります:

1. ✅ **統合管理**: フロントエンド・バックエンドが同一プラットフォーム
2. ✅ **完全自動化**: GitHub Actions による CI/CD が整備済み
3. ✅ **セキュリティ**: Secret Manager で安全に環境変数を管理
4. ✅ **ドキュメント**: 詳細な設定ガイドとトラブルシューティングが完備
5. ✅ **安定性**: Supabase との統合が完璧に動作中

**特に理由がなければ、現在の構成を継続することをお勧めします。**

---

## 関連ドキュメント

### Supabase 関連
- [Supabase 接続設定ガイド](./docs/SUPABASE_CONNECTION_GUIDE.md)
- [ローカル PostgreSQL から Supabase への移行ガイド](./docs/MIGRATION_FROM_LOCAL_POSTGRES.md)

### デプロイ関連
- [CI/CD デプロイメントフロー](./docs/CICD_DEPLOYMENT_FLOW.md)
- [詳細レポート](./docs/VERCEL_SUPABASE_CONNECTION_REPORT.md)

### 設定ファイル
- [cloudbuild.yaml](./cloudbuild.yaml) - Cloud Build 設定
- [.github/workflows/ci-cd.yml](./.github/workflows/ci-cd.yml) - GitHub Actions
- [backend/prisma/schema.prisma](./backend/prisma/schema.prisma) - Prisma Schema

---

## トラブルシューティング

### Supabase に接続できない場合

1. 環境変数を確認
   ```bash
   echo $DATABASE_URL
   echo $DIRECT_URL
   ```

2. Supabase ダッシュボードで Connection Pooler が有効か確認

3. 接続テストを実行
   ```bash
   pnpm check:supabase
   ```

4. マイグレーションを実行
   ```bash
   cd backend
   pnpm run prisma:migrate:deploy
   ```

詳細は [Supabase 接続設定ガイド](./docs/SUPABASE_CONNECTION_GUIDE.md) を参照してください。

---

**調査日**: 2026-02-06  
**調査ツール**: GitHub Copilot Agent  
**プロジェクト**: MyCats Pro (my-cats-pro)
