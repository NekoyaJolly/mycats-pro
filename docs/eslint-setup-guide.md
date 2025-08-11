# ESLint設定ドキュメント

## 📋 概要

本プロジェクトでは、コード品質と一貫性を保つためにESLintをプロジェクト全体で統一的に運用しています。フラット設定形式（ESLint v9+）を採用し、各サブプロジェクトに適切な設定を適用しています。

## 🏗️ 設定ファイル構成

### プロジェクト構造
```
appproject/
├── eslint.config.mjs           # ルートレベル設定
├── frontend/
│   └── eslint.config.mjs       # フロントエンド専用設定
└── backend/
    └── eslint.config.mjs       # バックエンド専用設定
```

### 各設定ファイルの役割

#### 1. ルートレベル (`/eslint.config.mjs`)
- **対象**: プロジェクトルートの設定ファイル・スクリプト
- **方針**: 最小限の設定で混乱を避ける
- **除外**: サブプロジェクト（独自設定を使用）

#### 2. フロントエンド (`/frontend/eslint.config.mjs`)
- **対象**: Next.js + React + TypeScript
- **方針**: 開発効率重視、警告レベルでの運用
- **特徴**: 
  - Next.js/Reactベストプラクティス準拠
  - TypeScript型安全性の段階的改善
  - テストファイルは柔軟なルール適用

#### 3. バックエンド (`/backend/eslint.config.mjs`)
- **対象**: NestJS + TypeScript + Prisma
- **方針**: サーバーサイドの型安全性重視
- **特徴**:
  - NestJS/Prismaベストプラクティス準拠
  - スクリプトファイルは制約緩和
  - テストファイルは型制約緩和

## ⚙️ 運用方針

### 段階的品質改善
1. **Phase 1**: 警告レベルでの運用開始
2. **Phase 2**: 段階的にerrorレベルに移行
3. **Phase 3**: strict モードの適用

### 警告上限
- **フロントエンド**: 150個
- **バックエンド**: 300個
- **CI/CD**: 各上限値でのパイプライン制御

## 🚀 コマンド体系

### 個別実行
```bash
# フロントエンドのLint
npm run frontend:lint

# バックエンドのLint  
npm run backend:lint

# ルートレベルのLint
npm run lint:root
```

### 一括実行
```bash
# 全体のLint（並列実行）
npm run lint
```

### CI/CD での実行
```bash
# GitHub Actions での実行例
pnpm --filter frontend run lint -- --max-warnings=150
pnpm --filter backend run lint -- --max-warnings=300
```

## 📊 現在の状況

### 警告数の状況
- **フロントエンド**: 約100個の警告（上限150以下）
- **バックエンド**: 約173個の警告（上限300以下）
- **エラー**: 0個（全プロジェクト）

### 主な警告種別
1. **TypeScript関連**
   - `@typescript-eslint/no-explicit-any`: any型の使用
   - `@typescript-eslint/no-unsafe-*`: 型安全性の問題

2. **未使用変数**
   - `@typescript-eslint/no-unused-vars`: 未使用変数・インポート

3. **Import順序**
   - `import-x/order`: import文の順序問題

4. **React/Next.js固有**
   - `react-hooks/exhaustive-deps`: useEffectの依存関係
   - `no-console`: console文の使用

## 🔄 改善計画

### 短期目標（1-2週間）
- [ ] 未使用インポートの削除
- [ ] Import順序の統一
- [ ] 明らかな型エラーの修正

### 中期目標（1ヶ月）
- [ ] any型の段階的削除（50%削減）
- [ ] API型定義の整備
- [ ] 警告数の半減

### 長期目標（3ヶ月）
- [ ] TypeScript strict モード適用
- [ ] 警告数95%削減
- [ ] 自動型生成の導入

## 🛠️ 開発者向けガイド

### 新規コード作成時
1. 警告が出ないコードを心がける
2. any型は避け、適切な型定義を使用
3. 未使用変数は`_`プレフィックスで無効化

### 既存コード修正時
1. 関連警告の段階的修正
2. 型定義の優先実装
3. テストファイルでは型制約緩和を活用

### よくある問題と解決法

#### any型エラー
```typescript
// ❌ 悪い例
function processData(data: any) { ... }

// ✅ 良い例
interface ProcessData {
  id: string;
  name: string;
}
function processData(data: ProcessData) { ... }
```

#### 未使用変数エラー
```typescript
// ❌ 悪い例
import { Button, Text } from '@mantine/core'; // Text未使用

// ✅ 良い例
import { Button } from '@mantine/core';
// または
import { Button, Text as _Text } from '@mantine/core';
```

## 📈 監視・メトリクス

### CI/CDでの監視
- ESLint警告数の推移
- エラー率の監視
- ビルド成功率

### 定期レビュー
- 週次: 警告数の確認
- 月次: ルール見直し
- 四半期: 設定ファイル最適化

---

**文書バージョン**: 1.0  
**最終更新日**: 2025年8月12日  
**管理者**: 開発チーム
