# セットアップスクリプトの選択肢比較と最終決定

## 🎯 最終決定: Native Development + npm scripts採用

**2025年8月5日更新**: プロジェクトは **Native Development** + **npm scripts** アプローチに統一されました。

### 採用理由：
1. **シンプルさ** - ローカル開発環境での直接実行
2. **デバッグ容易性** - IDEとの統合、ホットリロード
3. **学習コストゼロ** - 標準的なnpm/node.js開発フロー
4. **クロスプラットフォーム対応** - Windows/Mac/Linux で同じコマンド
5. **パフォーマンス** - コンテナオーバーヘッドなし

### 実装された npm scripts:

```json
{
  "scripts": {
    "dev": "run-p backend:dev frontend:dev",
    "backend:dev": "cd backend && PORT=3004 npm run start:dev",
    "frontend:dev": "cd cat-ui-test && npm run dev",
    "backend:build": "cd backend && npm run build",
    "frontend:build": "cd cat-ui-test && npm run build",
    "backend:start": "cd backend && npm run start",
    "frontend:start": "cd cat-ui-test && npm run start",
    "test:backend": "cd backend && npm test",
    "test:frontend": "cd cat-ui-test && npm test",
    "db:migrate": "cd backend && npm run prisma:migrate",
    "db:generate": "cd backend && npm run prisma:generate",
    "db:seed": "cd backend && npm run seed",
    "db:studio": "cd backend && npm run prisma:studio",
    "install:all": "npm install && cd backend && npm install && cd ../cat-ui-test && npm install"
  }
}
```

---

## アクセス情報

### Frontend (Next.js)
- URL: http://localhost:3000
- 血統書管理UI
- Hot Reload対応

### Backend (NestJS API)
- URL: http://localhost:3004
- API ドキュメント: http://localhost:3004/api
- Swagger UI で API テスト可能

### Database (PostgreSQL)
- Host: localhost:5432
- Database: catmanagement
- Prisma Studio: `npm run db:studio`

---

## 使用方法

```bash
# 全体開発環境の起動
npm run dev

# 個別サービス起動
npm run backend:dev    # バックエンドのみ
npm run frontend:dev   # フロントエンドのみ

# データベース操作
npm run db:migrate     # マイグレーション実行
npm run db:generate    # Prismaクライアント生成
npm run db:seed        # テストデータ投入
npm run db:studio      # Prisma Studio起動

# ビルド・テスト
npm run backend:build  # バックエンドビルド
npm run frontend:build # フロントエンドビルド
npm run test:backend   # バックエンドテスト
npm run test:frontend  # フロントエンドテスト

# 一括依存関係インストール
npm run install:all    # 全プロジェクトのnpm install
```

この決定により、Docker不要の統一されたネイティブ開発環境が実現されました。
