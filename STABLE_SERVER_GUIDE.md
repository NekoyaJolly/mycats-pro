# 安定版サーバー起動ガイド

## 概要

このプロジェクトには、開発サーバーを安定して起動・管理するためのスクリプトが用意されています。
通常の `pnpm run dev` では Ctrl+C で簡単に停止してしまう問題がありましたが、これらのスクリプトを使用することで、バックグラウンドで安定してサーバーを稼働させることができます。

## 利用可能なコマンド

### 1. サーバーの起動（安定版）

```bash
pnpm run dev:stable
# または直接実行
./scripts/start-dev-stable.sh
```

**機能:**
- バックエンド（port 3004）とフロントエンド（port 3000）を**バックグラウンド**で起動
- 各プロセスのPIDをファイルに保存（`backend.pid`, `frontend.pid`）
- ログをファイルに出力（`backend.out`, `backend.log`, `frontend.out`, `frontend.log`）
- Ctrl+C の影響を受けない
- 起動時にヘルスチェックを実行

**出力例:**
```
🚀 Starting MyCats Development Environment (Stable Mode)
========================================================

🧹 Cleaning up ports...
🔧 Starting backend server...
   Backend PID: 82584
   Logs: backend.out / backend.log

⏳ Waiting for backend to start...
✅ Backend is ready!

🎨 Starting frontend server...
   Frontend PID: 83222
   Logs: frontend.out / frontend.log

✅ Development servers are running!

📍 URLs:
   Backend:  http://localhost:3004
   Frontend: http://localhost:3000
   API Docs: http://localhost:3004/api/docs
   Health:   http://localhost:3004/health
```

### 2. サーバーの停止

```bash
pnpm run dev:stop
# または直接実行
./scripts/stop-dev.sh
```

**機能:**
- PIDファイルを読み込んで、バックエンドとフロントエンドのプロセスを停止
- ポートのクリーンアップも実行

### 3. ヘルスチェック

```bash
pnpm run dev:health
# または直接実行
./scripts/health-check.sh
```

**機能:**
- バックエンドとフロントエンドの稼働状況を確認
- プロセスIDの確認
- エンドポイントへの接続テスト

**出力例:**
```
🏥 MyCats Development Servers Health Check
==========================================

Backend Server:
Checking Backend...
  ✅ Process running (PID: 82584)
  ✅ Service responding at http://localhost:3004/health

Frontend Server:
Checking Frontend...
  ✅ Process running (PID: 83222)
  ✅ Service responding at http://localhost:3000

==========================================
✅ All services are healthy
```

### 4. ログの確認

リアルタイムでログを確認:

```bash
# バックエンドのログ（通常出力）
tail -f backend.out

# バックエンドのログ（エラー出力）
tail -f backend.log

# フロントエンドのログ（通常出力）
tail -f frontend.out

# フロントエンドのログ（エラー出力）
tail -f frontend.log
```

ログファイルの最後の行を表示:

```bash
# バックエンドの最新ログ
tail -20 backend.out

# フロントエンドの最新ログ
tail -20 frontend.out
```

## 使用シナリオ

### シナリオ 1: 通常の開発作業

```bash
# 1. サーバーを起動
pnpm run dev:stable

# 2. 開発作業を進める（サーバーは停止しない）

# 3. 必要に応じてヘルスチェック
pnpm run dev:health

# 4. 作業終了時にサーバーを停止
pnpm run dev:stop
```

### シナリオ 2: トラブルシューティング

```bash
# 1. ヘルスチェックで問題を確認
pnpm run dev:health

# 2. ログを確認
tail -50 backend.log

# 3. サーバーを再起動
pnpm run dev:stop
pnpm run dev:stable
```

### シナリオ 3: 長時間の実行

```bash
# 1. サーバーを起動
pnpm run dev:stable

# 2. ターミナルを閉じてもOK（プロセスはバックグラウンドで継続）

# 3. 後で別のターミナルから状態を確認
pnpm run dev:health
```

## トラブルシューティング

### サーバーが起動しない

```bash
# 1. 診断ツールを実行
pnpm run diagnose

# 2. ポートが使用されているか確認
lsof -i :3004 -i :3000

# 3. 古いプロセスをクリーンアップ
pnpm run dev:stop
pnpm run predev

# 4. 再起動
pnpm run dev:stable
```

### ログが見つからない

ログファイルは以下の場所に保存されます:
- `/Users/nekoya/mycats/backend.out`
- `/Users/nekoya/mycats/backend.log`
- `/Users/nekoya/mycats/frontend.out`
- `/Users/nekoya/mycats/frontend.log`

### プロセスが残っている

```bash
# PIDファイルを確認
cat backend.pid
cat frontend.pid

# 手動でプロセスを停止
kill $(cat backend.pid) $(cat frontend.pid)

# または強制停止
kill -9 $(cat backend.pid) $(cat frontend.pid)
```

## 従来の起動方法との違い

| 機能 | `pnpm run dev` | `pnpm run dev:stable` |
|------|----------------|----------------------|
| 実行方式 | フォアグラウンド | バックグラウンド |
| Ctrl+C の影響 | 停止する | 影響なし |
| ログ出力 | ターミナルに表示 | ファイルに保存 |
| プロセス管理 | 難しい | PIDファイルで管理 |
| ターミナルを閉じる | 停止する | 継続する |
| 適用場面 | 短時間の開発 | 長時間の開発 |

## 注意事項

1. **PIDファイルの管理**: `backend.pid` と `frontend.pid` ファイルは自動的に作成・削除されますが、異常終了した場合は手動で削除が必要な場合があります。

2. **ログファイルのサイズ**: ログファイルは自動的にローテーションされません。定期的に確認・削除してください。

3. **ポートの競合**: 既に 3004 または 3000 ポートが使用されている場合は、`pnpm run predev` でクリーンアップしてください。

## スクリプトファイル

- `scripts/start-dev-stable.sh` - 安定版サーバー起動スクリプト
- `scripts/stop-dev.sh` - サーバー停止スクリプト
- `scripts/health-check.sh` - ヘルスチェックスクリプト

すべてのスクリプトは実行権限が付与されています（`chmod +x` 済み）。

## まとめ

安定版スクリプトを使用することで、開発サーバーを確実に起動し、長時間稼働させることができます。従来の `pnpm run dev` でCtrl+Cによる予期しない停止が発生していた問題が解決されました。
