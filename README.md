# 🐱 猫生体管理システム (My Cats)

[![CI](https://github.com/NekoyaJolly/mycats/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/NekoyaJolly/mycats/actions/workflows/ci.yml)

フロントエンド (Next.js 15 + Mantine UI) とバックエンド (NestJS + Prisma) を組み合わせた包括的な猫生体管理アプリケーションです。血統書管理、交配記録、ケアスケジュール、健康管理などの機能を提供します。

## 📋 目次

- [🎯 機能概要](#-機能概要)
- [🛠 技術スタック](#-技術スタック)
- [📁 プロジェクト構造](#-プロジェクト構造)
- [🗄️ データベース設計](#️-データベース設計)
- [🚀 クイックスタート](#-クイックスタート)
- [🔧 利用可能なコマンド](#-利用可能なコマンド)
- [📊 ビルド・デプロイ](#-ビルドデプロイ)
- [🔍 トラブルシューティング](#-トラブルシューティング)

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

- **フレームワーク**: Next.js 15 (React 19 + TypeScript)
- **UIライブラリ**: Mantine UI v8 + Tailwind CSS
- **日付操作**: Day.js
- **アイコン**: Tabler Icons

### バックエンド

- **フレームワーク**: NestJS 10 (TypeScript)
- **ORM**: Prisma 6.14.0
- **認証**: JWT + Passport
- **API文書**: Swagger/OpenAPI
- **バリデーション**: Class Validator

### データベース・インフラ

- **データベース**: PostgreSQL 15
- **ORM**: Prisma 6.14.0
- **キャッシュ**: Redis (予定)

## 📁 プロジェクト構造

```text
appproject/
├── frontend/                # フロントエンド (Next.js 15)
│   ├── src/app/               # App Router ページ
│   ├── src/components/        # 再利用可能コンポーネント
│   ├── package.json           # フロントエンド依存関係
│   └── .next/                 # ビルド成果物
├── backend/                    # バックエンド API (NestJS)
│   ├── src/                   # ソースコード
│   │   ├── cats/             # 猫管理モジュール
│   │   ├── pedigree/         # 血統書管理モジュール
│   │   ├── breeding/         # 交配管理モジュール
│   │   ├── care/             # ケア管理モジュール
│   │   └── scripts/          # データ処理スクリプト
│   ├── prisma/               # データベーススキーマ
│   └── package.json          # バックエンド依存関係
├── database/                   # データベース初期設定
├── scripts/                    # プロジェクト管理スクリプト
├── memory-bank/               # プロジェクト文書
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

## 🚀 クイックスタート

### 前提条件

- **Node.js**: 20.x (推奨) または 22.x
- **PostgreSQL**: 15以上
- **Git**: 最新版

### 1. リポジトリのクローン

```bash
git clone https://github.com/NekoyaJolly/mycats.git
cd mycats
```

### 2. 環境変数の設定

`.env`ファイルを作成し、データベース接続情報を設定：

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/catmanagement"

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# API Configuration
PORT=3004
```

### 3. 依存関係のインストールとビルド

```bash
# 全ての依存関係をインストール
npm run install:all

# Prismaクライアント生成
npm run db:generate

# データベースマイグレーション
npm run db:migrate

# プロジェクトをビルド
npm run frontend:build
```

### 4. 開発環境の起動

```bash
# 開発サーバーを起動（バックエンド:3004、フロントエンド:3000）
npm run dev
```

### 5. アプリケーションへのアクセス

- **フロントエンド**: <http://localhost:3000>
- **バックエンドAPI**: <http://localhost:3004>
- **API Documentation**: <http://localhost:3004/api/docs>
- **Prisma Studio**: `npm run db:studio`

## 🔧 利用可能なコマンド

### 基本操作

```bash
npm run dev              # 開発環境を起動（バックエンド:3004、フロントエンド:3000）
npm start                # 開発環境を起動（devのエイリアス）
npm run help             # 利用可能なコマンド一覧
npm run install:all      # 全ての依存関係をインストール
```

### バックエンド管理

```bash
npm run backend:dev      # バックエンドサーバーを起動
npm run backend:install  # バックエンドの依存関係をインストール
```

### フロントエンド管理

```bash
npm run frontend:dev:wait    # フロントエンド開発サーバー（バックエンド待機あり）
npm run frontend:install    # フロントエンドの依存関係をインストール
npm run frontend:build      # フロントエンドをビルド
npm run frontend:start      # フロントエンド本番サーバーを起動
```

### データベース管理

```bash
npm run db:migrate       # データベースマイグレーション
npm run db:generate      # Prismaクライアント生成
npm run db:seed          # サンプルデータを投入
npm run db:studio        # Prisma Studio（データベースGUI）
```

### テスト・確認

```bash
npm run test:health      # バックエンドヘルスチェック
npm run test:api         # API動作確認
```

## 📊 ビルド・デプロイ

### 開発ビルド

```bash
# 全依存関係のインストール
npm run install:all

# Prismaクライアント生成
npm run db:generate

# フロントエンドビルド
npm run frontend:build
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
# 1. 本番環境変数の設定（.env.production）
# 2. 依存関係のインストール
pnpm install --frozen-lockfile

# 3. Prismaクライアント生成
pnpm -w run db:generate

# 4. データベースマイグレーション
pnpm -w run db:deploy

# 5. ビルド
pnpm run build

# 6. 本番サーバー起動
NODE_ENV=production node backend/dist/main.js
```

### ビルド成果物

- **フロントエンド**: `frontend/.next/`ディレクトリ
- **バックエンド**: `backend/dist/`ディレクトリ（`npm run build`実行時）

## 🔍 トラブルシューティング

### よくある問題

1. **ポートが既に使用されている**

   ```bash
   # 使用中のポートを確認 (macOS/Linux)
   lsof -i :3000
   lsof -i :3004

   # プロセスを終了
   kill -9 <PID>

   # または、プロジェクトのスクリプトを使用
   npm run predev  # ポート3000, 3004をクリア
   ```

2. **データベース接続エラー**

   ```bash
   # PostgreSQLサービスの状態確認
   brew services list | grep postgresql

   # PostgreSQLを起動
   brew services start postgresql

   # 接続テスト
   npm run test:health
   ```

3. **依存関係の問題**

   ```bash
   # node_modulesを再インストール
   rm -rf node_modules package-lock.json
   rm -rf frontend/node_modules frontend/package-lock.json
   rm -rf backend/node_modules backend/package-lock.json

   # 依存関係を再インストール
   npm run install:all
   ```

4. **Prismaクライアントのエラー**

   ```bash
   # Prismaクライアントを再生成
   npm run db:generate
   ```

5. **フロントエンドビルドエラー**

   ```bash
   # legacy-peer-depsでインストール
   cd frontend
   npm install --legacy-peer-deps
   ```

### ログの確認

- **バックエンドログ**: ターミナル出力 または `backend/backend.log`
- **フロントエンドログ**: ブラウザの開発者ツール（Console）
- **データベースログ**: PostgreSQLのログファイル

### 推奨Node.js/PNPMバージョン

```bash
# 現在のバージョン確認
node --version
pnpm --version

# 推奨: Node.js 20.x〜22.x（root package.json engines参照）
# パッケージマネージャ: PNPM 9系で検証済み
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

- **[開発環境構築](./DEVELOPMENT.md)** - 開発環境セットアップ
- **[セットアップオプション](./SETUP_OPTIONS.md)** - 詳細セットアップ手順
- **[フロントエンド統合](./FRONTEND_INTEGRATION.md)** - UI/UX連携ガイド

## 🙋‍♂️ サポート

問題や質問がある場合は、[GitHub Issues](https://github.com/NekoyaJolly/mycats/issues)を作成してください。

---

**最終更新**: 2025年8月15日  
**プロジェクト状態**: アクティブ開発中  
**主要バージョン**: フロントエンド（Next.js 15.4.5 + React 19.1.0）、バックエンド（NestJS 10 + Prisma 6.14.0）
