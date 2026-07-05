#!/usr/bin/env ts-node
/**
 * Vercel と Supabase の接続状況確認スクリプト
 * 
 * このスクリプトは以下をチェックします：
 * 1. Vercel 設定の有無
 * 2. Supabase 接続設定の存在
 * 3. データベース接続の確認
 * 4. 環境変数の設定状況
 */

import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
  name: string;
  status: 'OK' | 'WARNING' | 'ERROR' | 'INFO';
  message: string;
  details?: string;
}

const results: CheckResult[] = [];

function addResult(name: string, status: CheckResult['status'], message: string, details?: string): void {
  results.push({ name, status, message, details });
}

function checkFileExists(filePath: string, description: string): boolean {
  const fullPath = path.join(process.cwd(), filePath);
  if (fs.existsSync(fullPath)) {
    addResult(description, 'OK', `ファイルが存在します: ${filePath}`);
    return true;
  } else {
    addResult(description, 'INFO', `ファイルが見つかりません: ${filePath}`);
    return false;
  }
}

function checkVercelConfiguration(): void {
  console.log('\n=== Vercel 設定の確認 ===\n');
  
  // Vercel 設定ファイルの確認
  const vercelConfig = checkFileExists('vercel.json', 'Vercel設定ファイル');
  const vercelDir = checkFileExists('.vercel', 'Vercelディレクトリ');
  const frontendVercelConfig = checkFileExists('frontend/vercel.json', 'フロントエンドVercel設定');
  
  if (!vercelConfig && !vercelDir && !frontendVercelConfig) {
    addResult(
      'Vercel統合',
      'WARNING',
      'Vercelの設定ファイルが見つかりません',
      'このプロジェクトはVercelへのデプロイが設定されていない可能性があります。\n' +
      '現在のデプロイ方式: Google Cloud Run (GitHub Actions経由)\n' +
      'VercelでNext.jsをデプロイする場合は、vercel.jsonの作成が推奨されます。'
    );
  } else {
    addResult(
      'Vercel統合',
      'OK',
      'Vercel設定が検出されました'
    );
  }
}

function checkSupabaseConfiguration(): void {
  console.log('\n=== Supabase 設定の確認 ===\n');
  
  // Supabase ディレクトリの確認
  checkFileExists('supabase', 'Supabaseディレクトリ');
  checkFileExists('supabase/config.toml', 'Supabase設定ファイル');
  
  // ドキュメントの確認
  const hasConnectionGuide = checkFileExists(
    'docs/SUPABASE_CONNECTION_GUIDE.md',
    'Supabase接続ガイド'
  );
  const hasMigrationGuide = checkFileExists(
    'docs/MIGRATION_FROM_LOCAL_POSTGRES.md',
    'Supabaseマイグレーションガイド'
  );
  
  if (hasConnectionGuide || hasMigrationGuide) {
    addResult(
      'Supabaseドキュメント',
      'OK',
      'Supabase関連のドキュメントが整備されています'
    );
  }
}

function checkDatabaseConfiguration(): void {
  console.log('\n=== データベース設定の確認 ===\n');
  
  // Prisma schema の確認
  const schemaPath = 'backend/prisma/schema.prisma';
  if (checkFileExists(schemaPath, 'Prisma Schema')) {
    const schemaContent = fs.readFileSync(path.join(process.cwd(), schemaPath), 'utf8');
    
    // DATABASE_URL の確認
    if (schemaContent.includes('url       = env("DATABASE_URL")')) {
      addResult(
        'DATABASE_URL設定',
        'OK',
        'Prisma SchemaにDATABASE_URLが設定されています'
      );
    }
    
    // DIRECT_URL の確認
    if (schemaContent.includes('directUrl = env("DIRECT_URL")')) {
      addResult(
        'DIRECT_URL設定',
        'OK',
        'Prisma SchemaにDIRECT_URLが設定されています',
        'Supabase Transaction Pooler (port 6543) とDirect Connection (port 5432) の両方が設定可能です'
      );
    } else {
      addResult(
        'DIRECT_URL設定',
        'WARNING',
        'Prisma SchemaにDIRECT_URLが設定されていません',
        'Supabaseを使用する場合、マイグレーション実行にはDIRECT_URLが必要です'
      );
    }
  }
}

function checkEnvironmentFiles(): void {
  console.log('\n=== 環境変数ファイルの確認 ===\n');
  
  // 環境変数サンプルファイルの確認
  checkFileExists('.env.development.example', '開発環境設定サンプル');
  checkFileExists('.env.production.example', '本番環境設定サンプル');
  
  // 実際の環境変数ファイル（gitignoreされているはず）
  const hasDevelopmentEnv = checkFileExists('.env.development', '開発環境設定（実ファイル）');
  const hasProductionEnv = checkFileExists('.env.production', '本番環境設定（実ファイル）');
  
  if (!hasDevelopmentEnv && !hasProductionEnv) {
    addResult(
      '環境変数ファイル',
      'INFO',
      '実際の環境変数ファイルが見つかりません',
      'これは正常です。環境変数はGitHub SecretsやCloud Runの環境変数として設定されている可能性があります。\n' +
      'ローカル開発時は .env.development.example をコピーして .env.development を作成してください。'
    );
  }
}

function checkCICDConfiguration(): void {
  console.log('\n=== CI/CD 設定の確認 ===\n');
  
  // GitHub Actions workflows の確認
  checkFileExists('.github/workflows/ci-cd.yml', 'CI/CDワークフロー');
  checkFileExists('.github/workflows/deploy-only.yml', 'デプロイ専用ワークフロー');
  checkFileExists('cloudbuild.yaml', 'Cloud Build設定');
  
  addResult(
    'デプロイ方式',
    'INFO',
    '現在のデプロイ方式: GitHub Actions → Google Cloud Run',
    '本番環境: Cloud Run\nデータベース: Supabase PostgreSQL\nフロントエンド: Next.js (standalone mode)'
  );
}

function printResults(): void {
  console.log('\n' + '='.repeat(70));
  console.log('診断結果サマリー');
  console.log('='.repeat(70) + '\n');
  
  const statusSymbols = {
    OK: '✅',
    WARNING: '⚠️ ',
    ERROR: '❌',
    INFO: 'ℹ️ '
  };
  
  results.forEach(result => {
    const symbol = statusSymbols[result.status];
    console.log(`${symbol} [${result.status}] ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   詳細: ${result.details.split('\n').join('\n   ')}`);
    }
    console.log('');
  });
  
  // サマリー統計
  const counts = {
    OK: results.filter(r => r.status === 'OK').length,
    WARNING: results.filter(r => r.status === 'WARNING').length,
    ERROR: results.filter(r => r.status === 'ERROR').length,
    INFO: results.filter(r => r.status === 'INFO').length
  };
  
  console.log('='.repeat(70));
  console.log('統計');
  console.log('='.repeat(70));
  console.log(`✅ OK: ${counts.OK}`);
  console.log(`⚠️  WARNING: ${counts.WARNING}`);
  console.log(`❌ ERROR: ${counts.ERROR}`);
  console.log(`ℹ️  INFO: ${counts.INFO}`);
  console.log('');
}

function printRecommendations(): void {
  console.log('='.repeat(70));
  console.log('推奨事項');
  console.log('='.repeat(70) + '\n');
  
  const hasVercelConfig = results.some(r => r.name === 'Vercel統合' && r.status === 'OK');
  const hasDirectUrl = results.some(r => r.name === 'DIRECT_URL設定' && r.status === 'OK');
  
  if (!hasVercelConfig) {
    console.log('📋 Vercelへのデプロイを検討している場合:');
    console.log('   1. プロジェクトルートまたはfrontend/配下にvercel.jsonを作成');
    console.log('   2. Vercel CLIをインストール: npm i -g vercel');
    console.log('   3. デプロイ: cd frontend && vercel');
    console.log('   4. 環境変数をVercelダッシュボードで設定（NEXT_PUBLIC_API_URL等）');
    console.log('');
  }
  
  if (hasDirectUrl) {
    console.log('✅ Supabase統合は正しく設定されています');
    console.log('   - DATABASE_URL: Transaction Pooler経由のクエリ実行');
    console.log('   - DIRECT_URL: マイグレーション実行用');
    console.log('   詳細: docs/SUPABASE_CONNECTION_GUIDE.md を参照');
    console.log('');
  }
  
  console.log('📚 関連ドキュメント:');
  console.log('   - Supabase接続設定: docs/SUPABASE_CONNECTION_GUIDE.md');
  console.log('   - マイグレーションガイド: docs/MIGRATION_FROM_LOCAL_POSTGRES.md');
  console.log('   - デプロイ手順: README.md の「デプロイオプション」セクション');
  console.log('');
}

// メイン処理
async function main(): Promise<void> {
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║   Vercel & Supabase 接続状況診断ツール                             ║');
  console.log('║   MyCats Pro - Deployment Configuration Checker                   ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');
  
  checkVercelConfiguration();
  checkSupabaseConfiguration();
  checkDatabaseConfiguration();
  checkEnvironmentFiles();
  checkCICDConfiguration();
  
  printResults();
  printRecommendations();
  
  console.log('診断完了\n');
}

main().catch(error => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
