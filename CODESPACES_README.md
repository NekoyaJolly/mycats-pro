# 🐱 Cat Management System - Codespaces Ready

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/NekoyaJolly/cat-management-system?quickstart=1)

このリポジトリは **GitHub Codespaces** で即座に開発を開始できるよう設計されています。

## 🚀 クイックスタート (Codespaces)

### 1. Codespacesで開く
- 上記の「Open in GitHub Codespaces」バッジをクリック
- または GitHub リポジトリページで「Code > Codespaces > Create codespace」

### 2. 自動セットアップ
Codespaces起動時に自動で以下が実行されます：
- 必要な依存関係のインストール
- 環境変数ファイルの作成  
- データベースセットアップ
- 開発環境の準備

### 3. アプリケーション起動
```bash
# すべてのサービスを Docker で起動
npm run dev

# または、ネイティブ開発環境で起動
npm run dev:native
```

## 📦 技術スタック

### フロントエンド
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**  
- **Chakra UI v3**

### バックエンド
- **NestJS**
- **TypeScript**
- **Prisma** (ORM)
- **PostgreSQL**

### 開発環境
- **GitHub Codespaces**
- **Docker Compose**
- **VS Code Extensions**

## 🔧 利用可能なコマンド

### 開発用
```bash
# Docker で全サービス起動
npm run dev

# ネイティブ開発環境で起動
npm run dev:native

# フロントエンドのみ (Cat Management)
npm run frontend:dev:cat

# バックエンド API のみ
npm run backend:dev
```

### データベース操作
```bash
# Prisma Client 生成
npm run db:generate

# マイグレーション実行
npm run db:migrate  

# データベースシード
npm run db:seed

# Prisma Studio 起動
npm run db:studio
```

### ユーティリティ
```bash
# 全依存関係インストール
npm run frontend:install:all

# ヘルスチェック
npm run test:health

# Docker クリーンアップ
npm run clean
```

## 🌐 アクセスポート

Codespaces では以下のポートが自動転送されます：

- **3000**: Cat Management Frontend
- **3001**: Backend API  
- **3002**: New Pedigree Frontend
- **5432**: PostgreSQL Database
- **6379**: Redis Cache

## 📝 環境変数

セットアップスクリプトが自動で以下の環境ファイルを作成します：

- `backend/.env` - バックエンド設定
- `cat-management/.env.local` - フロントエンド設定
- `new-pedigree/.env.local` - 新血統書アプリ設定

## 🛠️ VS Code 拡張機能

Codespaces には以下の拡張機能が自動インストールされます：

- TypeScript 言語サポート
- Prettier (コードフォーマッター)
- Tailwind CSS IntelliSense
- Prisma 言語サポート
- ESLint
- GitHub Copilot
- Auto Rename Tag

## 📁 プロジェクト構造

```
cat-management-system/
├── .devcontainer/           # Codespaces 設定
│   ├── devcontainer.json   # Dev Container 設定
│   └── setup.sh            # 自動セットアップスクリプト
├── .vscode/                 # VS Code 設定
├── backend/                 # NestJS API
├── cat-management/          # メイン Next.js アプリ
├── new-pedigree/           # 新血統書アプリ
├── docker-compose.yml      # Docker 設定
└── package.json            # ワークスペース設定
```

## 🔄 開発ワークフロー

1. **Codespaces 起動**: 自動セットアップ完了まで待機
2. **アプリ起動**: `npm run dev` または `npm run dev:native`  
3. **開発**: ブラウザでフロントエンド確認
4. **API テスト**: Postman や curl でバックエンド確認
5. **データベース**: Prisma Studio でデータ確認

## 🆘 トラブルシューティング

### セットアップエラー
```bash
# セットアップスクリプト再実行
bash .devcontainer/setup.sh
```

### 依存関係エラー
```bash
# 全依存関係再インストール
rm -rf node_modules */node_modules
npm run frontend:install:all
```

### ポートエラー
- Codespaces の「PORTS」タブで転送設定確認
- 必要に応じてポートを手動で公開

## 📚 追加リソース

- [CODESPACES_INFO.md](./CODESPACES_INFO.md) - 詳細コマンドリファレンス
- [GitHub Codespaces ドキュメント](https://docs.github.com/codespaces)
- [Next.js ドキュメント](https://nextjs.org/docs)
- [NestJS ドキュメント](https://docs.nestjs.com)

---

🐱 **Happy Coding in Codespaces!** ✨
