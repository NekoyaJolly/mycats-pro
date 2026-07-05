#!/usr/bin/env ts-node
/**
 * Supabase データベース接続テストスクリプト
 * 
 * このスクリプトは環境変数を読み込んでSupabaseへの接続をテストします
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 環境変数の読み込み
dotenv.config({ path: path.join(process.cwd(), '.env.development') });
dotenv.config({ path: path.join(process.cwd(), '.env.production') });

interface ConnectionTestResult {
  testName: string;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  message: string;
  error?: string;
}

const results: ConnectionTestResult[] = [];

function addResult(testName: string, status: ConnectionTestResult['status'], message: string, error?: string): void {
  results.push({ testName, status, message, error });
}

async function checkEnvironmentVariables(): Promise<boolean> {
  console.log('\n=== 環境変数の確認 ===\n');
  
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  
  if (!databaseUrl) {
    addResult(
      '環境変数: DATABASE_URL',
      'FAILED',
      'DATABASE_URL が設定されていません',
      '.env.development または .env.production に DATABASE_URL を設定してください'
    );
    return false;
  } else {
    // URLをマスクして表示
    const maskedUrl = databaseUrl.replace(/:[^:@]+@/, ':****@');
    addResult(
      '環境変数: DATABASE_URL',
      'SUCCESS',
      `DATABASE_URL が設定されています`,
      `URL (マスク済み): ${maskedUrl}`
    );
  }
  
  if (!directUrl) {
    addResult(
      '環境変数: DIRECT_URL',
      'SKIPPED',
      'DIRECT_URL が設定されていません（オプション）',
      'ローカルPostgreSQLの場合は不要です。Supabase使用時はマイグレーションに必要です。'
    );
  } else {
    const maskedUrl = directUrl.replace(/:[^:@]+@/, ':****@');
    addResult(
      '環境変数: DIRECT_URL',
      'SUCCESS',
      'DIRECT_URL が設定されています',
      `URL (マスク済み): ${maskedUrl}`
    );
  }
  
  return true;
}

async function testDatabaseConnection(): Promise<void> {
  console.log('\n=== データベース接続テスト ===\n');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
  
  try {
    // 接続テスト: シンプルなクエリを実行
    console.log('データベースへの接続を試行中...');
    await prisma.$connect();
    
    addResult(
      'データベース接続',
      'SUCCESS',
      'データベースへの接続に成功しました'
    );
    
    // テーブルの確認
    try {
      console.log('テナントテーブルの確認中...');
      const tenantCount = await prisma.tenant.count();
      addResult(
        'テナントテーブル',
        'SUCCESS',
        `テナントテーブルにアクセスできました (レコード数: ${tenantCount})`
      );
    } catch (error) {
      addResult(
        'テナントテーブル',
        'FAILED',
        'テナントテーブルへのアクセスに失敗しました',
        error instanceof Error ? error.message : String(error)
      );
    }
    
    // ユーザーテーブルの確認
    try {
      console.log('ユーザーテーブルの確認中...');
      const userCount = await prisma.user.count();
      addResult(
        'ユーザーテーブル',
        'SUCCESS',
        `ユーザーテーブルにアクセスできました (レコード数: ${userCount})`
      );
    } catch (error) {
      addResult(
        'ユーザーテーブル',
        'FAILED',
        'ユーザーテーブルへのアクセスに失敗しました',
        error instanceof Error ? error.message : String(error)
      );
    }
    
    // 猫テーブルの確認
    try {
      console.log('猫テーブルの確認中...');
      const catCount = await prisma.cat.count();
      addResult(
        '猫テーブル',
        'SUCCESS',
        `猫テーブルにアクセスできました (レコード数: ${catCount})`
      );
    } catch (error) {
      addResult(
        '猫テーブル',
        'FAILED',
        '猫テーブルへのアクセスに失敗しました',
        error instanceof Error ? error.message : String(error)
      );
    }
    
  } catch (error) {
    addResult(
      'データベース接続',
      'FAILED',
      'データベースへの接続に失敗しました',
      error instanceof Error ? error.message : String(error)
    );
  } finally {
    await prisma.$disconnect();
    console.log('データベース接続を切断しました\n');
  }
}

function printResults(): void {
  console.log('='.repeat(70));
  console.log('接続テスト結果サマリー');
  console.log('='.repeat(70) + '\n');
  
  const statusSymbols = {
    SUCCESS: '✅',
    FAILED: '❌',
    SKIPPED: '⚠️ '
  };
  
  results.forEach(result => {
    const symbol = statusSymbols[result.status];
    console.log(`${symbol} [${result.status}] ${result.testName}`);
    console.log(`   ${result.message}`);
    if (result.error) {
      console.log(`   エラー詳細: ${result.error}`);
    }
    console.log('');
  });
  
  // サマリー統計
  const counts = {
    SUCCESS: results.filter(r => r.status === 'SUCCESS').length,
    FAILED: results.filter(r => r.status === 'FAILED').length,
    SKIPPED: results.filter(r => r.status === 'SKIPPED').length
  };
  
  console.log('='.repeat(70));
  console.log('統計');
  console.log('='.repeat(70));
  console.log(`✅ SUCCESS: ${counts.SUCCESS}`);
  console.log(`❌ FAILED: ${counts.FAILED}`);
  console.log(`⚠️  SKIPPED: ${counts.SKIPPED}`);
  console.log('');
  
  // 総合結果
  if (counts.FAILED === 0) {
    console.log('🎉 すべてのテストが成功しました！');
    console.log('Supabaseへの接続は正常に機能しています。');
  } else {
    console.log('⚠️  一部のテストが失敗しました。');
    console.log('環境変数の設定とデータベースのマイグレーション状態を確認してください。');
  }
  console.log('');
}

function printRecommendations(): void {
  const hasFailures = results.some(r => r.status === 'FAILED');
  
  if (hasFailures) {
    console.log('='.repeat(70));
    console.log('トラブルシューティング');
    console.log('='.repeat(70) + '\n');
    
    console.log('接続エラーが発生した場合:');
    console.log('');
    console.log('1. 環境変数が正しく設定されているか確認');
    console.log('   - .env.development または .env.production ファイルを確認');
    console.log('   - DATABASE_URL と DIRECT_URL が正しい形式か確認');
    console.log('');
    console.log('2. Supabase プロジェクトの状態を確認');
    console.log('   - Supabase ダッシュボードでプロジェクトが実行中か確認');
    console.log('   - Connection Pooler が有効になっているか確認');
    console.log('');
    console.log('3. マイグレーションの実行');
    console.log('   cd backend');
    console.log('   pnpm run prisma:migrate:deploy');
    console.log('');
    console.log('4. 接続文字列の形式確認');
    console.log('   Transaction Pooler (DATABASE_URL):');
    console.log('   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true');
    console.log('');
    console.log('   Direct Connection (DIRECT_URL):');
    console.log('   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres');
    console.log('');
    console.log('詳細: docs/SUPABASE_CONNECTION_GUIDE.md を参照');
    console.log('');
  }
}

async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║   Supabase データベース接続テストツール                           ║');
  console.log('║   MyCats Pro - Database Connection Tester                         ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  
  const hasEnvVars = await checkEnvironmentVariables();
  
  if (hasEnvVars) {
    await testDatabaseConnection();
  } else {
    console.log('\n⚠️  環境変数が設定されていないため、接続テストをスキップします。\n');
  }
  
  printResults();
  printRecommendations();
  
  console.log('テスト完了\n');
  
  // 終了コードを設定
  const hasCriticalFailures = results.some(
    r => r.status === 'FAILED' && (r.testName.includes('接続') || r.testName.includes('DATABASE_URL'))
  );
  
  if (hasCriticalFailures) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('予期しないエラーが発生しました:', error);
  process.exit(1);
});
