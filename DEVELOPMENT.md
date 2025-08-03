# 🐱 Cat Management System - 開発ガイドライン

## 🚨 重要なルール

### PowerShell互換性
- **`&&` 演算子は使用禁止**
- Windows PowerShell環境での動作を保証するため
- 代替手段を使用すること

### npmスクリプトでの連続実行方法

#### ❌ 使用禁止
```json
{
  "scripts": {
    "build": "npm run clean && npm run compile"  // PowerShellでエラー
  }
}
```

#### ✅ 推奨方法

**1. npm-run-allを使用**
```json
{
  "scripts": {
    "build": "run-s clean compile",     // 順次実行
    "dev": "run-p watch:css watch:js"  // 並列実行
  }
}
```

**2. npm pre/post フックを活用**
```json
{
  "scripts": {
    "prebuild": "npm run clean",
    "build": "npm run compile"
  }
}
```

**3. 個別コマンドで分離**
```json
{
  "scripts": {
    "clean": "rimraf dist",
    "compile": "tsc",
    "build:step1": "npm run clean",
    "build:step2": "npm run compile"
  }
}
```

## 🛠️ 開発環境

### Codespacesネイティブ環境
- Dockerの二重仮想化を避ける
- 直接Node.js/PostgreSQL/Redisを使用
- リソース効率を最適化

### 環境変数ファイル
```bash
# .env.local
DATABASE_URL="postgresql://user:pass@localhost:5432/catdb"
REDIS_URL="redis://localhost:6379"
```

## 📁 ファイル配置

- **開発ガイドライン**: `/DEVELOPMENT.md` (このファイル)
- **セットアップ手順**: `/SETUP_CODESPACES.md`
- **環境設定**: `/.env.example`

## 🔍 チェックリスト

### PR作成前
- [ ] `&&` 演算子を使用していない
- [ ] Windows/PowerShellで動作確認済み
- [ ] npm scriptsがクロスプラットフォーム対応
- [ ] 環境変数が適切に設定されている

### 新しいスクリプト追加時
- [ ] `run-s` (順次) または `run-p` (並列) を使用
- [ ] 単一責任の原則に従っている
- [ ] エラーハンドリングが適切

---

**最終更新**: 2025年8月1日  
**適用範囲**: 全開発者、全環境
