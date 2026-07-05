# Vercel と Supabase の接続状況

最終更新: 2026-02-06

## 📊 現在の構成

### デプロイ環境

このプロジェクトは以下の複数のデプロイオプションをサポートしています:

1. **Google Cloud Run (メイン)** ✅ 
   - フロントエンド: Cloud Run
   - バックエンド: Cloud Run
   - データベース: Supabase PostgreSQL
   - CI/CD: GitHub Actions → Cloud Build
   - 状態: **稼働中**

2. **Vercel (オプション)** ⚠️
   - フロントエンド: Vercel
   - バックエンド: Cloud Run または API Routes
   - データベース: Supabase PostgreSQL
   - 状態: **設定必要**

### データベース構成

- **プロバイダー**: Supabase PostgreSQL
- **接続方法**: 
  - `DATABASE_URL`: Transaction Pooler (port 6543) - アプリケーション実行時
  - `DIRECT_URL`: Direct Connection (port 5432) - マイグレーション実行時

## ✅ Supabase 接続状況

### 設定済み項目

- [x] Prisma スキーマに `directUrl` が設定されている
- [x] `.env.production.example` に Supabase 接続文字列のテンプレートがある
- [x] ドキュメント `SUPABASE_CONNECTION_GUIDE.md` が存在する
- [x] Cloud Run デプロイ時に環境変数が Secret Manager から注入される
- [x] GitHub Actions CI/CD で DATABASE_URL と DIRECT_URL が設定される

### Prisma 設定

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")      // Transaction Pooler (port 6543)
  directUrl = env("DIRECT_URL")        // Direct Connection (port 5432)
}
```

### 環境変数テンプレート

**本番環境 (.env.production)**:
```bash
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

**開発環境 (.env.development)**:
```bash
# ローカル PostgreSQL を使用する場合（推奨）
DATABASE_URL="postgresql://runner:password@localhost:55432/mycats_development"
# DIRECT_URL は不要

# または Supabase を使用する場合
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

## ⚠️ Vercel 接続状況

### 現状

- **Vercel プロジェクト設定**: 未確認
- **環境変数設定**: 確認必要
- **デプロイ履歴**: 不明

### Vercel で必要な環境変数

Vercel プロジェクトに以下の環境変数を設定する必要があります:

#### フロントエンド（Vercel にデプロイする場合）

```bash
# API 接続
NEXT_PUBLIC_API_URL=https://your-backend-url.run.app

# Node 環境
NODE_ENV=production
```

#### バックエンド（Vercel の API Routes を使用する場合）

```bash
# データベース接続
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres

# セキュリティ
JWT_SECRET=your-256-bit-secret
JWT_REFRESH_SECRET=your-256-bit-refresh-secret
CSRF_TOKEN_SECRET=your-256-bit-csrf-secret

# CORS
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# メール（オプション）
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=MyCats Pro
```

## 🔍 接続確認方法

### 1. 環境変数の確認

```bash
# チェックスクリプトを実行
pnpm tsx scripts/check-vercel-supabase-connection.ts

# または手動で確認
echo $DATABASE_URL
echo $DIRECT_URL
```

### 2. Supabase 接続テスト

```bash
# Prisma 経由で接続テスト
pnpm --filter backend run prisma:studio

# または SQL 直接実行
psql $DATABASE_URL -c "SELECT NOW();"
```

### 3. Vercel 設定の確認

```bash
# Vercel CLI がインストールされている場合
cd frontend
vercel env ls

# プロジェクトの環境変数を確認
vercel env pull .env.vercel
```

## 📝 Vercel デプロイ手順

### 初回セットアップ

1. **Vercel CLI のインストール**:
   ```bash
   npm i -g vercel
   ```

2. **プロジェクトのリンク**:
   ```bash
   cd frontend
   vercel
   # 対話形式でプロジェクトをリンク
   ```

3. **環境変数の設定**:
   ```bash
   # Vercel ダッシュボードで設定
   # または CLI で設定
   vercel env add NEXT_PUBLIC_API_URL production
   vercel env add DATABASE_URL production
   vercel env add DIRECT_URL production
   ```

### デプロイ

```bash
# 本番環境へのデプロイ
cd frontend
vercel --prod

# またはプレビュー環境
vercel
```

## 🚨 よくある問題と解決方法

### 問題 1: Vercel で `DATABASE_URL` が見つからない

**原因**: 環境変数が設定されていない

**解決方法**:
1. Vercel ダッシュボード → Settings → Environment Variables
2. `DATABASE_URL` と `DIRECT_URL` を追加
3. 再デプロイ

### 問題 2: Supabase 接続タイムアウト

**原因**: Connection Pooler が有効化されていない、またはファイアウォール設定

**解決方法**:
1. Supabase ダッシュボード → Settings → Database → Connection Pooling を有効化
2. 一時的に Direct Connection (port 5432) を使用してテスト
3. ファイアウォール設定でポート 6543 を許可

### 問題 3: マイグレーションが失敗する

**原因**: `DIRECT_URL` が設定されていない

**解決方法**:
1. `.env` ファイルに `DIRECT_URL` を追加
2. Vercel の環境変数に `DIRECT_URL` を追加
3. `pnpm db:migrate` を再実行

## 🔐 セキュリティチェックリスト

- [ ] `.env` ファイルが `.gitignore` に含まれている
- [ ] 本番環境の認証情報が Secret Manager または Vercel Environment Variables に保存されている
- [ ] `DATABASE_URL` にプレーンテキストのパスワードが含まれていない（環境変数経由）
- [ ] CORS 設定が本番ドメインのみに制限されている
- [ ] JWT シークレットが 32 文字以上の強力なランダム文字列
- [ ] Supabase の Row Level Security (RLS) が有効化されている（必要に応じて）

## 📚 関連ドキュメント

- [SUPABASE_CONNECTION_GUIDE.md](./SUPABASE_CONNECTION_GUIDE.md) - Supabase 接続の詳細ガイド
- [DATABASE_DEPLOYMENT_GUIDE.md](./DATABASE_DEPLOYMENT_GUIDE.md) - データベースデプロイ手順
- [CICD_DEPLOYMENT_FLOW.md](./CICD_DEPLOYMENT_FLOW.md) - CI/CD フロー
- [production-deployment.md](./production-deployment.md) - 本番デプロイ手順

## 🛠️ 次のアクション

### Vercel デプロイを有効化する場合

1. [ ] Vercel CLI をインストール
2. [ ] `frontend` ディレクトリでプロジェクトをリンク
3. [ ] 環境変数を設定（`NEXT_PUBLIC_API_URL`, `DATABASE_URL`, `DIRECT_URL` など）
4. [ ] `vercel --prod` でデプロイ
5. [ ] デプロイ後の動作確認

### Cloud Run のみを使用する場合

1. [ ] README から Vercel の記載を削除または「オプション」と明記
2. [ ] `.vercelignore` を追加（必要に応じて）
3. [ ] ドキュメントを更新

## 📞 サポート

問題が発生した場合は、以下のドキュメントを参照してください:

- [TROUBLESHOOTING.md](../TROUBLESHOOTING.md)
- [GitHub Issues](https://github.com/NekoyaJolly/my-cats-pro/issues)

---

**作成日**: 2026-02-06  
**作成者**: Copilot Agent
