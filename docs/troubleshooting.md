# 🔧 トラブルシューティングガイド

猫生体管理システムでよく発生する問題の解決方法をまとめています。

## 📋 目次

- [開発環境の問題](#開発環境の問題)
- [データベース関連](#データベース関連)
- [ビルド・デプロイ関連](#ビルドデプロイ関連)
- [本番環境の問題](#本番環境の問題)
- [パフォーマンス問題](#パフォーマンス問題)

## 開発環境の問題

### 1. ポートが既に使用されている

**症状:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**解決方法:**

```bash
# 使用中のポートを確認
lsof -i :3000
lsof -i :3004

# プロセスを終了
kill -9 <PID>

# または、プロジェクトのスクリプトを使用
npm run predev  # ポート3000, 3004をクリア
```

### 2. 依存関係のインストールエラー

**症状:**

```
npm ERR! peer dep missing
```

**解決方法:**

```bash
# node_modules を削除して再インストール
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# または workspace 全体をクリーンアップ
pnpm store prune
pnpm install:all
```

### 3. TypeScript型エラー

**症状:**

```
Type 'X' is not assignable to type 'Y'
```

**解決方法:**

```bash
# Prismaクライアントの再生成
pnpm -w run db:generate

# TypeScriptサーバーのリスタート（VSCode）
Ctrl+Shift+P > "TypeScript: Restart TS Server"

# 型チェック実行
pnpm --filter backend run type-check
pnpm --filter frontend run type-check
```

## データベース関連

### 1. データベース接続エラー

**症状:**

```
Error: Can't reach database server
```

**解決方法:**

```bash
# PostgreSQLサービスの状態確認
brew services list | grep postgresql
systemctl status postgresql  # Linux

# PostgreSQLを起動
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux

# 接続テスト
psql $DATABASE_URL -c "SELECT 1"
pnpm run test:health
```

### 2. マイグレーションエラー

**症状:**

```
Migration failed to apply
```

**解決方法:**

```bash
# マイグレーション状態の確認
cd backend && npx prisma migrate status

# マイグレーションのリセット（開発環境のみ）
npx prisma migrate reset

# 手動でマイグレーション適用
npx prisma migrate deploy

# Prismaクライアント再生成
npx prisma generate
```

### 3. データベースロックエラー

**症状:**

```
database is locked
```

**解決方法:**

```bash
# アクティブな接続を確認
psql $DATABASE_URL -c "SELECT pid, usename, application_name, state FROM pg_stat_activity;"

# 必要に応じて接続を終了
psql $DATABASE_URL -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE application_name = 'your_app';"
```

## ビルド・デプロイ関連

### 1. ビルドが失敗する

**症状:**

```
Build failed with errors
```

**解決方法:**

```bash
# 依存関係の確認
pnpm install --frozen-lockfile

# Prismaクライアント生成
pnpm -w run db:generate

# 個別にビルド
pnpm --filter backend run build
pnpm --filter frontend run build

# 詳細なエラーログを確認
pnpm run build 2>&1 | tee build.log
```

### 2. E2Eテストが失敗する

**症状:**

```
E2E tests timing out
```

**解決方法:**

```bash
# テスト用データベースの確認
psql $DATABASE_URL -c "SELECT count(*) FROM \"User\";"

# Prismaエンジンクリーンアップ
rm -rf node_modules/.prisma
rm -rf backend/node_modules/.prisma

# Prismaクライアント再生成
cd backend && PRISMA_CLIENT_ENGINE_TYPE=library pnpm exec prisma generate

# テスト実行
pnpm --filter backend run test:e2e
```

### 3. GitHub Actions CI失敗

**解決方法:**

```bash
# ローカルで同じ環境を再現
export NODE_VERSION=20
export PNPM_VERSION=9

# セキュリティスキャン
npx trivy fs --severity CRITICAL .

# Lintチェック
pnpm --filter backend run lint -- --max-warnings=300
pnpm --filter frontend run lint
```

## 本番環境の問題

### 1. アプリケーションが起動しない

**診断手順:**

```bash
# ログの確認
journalctl -u mycats-api -n 50

# 環境変数の確認
env | grep -E "(DATABASE_URL|JWT_SECRET|NODE_ENV)"

# ポートの確認
netstat -tlnp | grep :3004

# ディスク容量の確認
df -h
```

**解決方法:**

```bash
# 設定検証
node -e "
const { validateProductionEnvironment } = require('./backend/dist/common/environment.validation');
validateProductionEnvironment();
"

# サービス再起動
systemctl restart mycats-api
systemctl restart nginx
```

### 2. 502 Bad Gateway エラー

**原因と解決:**

```bash
# バックエンドサービス確認
curl -f http://localhost:3004/health

# Nginxエラーログ確認
tail -f /var/log/nginx/error.log

# プロキシ設定確認
nginx -t
systemctl reload nginx
```

### 3. データベース接続プール枯渇

**診断:**

```bash
# 接続数確認
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# 設定確認
psql $DATABASE_URL -c "SHOW max_connections;"
```

**解決:**

```bash
# アプリケーション再起動
systemctl restart mycats-api

# 必要に応じてPostgreSQL再起動
systemctl restart postgresql
```

## パフォーマンス問題

### 1. APIレスポンスが遅い

**診断:**

```bash
# レスポンス時間測定
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3004/api/v1/pedigrees"

# データベースクエリ分析
psql $DATABASE_URL -c "SELECT query, calls, total_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

**最適化:**

```bash
# インデックス確認
psql $DATABASE_URL -c "\d+ pedigrees"

# Prismaクエリ最適化
# docs/prisma-query-improvement.md を参照
```

### 2. フロントエンドが重い

**最適化手順:**

```bash
# バンドルサイズ分析
pnpm --filter frontend run build
npx @next/bundle-analyzer

# 画像最適化確認
find frontend/public -name "*.jpg" -o -name "*.png" | xargs ls -lh
```

### 3. メモリリーク

**診断:**

```bash
# メモリ使用量監視
free -h
ps aux --sort=-%mem | head -10

# Node.jsヒープダンプ
kill -USR2 <node_pid>
```

## 🆘 緊急時対応

### システム完全停止時

1. **即座にロールバック**:

   ```bash
   git checkout <previous_stable_commit>
   pnpm run build
   systemctl restart mycats-api
   ```

2. **データベースバックアップから復旧**:

   ```bash
   psql $DATABASE_URL < backup_latest.sql
   ```

3. **ステータスページ更新**:
   - 利用者への通知
   - 復旧予定時間の共有

### 連絡先

- **緊急時対応**: [連絡先]
- **技術サポート**: [連絡先]
- **DevOpsチーム**: [連絡先]

---

**最終更新**: 2025年1月14日  
**管理者**: 開発チーム
