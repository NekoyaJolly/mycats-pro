/**
 * OpenAPI型定義生成スクリプト
 * バックエンドのSwagger JSONから TypeScript 型定義を生成します
 */


/* global process, console */
import { access, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';

const DEFAULT_SCHEMA_PATH = path.join(process.cwd(), '../backend/openapi.json');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, '../src/lib/api/generated/schema.ts');
function createGeneratedBanner() {
  return `/* eslint-disable */
/* tslint:disable */
/**
 * 🔒 このファイルは自動生成されています。
 * 生成コマンド: pnpm --filter frontend generate:api-types
 * 直接編集せず、OpenAPI スキーマを更新して再生成してください。
 */
`;
}

function resolveSchemaPath() {
  if (process.env.OPENAPI_SCHEMA_PATH) {
    return path.resolve(process.cwd(), process.env.OPENAPI_SCHEMA_PATH);
  }

  return DEFAULT_SCHEMA_PATH;
}

async function ensureSchemaExists(schemaPath) {
  try {
    await access(schemaPath);
  } catch {
    throw new Error(`OpenAPI スキーマファイルが見つかりません: ${schemaPath}`);
  }
}

async function generateTypes() {
  try {
    console.log('🔄 OpenAPI型定義を生成中...');
    const schemaPath = resolveSchemaPath();
    console.log(`📄 読み込みファイル: ${schemaPath}`);

    await ensureSchemaExists(schemaPath);

    const outputDir = path.dirname(OUTPUT_PATH);
    await mkdir(outputDir, { recursive: true });

    // TypeScript型定義を生成
    const ast = await openapiTS(pathToFileURL(schemaPath), {
      exportType: true,
      defaultNonNullable: true,
    });
    const generated = astToString(ast);

    const fileContent = `${createGeneratedBanner()}${generated}\n`;

    await writeFile(OUTPUT_PATH, fileContent, 'utf8');

    console.log(`✅ 型定義を生成しました: ${OUTPUT_PATH}`);
  } catch (error) {
    console.error('❌ 型定義の生成に失敗しました:', error);
    process.exit(1);
  }
}

generateTypes();
