# Generated OpenAPI Types

このディレクトリには NestJS 側で生成された OpenAPI (Swagger) スキーマから自動生成された TypeScript 型定義が保存されます。

## 🔄 更新手順

1. バックエンドで最新の Swagger スキーマを出力します。

   ```bash
   pnpm --filter backend swagger:gen
   ```

2. フロントエンドで型生成スクリプトを実行します。

   ```bash
   pnpm --filter frontend generate:api-types
   ```

> **Note:** `schema.ts` は自動生成ファイルです。手動で編集せず、元となる OpenAPI スキーマを更新して再生成してください。
