/**
 * Gender Data Import Script
 * 性別データUTF8Ver.csv から Gender テーブルにデータをインポート
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface GenderCsvRow {
  キー: string;
  性別名称: string;
}

async function importGenders() {
  try {
    console.log('🚀 Starting Gender data import...\n');

    // CSV ファイルを読み込み
    const csvPath = path.join(__dirname, '性別データUTF8Ver.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    console.log(`📁 Reading from: ${csvPath}`);

    // CSV をパース
    const records: GenderCsvRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true, // UTF-8 BOM対応
    });

    console.log(`📊 Found ${records.length} gender records in CSV\n`);

    // 既存のGenderデータを削除
    const deleteResult = await prisma.gender.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.count} existing gender records\n`);

    let successCount = 0;
    let errorCount = 0;

    // 各レコードをインポート
    for (const record of records) {
      try {
        const code = parseInt(record.キー.trim(), 10);
        const name = record.性別名称.trim();

        // code=0 の場合は空文字、それ以外はnameをそのまま使用
        const genderName = code === 0 ? '' : name;

        await prisma.gender.create({
          data: {
            id: `gender-${code}`, // code-based ID for consistency
            code: code,
            name: genderName,
            description: code === 0 ? 'Unknown/Unspecified' : name,
            isActive: true,
          },
        });

        console.log(`✅ Imported: code=${code}, name="${genderName || '(empty)'}"`);
        successCount++;
      } catch (error: any) {
        console.error(`❌ Error importing record:`, record, error.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📈 Import Summary:');
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors:  ${errorCount}`);
    console.log(`   📊 Total:   ${records.length}`);
    console.log('='.repeat(60) + '\n');

    // インポート後の確認
    const totalGenders = await prisma.gender.count();
    console.log(`🔍 Verification: ${totalGenders} genders in database\n`);

    // 全Genderレコードを表示
    const allGenders = await prisma.gender.findMany({
      orderBy: { code: 'asc' },
    });

    console.log('📋 All Gender Records:');
    allGenders.forEach((gender) => {
      console.log(`   code=${gender.code}: "${gender.name}" (${gender.description})`);
    });

  } catch (error: any) {
    console.error('💥 Fatal error during import:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
importGenders()
  .then(() => {
    console.log('\n✨ Gender import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💀 Gender import failed:', error);
    process.exit(1);
  });
