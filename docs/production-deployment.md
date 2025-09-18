# 🚀 本番環境デプロイガイド

猫生体管理システムを本番環境にデプロイするための手順書です。

## 📋 デプロイ前チェックリスト

### ✅ セキュリティ要件

- [ ] 全依存関係を最新の安全なバージョンに更新
- [ ] 環境変数が適切に設定されている
- [ ] CORSオリジンが本番ドメインのみに制限されている
- [ ] JWTシークレットが十分に強力（32文字以上）
- [ ] データベース認証情報が安全
- [ ] HTTPSが強制されている
- [ ] セキュリティヘッダーが有効

### ✅ インフラ要件

- [ ] Node.js 20.x または 22.x がインストール済み
- [ ] PostgreSQL 15+ が稼働中でアクセス可能
- [ ] リバースプロキシ (nginx) が設定済み
- [ ] SSL証明書がインストール済み
- [ ] ファイアウォールルールが設定済み
- [ ] 監視ツールがセットアップ済み

## 🔧 環境設定

1. **本番環境設定ファイルの作成**:

   ```bash
   cp .env.production.example .env.production
   ```

2. **必要な変数の設定**:

   ```bash
   # データベース
   DATABASE_URL="postgresql://user:password@host:5432/mycats_prod"

   # セキュリティ
   JWT_SECRET="your-256-bit-production-secret-key-here"
   NODE_ENV=production

   # ネットワーク
   PORT=3004
   CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com"

   # ヘルスチェック
   HEALTH_CHECK_DATABASE=true
   ```

3. **設定の検証**:
   ```bash
   node -e "
   require('dotenv').config({ path: '.env.production' });
   const { validateProductionEnvironment } = require('./backend/dist/common/environment.validation');
   try {
     validateProductionEnvironment();
     console.log('✅ 環境設定の検証に成功しました');
   } catch (error) {
     console.error('❌ 環境設定の検証に失敗しました:', error.message);
     process.exit(1);
   }
   "
   ```

## 🏗️ ビルドプロセス

1. **本番ビルドの実行**:

   ```bash
   pnpm install --frozen-lockfile
   pnpm -w run db:generate
   pnpm run build
   ```

2. **データベースマイグレーションの適用**:

   ```bash
   pnpm -w run db:deploy
   ```

3. **ビルド成果物の確認**:
   ```bash
   ls -la backend/dist/
   ls -la frontend/.next/
   ```

## 🚀 デプロイ手順

### 1. デプロイ前検証

```bash
# セキュリティ監査
pnpm audit --audit-level moderate

# ヘルスチェックエンドポイントのテスト
curl -f http://localhost:3004/health || echo "ヘルスチェックに失敗しました"

# データベース接続テスト
pnpm -w run test:api
```

### 2. アプリケーション起動

```bash
# バックエンドの起動（本番モード）
cd backend && NODE_ENV=production node dist/main.js

# フロントエンドの起動（本番モード）
cd frontend && npm run start
```

### 3. デプロイ後検証

```bash
# APIが応答することを確認
curl -f https://yourdomain.com/health

# アプリケーションログの確認
tail -f logs/application.log

# システムリソースの監視
htop
```

## 🔒 セキュリティ強化

### 1. Nginx設定

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # セキュリティヘッダー
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    # レート制限
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3004;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. ファイアウォール設定

```bash
# 必要なポートのみを許可
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP (リダイレクト)
ufw allow 443/tcp  # HTTPS
ufw enable
```

## 📊 監視設定

### 1. アプリケーション監視

```bash
# ヘルスチェック用cronジョブ
echo "*/5 * * * * curl -f https://yourdomain.com/health || echo 'ヘルスチェック失敗' | mail -s 'API ヘルス アラート' admin@yourdomain.com" | crontab -
```

### 2. ログ監視

```bash
# アプリケーションログ
tail -f /var/log/mycats/application.log

# アクセスログ
tail -f /var/log/nginx/access.log

# エラーログ
tail -f /var/log/nginx/error.log
```

## 🔄 メンテナンス手順

### 1. アップデートとパッチ

```bash
# セキュリティアップデート
pnpm audit
pnpm update

# リビルドと再デプロイ
pnpm run build
```

### 2. データベースメンテナンス

```bash
# データベースバックアップ
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 新しいマイグレーションの適用
pnpm -w run db:deploy
```

### 3. ログローテーション

```bash
# アプリケーションログ用のlogrotate設定
cat > /etc/logrotate.d/mycats << EOF
/var/log/mycats/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 www-data www-data
    sharedscripts
    postrotate
        systemctl reload nginx
    endscript
}
EOF
```

## 🚨 インシデント対応

### 1. アプリケーションが起動しない場合

```bash
# ログの確認
journalctl -u mycats-api -n 50

# 環境変数の確認
env | grep -E "(DATABASE_URL|JWT_SECRET|NODE_ENV)"

# データベース接続テスト
psql $DATABASE_URL -c "SELECT 1"
```

### 2. メモリ使用量が高い場合

```bash
# メモリ使用量の確認
free -h
ps aux --sort=-%mem | head -10

# 必要に応じてサービス再起動
systemctl restart mycats-api
systemctl restart nginx
```

### 3. データベース接続問題

```bash
# PostgreSQLステータス確認
systemctl status postgresql

# 接続数制限の確認
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# 必要に応じて接続リセット
systemctl restart postgresql
```

## 📞 サポート連絡先

- **テクニカルリード**: [連絡先情報]
- **データベース管理者**: [連絡先情報]
- **DevOpsチーム**: [連絡先情報]

## 📚 関連リソース

- [システム設計書](./system-design.md)
- [運用手順書](./operations.md)
- [API仕様書](./api-specification.md)
- [トラブルシューティングガイド](./troubleshooting.md)

---

**最終更新**: 2025年1月14日  
**管理者**: 開発チーム

- [API Documentation](./docs/api-specification.md)
- [Troubleshooting Guide](./docs/troubleshooting.md)
