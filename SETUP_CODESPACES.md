# 🐱 Codespacesネイティブ環境セットアップ

Dockerを使わず、Codespaces上で直接開発環境を構築する手順です。

## 🎯 メリット
- **高速**: 仮想化の二重構造を回避
- **軽量**: リソース消費を大幅削減
- **シンプル**: 依存関係が少ない

## 🛠️ 必要なサービス

### 1. PostgreSQL
```bash
# PostgreSQLインストール・起動
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo service postgresql start

# データベース・ユーザー作成
sudo -u postgres psql -c "CREATE USER catuser WITH PASSWORD 'catpassword123';"
sudo -u postgres psql -c "CREATE DATABASE catmanagement OWNER catuser;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE catmanagement TO catuser;"
```

### 2. Redis
```bash
# Redisインストール・起動
sudo apt install -y redis-server
sudo service redis-server start
```

### 3. 環境変数設定
```bash
# .env.local作成
cat > .env.local << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://catuser:catpassword123@localhost:5432/catmanagement?schema=public"
POSTGRES_USER=catuser
POSTGRES_PASSWORD=catpassword123
POSTGRES_DB=catmanagement

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-change-this-in-production

# Clerk Authentication (開発用)
CLERK_SECRET_KEY=sk_test_dummy_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dummy_key

# API Configuration
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NODE_ENV=development
PORT=3001
EOF
```

## 🚀 開発サーバー起動

### バックエンド (NestJS)
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed
npm run start:dev
```

### フロントエンド
```bash
# Cat Management
cd cat-management
npm install
npm run dev

# New Pedigree (別ターミナル)
cd new-pedigree
npm install
npm run dev
```

## 📊 サービス管理用スクリプト

### package.jsonに追加
```json
{
  "scripts": {
    "services:start": "run-p services:postgres services:redis",
    "services:postgres": "sudo service postgresql start",
    "services:redis": "sudo service redis-server start",
    "services:stop": "run-p services:postgres:stop services:redis:stop",
    "services:postgres:stop": "sudo service postgresql stop",
    "services:redis:stop": "sudo service redis-server stop",
    "services:status": "run-p services:postgres:status services:redis:status",
    "services:postgres:status": "sudo service postgresql status",
    "services:redis:status": "sudo service redis-server status"
  }
}
```

## 🌐 アクセスURL

開発サーバー起動後：
- **Cat Management**: http://localhost:3000
- **New Pedigree**: http://localhost:3002
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

## 🔧 よく使うコマンド

```bash
# 全サービス起動
npm run services:start

# 開発環境起動
npm run dev:native

# データベース操作
npm run db:studio
npm run db:seed

# サービス状態確認
npm run services:status
```

## 🐛 トラブルシューティング

### PostgreSQL接続エラー
```bash
# サービス状態確認
sudo service postgresql status

# 手動起動
sudo service postgresql start

# 接続テスト
psql -h localhost -U catuser -d catmanagement
```

### Redis接続エラー
```bash
# サービス状態確認
sudo service redis-server status

# 手動起動
sudo service redis-server start

# 接続テスト
redis-cli ping
```

---

**💡 ヒント**: このファイルをCodespacesの起動時に自動実行するように設定可能
