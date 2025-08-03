# セットアップスクリプトの選択肢比較と最終決定

## 🎯 最終決定: npm scripts採用

**2025年7月31日更新**: プロジェクトは **npm scripts** アプローチに統一されました。

### 採用理由：
1. **クロスプラットフォーム対応** - Windows/Mac/Linux で同じコマンド
2. **シンプルさ** - Docker操作が中心なので、複雑なスクリプトは不要
3. **統一性** - `&&` や `||` が普通に使える
4. **学習コストゼロ** - 開発者に馴染みのあるnpm scripts
5. **IDE統合** - VS Codeで直接実行可能

### 実装された npm scripts:

```json
{
  "scripts": {
    "dev": "docker compose up --build -d",
    "start": "npm run dev",
    "stop": "docker compose down",
    "restart": "docker compose restart",
    "logs": "docker compose logs -f",
    "status": "docker compose ps",
    "clean": "docker compose down -v --rmi all && docker system prune -f",
    "backend:logs": "docker compose logs backend -f",
    "backend:restart": "docker compose restart backend",
    "backend:shell": "docker compose exec backend sh",
    "db:logs": "docker compose logs postgres -f",
    "db:shell": "docker compose exec postgres psql -U catuser -d catmanagement",
    "db:migrate": "docker compose exec backend npm run prisma:migrate",
    "db:generate": "docker compose exec backend npm run prisma:generate", 
    "db:seed": "docker compose exec backend npm run seed",
    "db:studio": "docker compose exec backend npm run prisma:studio",
    "test:health": "node -e \"fetch('http://localhost:3001/health').then(r=>r.json()).then(console.log).catch(()=>console.log('Health check failed'))\"",
    "test:api": "node -e \"fetch('http://localhost:3001/api/cats').then(r=>r.json()).then(d=>console.log('API OK:', d.length, 'cats')).catch(()=>console.log('API test failed'))\"",
    "production": "docker compose -f docker-compose.production.yml up --build -d",
    "production:stop": "docker compose -f docker-compose.production.yml down",
    "help": "echo \"Available commands: dev, start, stop, restart, logs, status, clean, backend:*, db:*, test:*, production*\""
  }
}
```

---

## 検討した選択肢 (参考)

## 1. 現在の状況
- Windows環境
- Docker Desktop使用
- 複数のコマンド混在（PowerShell + Docker CLI）

## 2. 選択肢

### A) PowerShell (.ps1) - 現在
**メリット：**
- Windows標準搭載
- リッチなオブジェクト処理
- エラーハンドリングが強力
- JSONパース等が簡単

**デメリット：**
- Linuxスタイルのコマンドと構文が異なる
- && 演算子使用不可
- 学習コストが高い

### B) Batch Script (.bat/.cmd)
**メリット：**
- Windows古典的スクリプト
- シンプル

**デメリット：**
- 機能が限定的
- エラーハンドリングが弱い
- 現代的でない

### C) Bash Script (.sh) + WSL/Git Bash
**メリット：**
- Linuxと同じ構文
- && や || が使える
- 開発者に馴染みがある
- クロスプラットフォーム

**デメリット：**
- WSLまたはGit Bashが必要
- Windows固有機能が使いにくい

### D) Node.js Script (.js)
**メリット：**
- クロスプラットフォーム
- npmスクリプトとして統合可能
- 既存のNode.js環境を活用

**デメリット：**
- Node.jsが必要
- シェル操作が冗長

### E) Make + Makefile
**メリット：**
- 開発者に馴染みがある
- 依存関係管理
- シンプルなコマンド

**デメリット：**
- Windows標準ではない
- makeコマンドが必要

## 3. 推奨アプローチ

### 🎯 統一性を重視するなら：
**Option 1: Bash Script + package.json**
```bash
# setup.sh
#!/bin/bash
docker compose up --build -d && echo "Started successfully"
```

```json
// package.json
{
  "scripts": {
    "dev": "bash setup.sh start",
    "test": "bash setup.sh test",
    "stop": "bash setup.sh stop"
  }
}
```

### 🎯 Windows特化なら：
**Option 2: PowerShell + 改善**
- 現在のPowerShellスクリプトを洗練
- エラーハンドリング強化
- 統一された構文

### 🎯 クロスプラットフォームなら：
**Option 3: npm scripts**
```json
{
  "scripts": {
    "start": "docker compose up --build -d",
    "stop": "docker compose down",
    "test": "curl -s http://localhost:3001/health",
    "status": "docker compose ps"
  }
}
```

## 結論

**Docker中心の操作**なので、**npm scripts**が最適解でした。

### 実際の利点：
- `docker compose` コマンドはどの環境でも同じ
- npm scriptsは環境に依存しない
- 追加の学習コストなし
- package.jsonに集約できる
- PowerShellの構文エラーを回避
- 開発者に馴染みがある

### 使用方法：
```bash
npm run dev          # 開発環境起動
npm run stop         # 停止
npm run logs         # ログ表示
npm run db:migrate   # マイグレーション
npm run test:health  # ヘルスチェック
```

この決定により、プラットフォームに依存しない統一されたコマンド体系が実現されました。
