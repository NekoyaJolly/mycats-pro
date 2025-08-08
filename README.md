# 🐱 猫生体管理システム (My Cats)

フロントエンド (Next.js 15 + Mantine UI) とバックエンド (NestJS + Prisma) を組み合わせた包括的な猫生体管理アプリケーションです。血統書管理、交配記録、ケアスケジュール、健康管理などの機能を提供します。

## 📋 目次

- [🎯 機能概要](#-機能概要)
- [🛠 技術スタック](#-技術スタック)
- [📁 プロジェクト構造](#-プロジェクト構造)
- [🗄️ データベース設計](#️-データベース設計)
- [🚀 クイックスタート](#-クイックスタート)
- [🔧 利用可能なコマンド](#-利用可能なコマンド)
- [📊 ビルド・デプロイ](#-ビルドデプロイ)
- [🔍 トラブルシューティング](#🔍-トラブルシューティング)

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

- **フレームワーク**: NestJS (TypeScript)
- **ORM**: Prisma 5.22
- **認証**: JWT + Passport
- **API文書**: Swagger/OpenAPI
- **バリデーション**: Class Validator

### データベース・インフラ

- **データベース**: PostgreSQL 15
- **ORM**: Prisma
- **キャッシュ**: Redis (予定)

## 📁 プロジェクト構造

```text
appproject/
├── cat-ui-test/                # フロントエンド (Next.js 15)
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

本プロジェクトではPostgreSQLとPrisma ORMを使用してデータベースを管理しています。

### 📚 データベースドキュメント

- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - 詳細なテーブル構造とリレーション
- **[DATABASE_QUICK_REF.md](./DATABASE_QUICK_REF.md)** - 開発時のクイックリファレンス

### 🔗 主要テーブル

| テーブル名 | 概要 | 主要フィールド |
|-----------|------|---------------|
| `users` | ユーザー管理 | email, name, role |
| `cats` | 猫の基本情報 | name, birthDate, gender, breed |
| `breeds` | 猫種マスタ | name_ja, name_en, category |
| `pedigrees` | 血統情報 | cat, father, mother, generation |
| `breeding_records` | 交配記録 | mother, father, mating_date |
| `care_schedules` | ケアスケジュール | cat, care_type, scheduled_date |

### 🔄 主要リレーション

- **猫 ↔ 血統**: 1対1（各猫には1つの血統記録）
- **猫 ↔ 繁殖記録**: 1対多（1匹の猫が複数の交配に参加）
- **ユーザー ↔ 猫**: 1対多（1人のユーザーが複数の猫を管理）
- **猫 ↔ ケアスケジュール**: 1対多（1匹の猫に複数のケア予定）

### 📊 データベース接続情報

```bash
# 開発環境
DATABASE_URL="postgresql://postgres:password@localhost:5432/cat_management?schema=public"

# ヘルスチェック
curl http://localhost:3001/health
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

```bash
# 1. 環境変数の設定（.env.production）
# 2. データベースマイグレーション
npm run db:migrate

# 3. フロントエンドビルド
npm run frontend:build

# 4. 本番サーバー起動
npm run frontend:start
```

### ビルド成果物

- **フロントエンド**: `cat-ui-test/.next/`ディレクトリ
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
   rm -rf cat-ui-test/node_modules cat-ui-test/package-lock.json
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
   cd cat-ui-test
   npm install --legacy-peer-deps
   ```

### ログの確認

- **バックエンドログ**: ターミナル出力 または `backend/backend.log`
- **フロントエンドログ**: ブラウザの開発者ツール（Console）
- **データベースログ**: PostgreSQLのログファイル

### 推奨Node.jsバージョン

```bash
# 現在のバージョン確認
node --version
npm --version

# 推奨: Node.js 20.x（package.jsonで指定）
# 動作確認済み: Node.js 22.x
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
- **[データベース設計](./DATABASE_SCHEMA.md)** - ER図・テーブル設計
- **[クイックリファレンス](./DATABASE_QUICK_REF.md)** - 開発時の参照資料

### 🛠️ 開発ガイド
- **[開発環境構築](./DEVELOPMENT.md)** - 開発環境セットアップ
- **[セットアップオプション](./SETUP_OPTIONS.md)** - 詳細セットアップ手順
- **[フロントエンド統合](./FRONTEND_INTEGRATION.md)** - UI/UX連携ガイド

## 🙋‍♂️ サポート

問題や質問がある場合は、[GitHub Issues](https://github.com/NekoyaJolly/mycats/issues)を作成してください。

---

**最終更新**: 2025年8月9日  
**プロジェクト状態**: アクティブ開発中  
**主要バージョン**: フロントエンド（Next.js 15）、バックエンド（NestJS + Prisma 5）
