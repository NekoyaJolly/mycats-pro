# � MyCats

[![CI](https://github.com/NekoyaJolly/mycats/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/NekoyaJolly/mycats/actions/workflows/ci.yml)

フロントエンド (Next.js 15 + Mantine UI) とバックエンド (NestJS + Prisma) を組み合わせた包括的な猫個体・血統・ケア情報管理アプリケーションです。血統書管理、交配記録、ケアスケジュール、健康管理などの機能を提供します。

## 📋 目次

- [🎯 機能概要](#-機能概要)
- [🛠 技術スタック](#-技術スタック)
- [📁 プロジェクト構造](#-プロジェクト構造)
- [🗄️ データベース設計](#️-データベース設計)
- [🚀 クイックスタート (最短手順)](#-クイックスタート-最短手順)
- [🧪 開発モード詳細 / 認証バイパス](#-開発モード詳細--認証バイパス)
- [� Adminアカウント永続化](#-adminアカウント永続化)
- [�🔧 スクリプト & コマンド集](#-スクリプト--コマンド集)
- [📊 ビルド・デプロイ](#-ビルドデプロイ)
- [🌐 デプロイオプション](#-デプロイオプション)
- [🔍 トラブルシューティング](#-トラブルシューティング)
- [🎨 スタイルガイド（抜粋）](#-スタイルガイド抜粋)
- [🧭 命名規則ガイドライン](#-命名規則ガイドライン)

## 🎯 機能概要

### ✅ 実装済み機能

1. **ホーム画面** (`/`)
   - 在舎猫一覧とダッシュボード
   - 検索・フィルタリング機能

2. **猫管理** (`/cats`)
   - 猫の基本情報管理
   - 個体詳細表示・編集
   - 血統情報の表示

3. **血統書管理** (`/pedigrees`)
   - 血統書データの管理
   - 家系図表示
   - 血統関係の追跡

4. **子猫管理** (`/kittens`)
   - 子猫一覧と詳細表示
   - 母猫別のグループ表示
   - 成長記録管理

5. **交配管理** (`/breeding`)
   - 交配記録の管理
   - 出産予定管理
   - 繁殖計画

6. **ケアスケジュール** (`/care`)
   - ワクチン・駆虫・健康診断の管理
   - スケジュール管理
   - 通知機能

7. **タグ管理** (`/tags`)
   - カテゴリ別タグ管理
   - カスタムタグ作成
   - カラーパレット対応

8. **その他機能** (`/more`)
   - 各種設定へのナビゲーション
   - システム情報表示

### 🚧 開発予定機能

- 詳細な医療記録管理
- レポート・統計機能
- データエクスポート/インポート
- モバイルアプリ対応

## 🛠 技術スタック

### フロントエンド

- **フレームワーク**: Next.js 15.5.3 (React 19.1.0 + TypeScript 5.x)
- **UIライブラリ**: Mantine UI v8.2.4 + Tailwind CSS v4
- **日付操作**: Day.js 1.11.13
- **アイコン**: Tabler Icons v3.34.1
- **パッケージマネージャー**: pnpm 9.15.9

### バックエンド

- **フレームワーク**: NestJS 10 (TypeScript 5.x)
- **ORM**: Prisma 6.14.0
- **認証**: JWT + Passport
- **API文書**: Swagger/OpenAPI
- **バリデーション**: Class Validator
- **パッケージマネージャー**: pnpm 9.15.9

### データベース・インフラ

- **データベース**: PostgreSQL 15+
- **ORM**: Prisma 6.14.0
- **キャッシュ**: Redis (予定)
- **Node.js**: 20.x (推奨)

## 📁 プロジェクト構造

```text
mycats/
├── frontend/                   # フロントエンド (Next.js 15.5.3)
│   ├── src/app/               # App Router ページ
│   │   ├── page.tsx           # ホーム画面
│   │   ├── cats/             # 猫管理ページ
│   │   ├── pedigrees/        # 血統書管理ページ
│   │   ├── kittens/          # 子猫管理ページ
│   │   ├── breeding/         # 交配管理ページ
│   │   ├── care/             # ケア管理ページ
│   │   ├── tags/             # タグ管理ページ
│   │   └── more/             # その他機能
│   ├── src/components/        # 再利用可能コンポーネント
│   ├── package.json           # フロントエンド依存関係 (pnpm)
│   ├── next.config.ts         # Next.js設定
│   └── .next/                 # ビルド成果物
├── backend/                    # バックエンド API (NestJS 10)
│   ├── src/                   # ソースコード
│   │   ├── cats/             # 猫管理モジュール
│   │   ├── pedigree/         # 血統書管理モジュール
│   │   ├── breeding/         # 交配管理モジュール
│   │   ├── care/             # ケア管理モジュール
│   │   ├── users/            # ユーザー管理モジュール
│   │   ├── auth/             # 認証モジュール
│   │   └── scripts/          # データ処理スクリプト
│   ├── prisma/               # データベーススキーマ・マイグレーション
│   ├── test/                 # E2Eテスト
│   └── package.json          # バックエンド依存関係 (pnpm)
├── database/                   # データベース初期設定
├── scripts/                    # プロジェクト管理スクリプト
├── docs/                       # プロジェクト技術文書
├── nginx/                      # Nginx設定（本番環境用）
├── pnpm-workspace.yaml        # pnpm workspace設定
├── package.json               # ルートレベル統合管理
└── README.md                  # このファイル
```

## 🗄️ データベース設計

本プロジェクトではPostgreSQLとPrisma 6.14.0 ORMを使用してデータベースを管理しています。本番環境デプロイ時には、Prismaによって11個のテーブルと複雑なリレーション構造が自動生成されます。

### 📚 データベースドキュメント

- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - データベース設計概要と本番環境情報
- **[docs/DATABASE_PRODUCTION_SCHEMA.md](./docs/DATABASE_PRODUCTION_SCHEMA.md)** - 本番環境の完全なテーブル・フィールド・リレーション仕様
- **[docs/DATABASE_ER_DIAGRAM.md](./docs/DATABASE_ER_DIAGRAM.md)** - ER図とシステム構成の視覚的表現
- **[DATABASE_QUICK_REF.md](./DATABASE_QUICK_REF.md)** - 開発者向けクイックリファレンス

### 🔗 主要テーブル（本番環境で生成）

| No. | テーブル名         | 概要         | 主要フィールド                                                |
| --- | ------------------ | ------------ | ------------------------------------------------------------- |
| 1   | `users`            | ユーザー管理 | email, role, clerk_id                                         |
| 2   | `cats`             | 猫の基本情報 | name, birth_date, gender, breed_id, owner_id                  |
| 3   | `breeds`           | 猫種マスタ   | code, name, description                                       |
| 4   | `coat_colors`      | 毛色マスタ   | code, name, description                                       |
| 5   | `pedigrees`        | 血統情報     | pedigree_id, cat_name, father_pedigree_id, mother_pedigree_id |
| 6   | `breeding_records` | 交配記録     | male_id, female_id, breeding_date, status                     |
| 7   | `care_records`     | ケア履歴     | cat_id, care_type, care_date, description                     |
| 8   | `schedules`        | スケジュール | title, schedule_date, type, status, cat_id                    |
| 9   | `tags`             | タグマスタ   | name, color, description                                      |
| 10  | `cat_tags`         | 猫タグ関連   | cat_id, tag_id                                                |
| 11  | `login_attempts`   | ログイン履歴 | user_id, success, ip_address                                  |

### 🔄 主要リレーション（本番環境）

- **ユーザー ↔ 猫**: 1対多（1人が複数の猫を所有）
- **猫 ↔ 猫**: 自己参照（親子関係）
- **猫 ↔ 血統**: 1対多（1匹の猫が複数の血統記録）
- **猫 ↔ 交配記録**: 1対多（オス/メス別の交配参加）
- **猫 ↔ ケア記録**: 1対多（1匹の猫の多数のケア履歴）
- **猫 ↔ タグ**: 多対多（cat_tags中間テーブル経由）
- **血統 ↔ 血統**: 自己参照（父母・祖父母関係）

### 📊 本番環境データベース設定

```bash
# 開発環境
DATABASE_URL="postgresql://postgres:password@localhost:5432/cat_management?schema=public"

# ヘルスチェック
curl http://localhost:3004/health
```

## 🚀 クイックスタート (最短手順)

ローカルで「動かすだけ」を最短で行うための手順です。細かい選択肢や背景は後続セクションを参照してください。

### 前提条件

- **Node.js**: 20.x (推奨)
- **pnpm**: 9.15.9 (推奨パッケージマネージャー)
- **PostgreSQL**: 15以上
- **Git**: 最新版

### 1. リポジトリのクローン

```bash
git clone https://github.com/NekoyaJolly/mycats.git
cd mycats
```

### 2. パッケージマネージャーのセットアップ

```bash
# pnpmがインストールされていない場合
npm install -g pnpm@latest

# バージョン確認
pnpm --version  # 9.x系が推奨
```

### 3. 環境変数の設定

`backend/.env` を作成:

```env
# --- Core ---
PORT=3004
NODE_ENV=development
JWT_SECRET=dev-jwt-secret-change-me

# --- Database ---
DATABASE_URL="postgresql://postgres:postgres@localhost:55432/mycats?schema=public"

# --- Admin Seed (初回作成/seedで利用) ---
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Passw0rd!

# --- Optional Auth Bypass (開発のみ) ---
# AUTH_DISABLED=1
```

必要に応じて `frontend/.env.local` に以下を追加 (認証バイパス利用時のみ):

```env
NEXT_PUBLIC_AUTH_DISABLED=1
```

> バイパスの詳細・リスクは後述「開発モード詳細 / 認証バイパス」を参照。

### 4. 依存関係・DBセットアップ & クリーン起動

ルート直下で以下を実行 (自動で backend/front を順序付き起動):

```bash
# 依存関係
pnpm install

# (初回) DBマイグレーション + シード
pnpm run db:migrate
pnpm run db:seed

# クリーン起動 (ポート開放→前提チェック→バックエンド→フロント)
pnpm run backend:dev:clean &
pnpm --filter frontend run dev &
wait
```

あるいは単純にフル並列起動:

```bash
pnpm run dev
```

### 5. アプリケーションへのアクセス

- **フロントエンド**: <http://localhost:3000>
- **バックエンドAPI**: <http://localhost:3004>
- **API Documentation**: <http://localhost:3004/api/docs>
- **Prisma Studio**: `npm run db:studio`

## 🧪 開発モード詳細 / 認証バイパス

開発スピード優先で一時的にログイン手続きを省略したい場合のみ、`AUTH_DISABLED=1` (backend) と `NEXT_PUBLIC_AUTH_DISABLED=1` (frontend) を設定します。ガードはダミー管理者ユーザーを注入し、Next.js middleware は全リクエストを素通しします。

```bash
# backend/.env
AUTH_DISABLED=1

# frontend/.env.local
NEXT_PUBLIC_AUTH_DISABLED=1
```

解除は値を削除または `0` に変更し再起動するだけです。詳細なリスク・注意事項は `README_AUTH_DISABLED_NOTE.md` を参照してください。

⚠️ 本番 / 共有環境で有効化すると、完全にアクセス制御が無効化され重大な情報漏洩リスクになります。

## 🔧 スクリプト & コマンド集

ルート (`package.json`) に集約された代表的なコマンド:

### 開発サーバー起動

| コマンド | 説明 |
|----------|------|
| `pnpm run dev` | backend + frontend + Prisma sync を並列起動（フォアグラウンド） |
| `pnpm run dev:stable` | **推奨**: バックグラウンドで安定起動（Ctrl+C の影響なし） |
| `pnpm run dev:stop` | 安定版サーバーを停止 |
| `pnpm run dev:health` | サーバーの稼働状況を確認 |

> 💡 **安定版サーバーの詳細**: `pnpm run dev` は Ctrl+C で停止しやすい問題があります。長時間の開発には `pnpm run dev:stable` の使用を推奨します。詳細は [STABLE_SERVER_GUIDE.md](./STABLE_SERVER_GUIDE.md) を参照してください。

### その他のコマンド

| コマンド | 説明 |
|----------|------|
| `pnpm run backend:dev:clean` | ポート解放→前提チェック→バックエンド起動 (安定再起動用) |
| `pnpm run db:migrate` | 開発用マイグレーション適用 (dev) |
| `pnpm run db:deploy` | 本番向け migrate deploy |
| `pnpm run db:seed` | 管理者 & サンプルデータ投入 |
| `pnpm run db:studio` | Prisma Studio GUI 起動 |
| `pnpm run prisma:sync` | Prisma schema → Types 同期ウォッチ |
| `pnpm run frontend:build` | フロントエンドビルド |
| `pnpm run backend:build` | バックエンドビルド |
| `pnpm run build` | ルートで backend + frontend を順序ビルド |
| `pnpm run test:e2e` | backend E2E テスト (空でも passWithNoTests) |
| `pnpm run api:smoke` | 登録→ログイン→tags POST のスモーク (要通常認証) |
| `pnpm run diagnose` | 環境診断スクリプト |
| `pnpm run setup` | 初期セットアップ (将来拡張用) |
| `pnpm --filter backend exec ts-node src/scripts/create-or-update-admin.ts` | Admin再作成/更新 (パス保持/強制更新対応) |

### ローカル Postgres スクリプト

`scripts/local-postgres.sh` (ポート: 55432) を利用して Docker 無しで軽量な開発用クラスタを起動できます。

```bash
./scripts/local-postgres.sh start   # 起動
./scripts/local-postgres.sh status  # 状態確認
./scripts/local-postgres.sh stop    # 停止
./scripts/local-postgres.sh psql    # psql シェル
```

DATABASE_URL のポートが 55432 になっていることを確認してください。

### 推奨ワークフロー (安定再起動)

```bash
# backend 側だけ壊れた/ポート詰まり時
pnpm run backend:dev:clean

# スキーマ変更後 (Prisma) 再生成 + 再起動
pnpm run db:migrate && pnpm run db:generate && pnpm run backend:dev:clean
```

## 👤 Adminアカウント永続化

### 目的

再起動やシード再実行で毎回 Admin を「登録」し直さなくてよいようにし、開発の初期コストを削減します。

### 実装方針
 
1. `seed.ts` は既存 Admin のパスワードをデフォルトで上書きしない (ロール/有効化のみ整合)
2. 強制パスワード変更が必要なケースのみ `ADMIN_FORCE_UPDATE=1` を明示
3. 再適用専用スクリプト `create-or-update-admin.ts` を追加 (再実行安全 / 差分更新)

### 利用例
 
```bash
# 既存を維持したまま整合 (初回または差分調整)
pnpm --filter backend exec ts-node src/scripts/create-or-update-admin.ts

# パスワードを変更したい場合
ADMIN_PASSWORD='NewPassw0rd!' ADMIN_FORCE_UPDATE=1 pnpm --filter backend exec ts-node src/scripts/create-or-update-admin.ts
```

### ENV 例
 
```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Passw0rd!
# 必要なときだけ
# ADMIN_FORCE_UPDATE=1
```

### seed.ts の振る舞い
 
- Admin が未存在: 作成 (ENV / デフォルト値)
- 既存: ロールが ADMIN でない/非Active なら修正
- `ADMIN_FORCE_UPDATE=1`: パスワード再ハッシュ反映

### トラブルシュート
 
| 症状 | 想定原因 | 対応 |
|------|----------|------|
| 期待した新パスワードでログイン不可 | 強制更新フラグ未指定 | `ADMIN_FORCE_UPDATE=1` で再実行 |
| Admin が消えた | DBリセット/別DB指している | `pnpm run db:migrate && pnpm run db:seed` またはスクリプト実行 |
| どのパスか不明 | 設定忘れ/共有不足 | 明示的に `ADMIN_FORCE_UPDATE=1` で再設定し共有 |

### 今後の拡張候補
 
- CLI 対話フロー (メール/パス生成)
- 監査ログ (更新時に記録)
- Admin ロール階層 (SUPER_ADMIN 差別化)


### テスト (backend)

```bash
pnpm --filter backend run test
pnpm --filter backend run test:e2e
pnpm --filter backend run test:cov
```

ヘルスチェック:

```bash
curl -s http://localhost:3004/health
```

## 📊 ビルド・デプロイ

### 開発ビルド (individual)

```bash
pnpm install
pnpm run db:generate
pnpm run frontend:build
```

### 本番環境デプロイ

詳細な本番環境デプロイ手順については、[本番環境デプロイガイド](./docs/production-deployment.md) を参照してください。

#### GitHub Actions CI/CD

本プロジェクトでは GitHub Actions を使用した自動CI/CDパイプラインを提供しています：

**CI/CD パイプライン:**

- ✅ セキュリティスキャン（Trivy）
- ✅ 型チェック・Lint
- ✅ ユニットテスト
- ✅ E2Eテスト
- ✅ ビルド確認
- ✅ 本番デプロイ（mainブランチのみ）

**必要な環境変数（GitHub Secrets）:**

```bash
PRODUCTION_DATABASE_URL    # 本番データベースURL
PRODUCTION_JWT_SECRET      # 本番JWT秘密鍵
PRODUCTION_CORS_ORIGIN     # 本番CORS許可オリジン
PRODUCTION_URL            # 本番アプリケーションURL
```

#### 手動デプロイ

```bash
# 1) .env.production / DATABASE_URL / JWT_SECRET 設定
# 2) 依存関係
pnpm install --frozen-lockfile
# 3) Prisma クライアント生成
pnpm run db:generate
# 4) マイグレーション適用
pnpm run db:deploy
# 5) ビルド
pnpm run build
# 6) 起動
NODE_ENV=production node backend/dist/main.js
```

### ビルド成果物

- **フロントエンド**: `frontend/.next/`ディレクトリ
- **バックエンド**: `backend/dist/`ディレクトリ（`pnpm run build`実行時）

## 🌐 デプロイオプション

> **Note:** GitHub Pages へのデプロイは廃止しました。以下のオプションから環境に合わせて選択してください。

### 1. Vercel（推奨）

**適用対象**: フロントエンド + API Routes（フルスタック）

```bash
# Vercel CLIでデプロイ
npm i -g vercel
cd frontend
vercel
```

**メリット**:

- Next.js最適化済み
- 自動プレビューデプロイ
- プライベート公開対応
- Edge Functions対応

### 2. Railway/Heroku（フルスタック）

**適用対象**: フロントエンド + バックエンド + データベース

```bash
# Railway例
npm install -g @railway/cli
railway login
railway init
railway up
```

**メリット**:

- PostgreSQLデータベース込みでデプロイ
- フルスタックアプリケーション対応
- 環境変数管理

### 3. 自前サーバー（VPS/クラウド）

**適用対象**: 完全な制御が必要な場合

```bash
# Docker Compose例（予定）
docker-compose up -d

# 手動デプロイ例
# 1. サーバーでリポジトリクローン
# 2. 依存関係インストール
# 3. 環境変数設定
# 4. ビルド・起動
```

### デプロイ方式の比較

| 方式           | フロント | バック | DB  | プライベート | コスト |
| -------------- | -------- | ------ | --- | ------------ | ------ |
| Vercel         | ✅       | 部分的 | ❌  | ✅           | 無料〜 |
| Railway/Heroku | ✅       | ✅     | ✅  | ✅           | 有料   |
| 自前サーバー   | ✅       | ✅     | ✅  | ✅           | VPS代  |

## 🔍 トラブルシューティング

### よくある問題

1. **ポート競合 (3000 / 3004)**

   ```bash
   lsof -i :3000 || true
   lsof -i :3004 || true
   pnpm run predev   # kill-port で解放
   pnpm run backend:dev:clean
   ```

2. **DB接続エラー (ローカルクラスタ未起動)**

   ```bash
   ./scripts/local-postgres.sh status
   ./scripts/local-postgres.sh start
   pnpm run db:migrate
   ```

3. **依存関係崩壊**

   ```bash
   rm -rf node_modules pnpm-lock.yaml
   rm -rf backend/node_modules frontend/node_modules
   pnpm install
   ```

4. **Prismaクライアント不整合**

   ```bash
   pnpm run db:generate
   ```

5. **フロントエンドビルド失敗 (型)**

   Mantine カラーパレット型エラー時は `providers.tsx` の `MantineColorsTuple` 定義を確認。

### ログの確認

- **バックエンドログ**: ターミナル出力 または `backend/backend.log`
- **フロントエンドログ**: ブラウザの開発者ツール（Console）
- **データベースログ**: PostgreSQLのログファイル

### 推奨バージョン確認

```bash
node --version   # >=20 <23
pnpm --version   # 9.x 推奨
```

## 🤝 開発への参加

### 開発ワークフロー

```bash
# 1. フォークしてクローン
git clone https://github.com/[your-username]/mycats.git
cd mycats

# 2. 開発環境のセットアップ
npm run install:all
npm run db:generate
npm run db:migrate

# 3. 開発サーバー起動
npm run dev

# 4. 機能ブランチ作成
git checkout -b feature/your-feature-name

# 5. 開発・テスト
npm run test:health
npm run test:api

# 6. コミット・プッシュ
git add .
git commit -m "feat: 新機能の説明"
git push origin feature/your-feature-name

# 7. プルリクエスト作成
```

### コードスタイル

- **TypeScript**: 型安全性を重視
- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマット（予定）

## 📄 ライセンス

MIT License

## 🎨 スタイルガイド（抜粋）

ページタイトルは統一した視認性のため `src/components/PageTitle.tsx` を利用し、フォントサイズ18px/weight700で揃えています。新規ページ追加時は `<PageTitle>タイトル</PageTitle>` を最上部ヘッダー領域に配置してください。複数セクション小見出しが必要な場合も可能な限り PageTitle を再利用し、サイズ・色変更が必要な際はインライン style で最小限の上書きを行います。

## 🧭 命名規則ガイドライン

命名ルール、Glossary、適用プロセスは [`docs/naming-guidelines.md`](./docs/naming-guidelines.md) に集約しています。機能追加や既存コードの改修時には必ず参照し、PR テンプレートに従ってチェックを行ってください。

## 🔗 関連ドキュメント

### 📚 技術ドキュメント

- **[📋 ドキュメント索引](./docs/README.md)** - 全ドキュメントの索引
- **[🎯 プロジェクト要件定義](./docs/requirements.md)** - 機能要件・非機能要件
- **[🏗️ システム設計書](./docs/system-design.md)** - アーキテクチャ・設計思想
- **[🔌 API仕様書](./docs/api-specification.md)** - REST API詳細仕様
- **[🚀 運用手順書](./docs/operations.md)** - デプロイ・監視・メンテナンス

### 📊 図表・設計資料

- **[システム構成図](./docs/diagrams/system-architecture.md)** - インフラ・ネットワーク図
- **[プロジェクト全体図（C4/互換）](./docs/diagrams/project-overview.md)** - フロント/バック/API/DBの俯瞰 + 実装/計画マップ
- **[データベース設計](./DATABASE_SCHEMA.md)** - ER図・テーブル設計
- **[クイックリファレンス](./DATABASE_QUICK_REF.md)** - 開発時の参照資料

### 🛠️ 開発ガイド

- **[Functional Blueprint](./docs/functional-blueprint.md)** - UI→API→DB の連携概要とコンポーネント一覧
- **[安定版サーバーガイド](./STABLE_SERVER_GUIDE.md)** - 長時間稼働向けの起動・停止手順

## 🙋‍♂️ サポート

問題や質問がある場合は、[GitHub Issues](https://github.com/NekoyaJolly/mycats/issues)を作成してください。

---

**最終更新**: 2025年10月3日  
**プロジェクト状態**: アクティブ開発中  
**主要バージョン**: フロントエンド（Next.js 15.5.3 + React 19.1.0 + Mantine 8.2.4）、バックエンド（NestJS 10 + Prisma 6.14.0）  
**パッケージマネージャー**: pnpm 9.15.9（推奨）
