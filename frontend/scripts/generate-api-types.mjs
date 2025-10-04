/**
 * OpenAPI型定義生成スクリプト
 * バックエンドのSwagger JSONから TypeScript 型定義を生成します
 */

import fs from 'fs/promises';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import openapiTS from 'openapi-typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';
const SWAGGER_URL = `${BACKEND_URL}/api/docs-json`;
const OUTPUT_PATH = path.join(__dirname, '../src/lib/api/generated/schema.ts');

async function generateTypes() {
  try {
    console.log('🔄 OpenAPI型定義を生成中...');
    console.log(`📡 Swagger URL: ${SWAGGER_URL}`);

    // バックエンドのSwagger JSONを取得
    const response = await fetch(SWAGGER_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch OpenAPI schema: ${response.statusText}`);
    }

    const schema = await response.json();

    // 出力ディレクトリを作成
    const outputDir = path.dirname(OUTPUT_PATH);
    await fs.mkdir(outputDir, { recursive: true });

    // TypeScript型定義を生成
    const output = await openapiTS(schema, {
      exportType: true,
      defaultNonNullable: true,
    });

    // ファイルに書き込み
    await fs.writeFile(OUTPUT_PATH, output);

    console.log(`✅ 型定義を生成しました: ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('❌ 型定義の生成に失敗しました:', error);
    process.exit(1);
  }
}

generateTypes();
