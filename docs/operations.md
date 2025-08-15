# 🚀 運用手順書

## 📋 運用概要

**システム名**: 猫生体管理システム (My Cats)  
**運用環境**: 開発・ステージング・本番  
**運用体制**: 24時間365日（自動監視）+ 平日サポート

## 🏗️ デプロイメント手順

### 事前準備

#### 必要な環境変数

```bash
# 本番環境設定例
DATABASE_URL="postgresql://user:pass@prod-db:5432/mycats"
JWT_SECRET="production-secret-key-256bit"
PORT=3004
NODE_ENV=production
CORS_ORIGIN="https://mycats.example.com"
```

#### 依存関係の確認

```bash
# Node.jsバージョン確認
node --version  # 20.x または 22.x

# PostgreSQLバージョン確認
psql --version  # 15.x 以上
```

### 本番デプロイ手順

#### 1. コードの準備

```bash
# 1. 最新コードの取得
git pull origin main

# 2. 依存関係のインストール（ワークスペース全体）
pnpm install

# 3. Prismaクライアント生成
pnpm -w run db:generate

# 4. データベーススキーマ反映
#   - 本番: 既存に対しては deploy を使用
#   - 初期構築/開発: migrate を使用
pnpm -w run db:deploy

# 5. フロントエンドビルド
pnpm -w run frontend:build
```

#### 2. 本番環境の起動

```bash
# バックエンドサーバー起動
cd backend
pnpm run start:prod

# フロントエンドサーバー起動（別ターミナル）
cd frontend
pnpm run start
```

#### 3. 動作確認

```bash
# ヘルスチェック
curl -f http://localhost:3004/health

# フロントエンドアクセス確認
curl -f http://localhost:3000

# データベース接続確認
pnpm -w run test:api
```

### ローリングデプロイ（推奨）

#### Blue-Green デプロイメント

```bash
# 1. Green環境でビルド・テスト
pnpm -w run frontend:build
pnpm -w run test:health

# 2. ロードバランサーでトラフィック切り替え
# (実際の環境では nginx や ALB などで制御)

# 3. Blue環境の停止
# (旧バージョンのプロセス停止)
```

## 📊 監視・ヘルスチェック

### システム監視項目

| 項目             | 確認方法     | 正常値   | アラート条件 |
| ---------------- | ------------ | -------- | ------------ |
| API応答時間      | `/health`    | < 500ms  | > 3秒        |
| データベース接続 | `/health`    | 接続成功 | 接続失敗     |
| メモリ使用量     | システム監視 | < 80%    | > 90%        |
| CPU使用率        | システム監視 | < 70%    | > 85%        |
| ディスク使用量   | システム監視 | < 80%    | > 90%        |

### 自動ヘルスチェック

```bash
#!/bin/bash
# health-check.sh - 定期実行用スクリプト

# API ヘルスチェック
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3004/health)

if [ $HEALTH_STATUS -eq 200 ]; then
    echo "$(date): API Health OK"
else
    echo "$(date): API Health FAILED - Status: $HEALTH_STATUS"
    # アラート通知処理
    ./send-alert.sh "API Health Check Failed"
fi

# データベース接続チェック
DB_STATUS=$(pnpm -w run test:api 2>&1)
if [ $? -eq 0 ]; then
    echo "$(date): Database Connection OK"
else
    echo "$(date): Database Connection FAILED"
    ./send-alert.sh "Database Connection Failed"
fi
```

### ログ監視

```bash
# アプリケーションログの監視
tail -f backend/backend.log | grep -E "(ERROR|FATAL)"

# システムエラーログの監視
journalctl -u mycats-backend -f | grep -E "(error|failed)"

# 異常なアクセスパターンの監視
tail -f /var/log/nginx/access.log | grep -E "(40[0-9]|50[0-9])"
```

## 🔧 メンテナンス手順

### 定期メンテナンス（週次）

#### データベースメンテナンス

```bash
# 1. データベース統計情報更新
psql -d mycats -c "ANALYZE;"

# 2. 不要なログファイル削除
find ./logs -name "*.log" -mtime +30 -delete

# 3. データベースバックアップ
pg_dump mycats > backup/mycats_$(date +%Y%m%d).sql
```

#### キャッシュ・一時ファイル清理

```bash
# Next.jsビルドキャッシュ削除
rm -rf frontend/.next

# npm キャッシュ清理
npm cache clean --force

# 一時ファイル削除
find ./temp -type f -mtime +7 -delete
```

### 緊急メンテナンス

#### システム停止手順

```bash
# 1. ユーザー通知（可能であれば）
# メンテナンス画面の表示等

# 2. アプリケーション停止
pkill -f "npm run start"
pkill -f "next start"

# 3. データベース接続停止
systemctl stop postgresql
```

#### システム復旧手順

```bash
# 1. データベース起動
systemctl start postgresql

# 2. データ整合性確認
pnpm -w run db:deploy

# 3. アプリケーション起動
pnpm -w run dev  # または backendで pnpm run start:prod

# 4. 動作確認
npm run test:health
```

## 💾 バックアップ・復旧

### バックアップ戦略

#### 自動バックアップ（日次）

```bash
#!/bin/bash
# backup.sh - 日次バックアップスクリプト

BACKUP_DIR="/backup/mycats"
DATE=$(date +%Y%m%d_%H%M%S)

# データベースバックアップ
pg_dump mycats > "$BACKUP_DIR/db_$DATE.sql"

# アプリケーションファイルバックアップ
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=.next \
    /path/to/mycats/

# 古いバックアップ削除（30日以上前）
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

#### 復旧手順

```bash
# 1. アプリケーション停止
./stop-app.sh

# 2. データベース復旧
dropdb mycats
createdb mycats
psql mycats < backup/db_20250809_120000.sql

# 3. アプリケーションファイル復旧
tar -xzf backup/app_20250809_120000.tar.gz -C /

# 4. 依存関係再インストール
pnpm install

# 5. アプリケーション起動
./start-app.sh

# 6. 動作確認
pnpm -w run test:health
```

## 🔐 セキュリティ運用

### セキュリティチェック項目

#### 日次チェック

- [ ] 不正アクセスログの確認
- [ ] 異常なAPI呼び出しパターンの確認
- [ ] システムログのエラー確認

#### 週次チェック

- [ ] 依存関係の脆弱性スキャン
- [ ] セキュリティパッチの確認
- [ ] アクセス権限の確認

#### 月次チェック

- [ ] SSL証明書の有効期限確認
- [ ] パスワードポリシーの見直し
- [ ] セキュリティ監査ログの確認

### 脆弱性対応

```bash
# 依存関係の脆弱性チェック
npm audit

# 脆弱性の自動修正
npm audit fix

# 手動修正が必要な場合
npm audit fix --force
```

## 📈 パフォーマンス監視

### パフォーマンス指標

#### レスポンス時間監視

```bash
# API応答時間測定
curl -w "Response Time: %{time_total}s\n" -o /dev/null -s http://localhost:3004/api/v1/cats

# データベースクエリ性能監視
psql -d mycats -c "SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"
```

#### リソース使用量監視

```bash
# メモリ使用量
free -h

# CPU使用率
top -bn1 | grep "Cpu(s)"

# ディスク使用量
df -h

# プロセス別リソース使用量
ps aux | grep -E "(node|postgres)" | sort -k3 -nr
```

## 🚨 障害対応

### 障害分類・優先度

| 優先度 | 分類 | 対応時間    | 例                               |
| ------ | ---- | ----------- | -------------------------------- |
| P1     | 重大 | 1時間以内   | システム全停止、データ消失       |
| P2     | 高   | 4時間以内   | 主要機能停止、パフォーマンス劣化 |
| P3     | 中   | 1営業日以内 | 一部機能停止、軽微なバグ         |
| P4     | 低   | 1週間以内   | UI不具合、要望対応               |

### 障害対応フロー

#### 1. 障害検知

```bash
# 自動監視アラート
./monitor.sh

# 手動確認
npm run test:health
curl -f http://localhost:3000
```

#### 2. 緊急対応

```bash
# システム状態確認
systemctl status mycats-backend
systemctl status postgresql

# ログ確認
tail -100 backend/backend.log
journalctl -u mycats-backend --since "10 minutes ago"

# 必要に応じて再起動
systemctl restart mycats-backend
```

#### 3. 根本原因調査

- アプリケーションログの詳細分析
- データベースパフォーマンス分析
- インフラリソース使用状況確認
- コード変更履歴の確認

#### 4. 恒久対策

- コード修正・テスト
- 監視強化
- 運用手順の見直し

## 📝 運用ドキュメント管理

### ドキュメント更新ルール

1. **システム変更時**: 運用手順書の該当箇所を更新
2. **障害発生時**: 対応手順を記録・改善
3. **定期見直し**: 月次でドキュメントの妥当性確認

### 運用ログ記録

```bash
# 運用作業ログ
echo "$(date): Deployed version 1.2.3" >> operations.log
echo "$(date): Database maintenance completed" >> operations.log
echo "$(date): Security patch applied" >> operations.log
```

---

**文書バージョン**: 1.0  
**最終更新日**: 2025年8月15日  
**運用責任者**: システム管理者
