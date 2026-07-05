#!/usr/bin/env tsx
/**
 * Vercel と Supabase の接続状況を確認するスクリプト
 * 
 * このスクリプトは以下を確認します:
 * 1. 環境変数の設定状況
 * 2. Supabase データベース接続
 * 3. Vercel 設定の存在確認
 * 4. 推奨される設定のチェック
 * 
 * 使用方法:
 *   pnpm tsx scripts/check-vercel-supabase-connection.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Prisma クライアントの動的インポート
let PrismaClient: any = null;
try {
  const prismaModule = await import('@prisma/client');
  PrismaClient = prismaModule.PrismaClient;
} catch (error) {
  console.warn('⚠️  @prisma/client が見つかりません。接続テストはスキップされます。');
}

interface CheckResult {
  category: string;
  item: string;
  status: 'ok' | 'warning' | 'error' | 'info';
  message: string;
  recommendation?: string;
}

const results: CheckResult[] = [];

function addResult(
  category: string,
  item: string,
  status: 'ok' | 'warning' | 'error' | 'info',
  message: string,
  recommendation?: string
): void {
  results.push({ category, item, status, message, recommendation });
}

// 環境変数のチェック
function checkEnvironmentVariables(): void {
  console.log('\n📋 環境変数のチェック...\n');

  // DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    if (databaseUrl.includes('supabase.co')) {
      addResult(
        '環境変数',
        'DATABASE_URL',
        'ok',
        'Supabase 接続文字列が設定されています'
      );
      
      // Transaction Pooler (port 6543) のチェック
      if (databaseUrl.includes(':6543')) {
        addResult(
          '環境変数',
          'DATABASE_URL (Pooler)',
          'ok',
          'Transaction Pooler (port 6543) を使用しています'
        );
      } else if (databaseUrl.includes(':5432')) {
        addResult(
          '環境変数',
          'DATABASE_URL (Direct)',
          'warning',
          'Direct Connection (port 5432) を使用しています',
          'サーバーレス環境では Transaction Pooler (port 6543) の使用を推奨します'
        );
      }

      // pgbouncer パラメータのチェック
      if (databaseUrl.includes('pgbouncer=true')) {
        addResult(
          '環境変数',
          'DATABASE_URL (pgbouncer)',
          'ok',
          'pgbouncer パラメータが設定されています'
        );
      } else if (databaseUrl.includes(':6543')) {
        addResult(
          '環境変数',
          'DATABASE_URL (pgbouncer)',
          'warning',
          'port 6543 を使用していますが pgbouncer=true パラメータがありません',
          '接続文字列に ?pgbouncer=true を追加してください'
        );
      }
    } else if (databaseUrl.includes('localhost')) {
      addResult(
        '環境変数',
        'DATABASE_URL',
        'info',
        'ローカル PostgreSQL を使用しています（開発環境）'
      );
    } else {
      addResult(
        '環境変数',
        'DATABASE_URL',
        'warning',
        'DATABASE_URL が設定されていますが、Supabase またはローカル環境ではありません'
      );
    }
  } else {
    addResult(
      '環境変数',
      'DATABASE_URL',
      'error',
      'DATABASE_URL が設定されていません',
      '.env ファイルに DATABASE_URL を設定してください'
    );
  }

  // DIRECT_URL
  const directUrl = process.env.DIRECT_URL;
  if (directUrl) {
    if (directUrl.includes(':5432')) {
      addResult(
        '環境変数',
        'DIRECT_URL',
        'ok',
        'DIRECT_URL が設定されています (port 5432)'
      );
    } else {
      addResult(
        '環境変数',
        'DIRECT_URL',
        'warning',
        'DIRECT_URL が設定されていますが、port 5432 ではありません',
        'Direct Connection は通常 port 5432 を使用します'
      );
    }
  } else {
    if (databaseUrl?.includes('supabase.co') && databaseUrl?.includes(':6543')) {
      addResult(
        '環境変数',
        'DIRECT_URL',
        'error',
        'DIRECT_URL が設定されていません',
        'Supabase の Transaction Pooler 使用時は DIRECT_URL が必須です（マイグレーション用）'
      );
    } else if (databaseUrl?.includes('localhost')) {
      addResult(
        '環境変数',
        'DIRECT_URL',
        'info',
        'DIRECT_URL は設定されていません（ローカル環境では不要）'
      );
    }
  }

  // Vercel 環境変数
  const nextPublicApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (nextPublicApiUrl) {
    addResult(
      '環境変数',
      'NEXT_PUBLIC_API_URL',
      'ok',
      `API URL: ${nextPublicApiUrl}`
    );
  } else {
    addResult(
      '環境変数',
      'NEXT_PUBLIC_API_URL',
      'warning',
      'NEXT_PUBLIC_API_URL が設定されていません',
      'フロントエンドのビルド時に API URL が必要です'
    );
  }
}

// Supabase 接続テスト
async function testSupabaseConnection(): Promise<void> {
  console.log('\n🔌 Supabase 接続テスト...\n');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    addResult(
      'Supabase 接続',
      '接続テスト',
      'error',
      'DATABASE_URL が設定されていないため、接続テストをスキップします'
    );
    return;
  }

  if (!databaseUrl.includes('supabase.co')) {
    addResult(
      'Supabase 接続',
      '接続テスト',
      'info',
      'Supabase を使用していないため、接続テストをスキップします'
    );
    return;
  }

  if (!PrismaClient) {
    addResult(
      'Supabase 接続',
      '接続テスト',
      'warning',
      'Prisma クライアントが利用できないため、接続テストをスキップします',
      'backend ディレクトリで `pnpm install` を実行してください'
    );
    return;
  }

  let prisma: any = null;
  
  try {
    prisma = new PrismaClient({
      log: ['error'],
    });

    // 接続テスト
    await prisma.$connect();
    addResult(
      'Supabase 接続',
      'データベース接続',
      'ok',
      'Supabase への接続に成功しました'
    );

    // 簡単なクエリテスト
    const result = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now`;
    addResult(
      'Supabase 接続',
      'クエリ実行',
      'ok',
      `クエリ実行成功 (サーバー時刻: ${result[0].now.toISOString()})`
    );

    // テーブルの存在確認
    try {
      const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `;
      
      if (tables.length > 0) {
        addResult(
          'Supabase 接続',
          'テーブル存在確認',
          'ok',
          `${tables.length} 個のテーブルが存在します: ${tables.slice(0, 3).map(t => t.table_name).join(', ')}${tables.length > 3 ? '...' : ''}`
        );
      } else {
        addResult(
          'Supabase 接続',
          'テーブル存在確認',
          'warning',
          'テーブルが存在しません',
          'pnpm db:migrate を実行してマイグレーションを適用してください'
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      addResult(
        'Supabase 接続',
        'テーブル存在確認',
        'error',
        `テーブル確認中にエラーが発生しました: ${message}`
      );
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    addResult(
      'Supabase 接続',
      'データベース接続',
      'error',
      `Supabase への接続に失敗しました: ${message}`,
      '1. DATABASE_URL が正しいか確認\n   2. Supabase プロジェクトが稼働しているか確認\n   3. ファイアウォール設定を確認'
    );
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Vercel 設定のチェック
function checkVercelConfiguration(): void {
  console.log('\n⚡ Vercel 設定のチェック...\n');

  const rootDir = path.join(__dirname, '..');
  const frontendDir = path.join(rootDir, 'frontend');

  // vercel.json の存在確認
  const vercelJsonPath = path.join(frontendDir, 'vercel.json');
  if (fs.existsSync(vercelJsonPath)) {
    addResult(
      'Vercel 設定',
      'vercel.json',
      'info',
      'vercel.json が存在します'
    );
    
    try {
      const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
      addResult(
        'Vercel 設定',
        'vercel.json 内容',
        'info',
        `設定項目: ${Object.keys(vercelConfig).join(', ')}`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      addResult(
        'Vercel 設定',
        'vercel.json パース',
        'error',
        `vercel.json の読み込みに失敗しました: ${message}`
      );
    }
  } else {
    addResult(
      'Vercel 設定',
      'vercel.json',
      'info',
      'vercel.json が存在しません（Next.js のデフォルト設定が使用されます）'
    );
  }

  // .vercel ディレクトリの確認
  const vercelDir = path.join(frontendDir, '.vercel');
  if (fs.existsSync(vercelDir)) {
    addResult(
      'Vercel 設定',
      '.vercel ディレクトリ',
      'info',
      '.vercel ディレクトリが存在します（Vercel CLI でリンク済み）'
    );
  } else {
    addResult(
      'Vercel 設定',
      '.vercel ディレクトリ',
      'warning',
      '.vercel ディレクトリが存在しません',
      'Vercel にデプロイする場合は `vercel` コマンドでプロジェクトをリンクしてください'
    );
  }

  // next.config.ts の確認
  const nextConfigPath = path.join(frontendDir, 'next.config.ts');
  if (fs.existsSync(nextConfigPath)) {
    addResult(
      'Vercel 設定',
      'next.config.ts',
      'ok',
      'Next.js 設定ファイルが存在します'
    );

    const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf-8');
    
    // output: 'standalone' のチェック
    if (nextConfigContent.includes("output: 'standalone'")) {
      addResult(
        'Vercel 設定',
        'next.config.ts (output)',
        'info',
        "output: 'standalone' が設定されています（Docker/Cloud Run 用）",
        'Vercel デプロイ時は output 設定を削除するか、条件分岐で制御してください'
      );
    }
  }

  // README の Vercel 記載確認
  const readmePath = path.join(rootDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    if (readmeContent.toLowerCase().includes('vercel')) {
      addResult(
        'Vercel 設定',
        'README.md',
        'ok',
        'README に Vercel のデプロイ手順が記載されています'
      );
    }
  }
}

// Prisma スキーマのチェック
function checkPrismaSchema(): void {
  console.log('\n🔧 Prisma スキーマのチェック...\n');

  const schemaPath = path.join(__dirname, '..', 'backend', 'prisma', 'schema.prisma');
  
  if (!fs.existsSync(schemaPath)) {
    addResult(
      'Prisma 設定',
      'schema.prisma',
      'error',
      'schema.prisma が見つかりません'
    );
    return;
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

  // directUrl の設定確認
  if (schemaContent.includes('directUrl')) {
    addResult(
      'Prisma 設定',
      'directUrl',
      'ok',
      'schema.prisma に directUrl が設定されています'
    );
  } else {
    addResult(
      'Prisma 設定',
      'directUrl',
      'warning',
      'schema.prisma に directUrl が設定されていません',
      'Supabase の Transaction Pooler 使用時は directUrl の設定を推奨します'
    );
  }

  // provider のチェック
  if (schemaContent.includes('provider = "postgresql"')) {
    addResult(
      'Prisma 設定',
      'provider',
      'ok',
      'PostgreSQL プロバイダーが設定されています'
    );
  }
}

// 結果の表示
function displayResults(): void {
  console.log('\n' + '='.repeat(80));
  console.log('📊 チェック結果サマリー');
  console.log('='.repeat(80) + '\n');

  const categories = [...new Set(results.map(r => r.category))];

  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category);
    console.log(`\n${category}:`);
    console.log('-'.repeat(80));

    for (const result of categoryResults) {
      const icon = {
        ok: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️'
      }[result.status];

      console.log(`${icon} ${result.item}: ${result.message}`);
      
      if (result.recommendation) {
        console.log(`   💡 推奨: ${result.recommendation.split('\n').join('\n   💡 ')}`);
      }
    }
  }

  // 総合評価
  console.log('\n' + '='.repeat(80));
  console.log('📈 総合評価');
  console.log('='.repeat(80) + '\n');

  const okCount = results.filter(r => r.status === 'ok').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const infoCount = results.filter(r => r.status === 'info').length;

  console.log(`✅ 正常: ${okCount} 項目`);
  console.log(`⚠️  警告: ${warningCount} 項目`);
  console.log(`❌ エラー: ${errorCount} 項目`);
  console.log(`ℹ️  情報: ${infoCount} 項目`);

  console.log('\n');

  if (errorCount > 0) {
    console.log('❌ 重大な問題が見つかりました。上記の推奨事項を確認してください。');
    process.exit(1);
  } else if (warningCount > 0) {
    console.log('⚠️  改善が推奨される項目があります。');
    process.exit(0);
  } else {
    console.log('✅ すべてのチェックが正常に完了しました。');
    process.exit(0);
  }
}

// メイン処理
async function main(): Promise<void> {
  console.log('🔍 Vercel と Supabase の接続状況チェック');
  console.log('='.repeat(80));

  checkEnvironmentVariables();
  await testSupabaseConnection();
  checkVercelConfiguration();
  checkPrismaSchema();

  displayResults();
}

// スクリプト実行
main().catch((error) => {
  console.error('❌ チェック中にエラーが発生しました:', error);
  process.exit(1);
});
