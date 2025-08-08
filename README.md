# 🐱 猫生体管理システム

フロントエンド (Next.js + Mantine UI) とバックエンド (NestJS + Prisma) を組み合わせた包括的な猫生体管理アプリケーションです。

## 📋 目次

- [機能概要](#機能概要)
- [技術スタック](#技術スタック)
- [プロジェクト構成](#プロジェクト構成)
- [データベース設計](#データベース設計)
- [セットアップ](#セットアップ)
- [開発環境の起動](#開発環境の起動)
- [テスト](#テスト)
- [CI/CD](#cicd)
- [モバイル対応](#モバイル対応)

## 🎯 機能概要

### ✅ 実装済み機能

1. **ホーム画面** (`/`)
   - 在舎猫一覧とダッシュボード
   - 検索・フィルタリング機能

2. **子猫管理** (`/kittens`)
   - 子猫一覧と詳細表示
   - 母猫別のグループ表示
   - ケアスケジュール管理
   - タグによるフィルタリング

3. **交配管理** (`/breeding`)
   - 交配記録の管理
   - 出産予定管理

4. **ケアスケジュール** (`/care`)
   - 本日・今週・遅延中のケア表示
   - ワクチン・駆虫・健康診断の管理

5. **タグ管理** (`/tags`)
   - カテゴリ別タグ管理
   - カスタムタグ作成
   - カラーパレット対応

6. **その他機能** (`/more`)
   - 各種設定へのナビゲーション
   - システム情報表示

### 🚧 開発予定機能

- 血統書管理
- 医療記録の詳細管理
- レポート機能
- データエクスポート/インポート

## 🛠 技術スタック

### フロントエンド
- **フレームワーク**: Next.js (React + TypeScript)
- **UIデザイン**: Tailwind CSS、
- **認証**: Clerk
- **状態管理**: React Context

### バックエンド
- **フレームワーク**: NestJS (TypeScript)
- **ORM**: Prisma
- **認証**: JWT + Clerk
- **API**: REST API + Swagger documentation

### データベース・インフラ
- **データベース**: PostgreSQL 15
- **ORM**: Prisma

## 📁 プロジェクト構造

```
cat-management-system/
├── cat-ui-test/            # フロントエンド (Next.js)
├── backend/                # API サーバー (NestJS)
├── package.json            # npm scripts統合管理
├── .env                    # 開発環境変数
└── README.md               # このファイル
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

- Node.js 18+ がインストールされていること
- PostgreSQL がインストールされていること  
- Git がインストールされていること

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd cat-management-system
```

### 2. 環境変数の設定

`.env`ファイルを編集して、必要な環境変数を設定してください：

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/catmanagement"

# JWT Configuration
JWT_SECRET=your-jwt-secret

# API Configuration
PORT=3004
```

### 3. 開発環境の起動

```bash
# 依存関係をインストール
npm run backend:install
npm run frontend:install

# 開発環境を起動
npm run dev
```

### 4. アプリケーションへのアクセス

- **フロントエンド**: <http://localhost:3000>
- **バックエンドAPI**: <http://localhost:3004>
- **API Documentation**: <http://localhost:3004/api/docs>

## 🔧 利用可能なコマンド

### 基本操作

```bash
npm run dev              # 開発環境を起動
npm start                # 開発環境を起動 (devのエイリアス)
npm run help             # 利用可能なコマンド一覧
```

### バックエンド管理

```bash
npm run backend:dev      # バックエンドサーバーを起動
npm run backend:install  # バックエンドの依存関係をインストール
```

### データベース管理
```bash
npm run db:migrate       # データベースマイグレーション
npm run db:generate      # Prismaクライアント生成
npm run db:seed         # サンプルデータを投入
npm run db:studio       # Prisma Studio (データベースGUI)
npm run db:logs         # データベースログ表示
npm run db:shell        # PostgreSQLシェル接続
```

### テスト・確認
```bash
npm run test:health     # ヘルスチェック
npm run test:api        # API動作確認
```

### 本番環境
```bash
npm run production       # 本番環境を起動
npm run production:stop  # 本番環境を停止
```

## 🗄️ データベース管理

### マイグレーション
```bash
npm run db:migrate
```

### サンプルデータの投入
```bash
npm run db:seed
```

### Prisma Studio（データベースGUI）
```bash
npm run db:studio
```

### データベース直接接続
```bash
npm run db:studio
```

## 🔒 セキュリティ

- **認証**: JWT による認証・認可
- **CORS**: 開発・本番環境別の設定
- **Input Validation**: NestJSでのバリデーション
- **Type Safety**: TypeScript による型安全性

## 📝 API ドキュメント

Swagger UIが自動生成されます：

- 開発環境: <http://localhost:3004/api/docs>

## 🚢 本番環境デプロイ

### 1. 本番環境変数の設定

`.env.production`ファイルを作成し、本番用の設定を行ってください。

### 2. アプリケーションのビルド

```bash
npm run frontend:build
npm run backend:build
```

### 3. 本番環境での起動

```bash
npm run frontend:start
npm run backend:start
```

## 🔍 トラブルシューティング

### よくある問題

1. **ポートが既に使用されている**

   ```bash
   # 使用中のポートを確認 (macOS/Linux)
   lsof -i :3000
   
   # プロセスを終了
   kill -9 <PID>
   ```

2. **データベース接続エラー**

   ```bash
   # PostgreSQLサービスの状態確認
   brew services list | grep postgresql
   
   # PostgreSQLを起動
   brew services start postgresql
   ```

3. **依存関係の問題**

   ```bash
   # node_modulesを再インストール
   rm -rf node_modules package-lock.json
   npm install
   ```

### ログの確認

アプリケーションが正常に動作しない場合は、コンソールログを確認してください：

- **バックエンド**: サーバー起動時のターミナル出力
- **フロントエンド**: ブラウザの開発者ツール（Console）

## 🤝 開発への参加

1. フォークしてクローン
2. フィーチャーブランチを作成
3. 変更をコミット
4. プルリクエストを作成

### 開発ワークフロー

```bash
# 1. 依存関係のインストールと開発環境起動
npm run dev

# 2. データベースの初期化
npm run db:migrate
npm run db:seed

# 3. 開発開始
# ファイルを編集すると自動的にホットリロードされます

# 4. API動作確認
npm run test:health
npm run test:api

# 5. テストの実行
cd backend
npm run test
```

## 📄 ライセンス

MIT License

## 🙋‍♂️ サポート

問題や質問がある場合は、Issueを作成してください。

---

**注意**: このシステムは開発中です。本番環境での使用前に、セキュリティ設定の見直しを行ってください。
