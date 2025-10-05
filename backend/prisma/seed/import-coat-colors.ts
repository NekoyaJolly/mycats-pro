/**
 * CoatColor Data Import Script
 * 色柄データUTF8Ver.csv から CoatColor テーブルにデータをインポート
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface CoatColorCsvRow {
  キー: string;
  毛色名称: string;
}

async function importCoatColors() {
  try {
    console.log('🚀 Starting CoatColor data import...\n');

    // CSV ファイルを読み込み
    const csvPath = path.join(__dirname, '色柄データUTF8Ver.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    console.log(`📁 Reading from: ${csvPath}`);

    // CSV をパース
    const records: CoatColorCsvRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true, // UTF-8 BOM対応
    });

    console.log(`📊 Found ${records.length} coat color records in CSV\n`);

    // 既存のCoatColorデータを削除
    const deleteResult = await prisma.coatColor.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.count} existing coat color records\n`);

    let successCount = 0;
    let errorCount = 0;

    // 各レコードをインポート
    for (const record of records) {
      try {
        const code = parseInt(record.キー.trim(), 10);
        const name = record.毛色名称.trim();

        // code=0 の場合は空文字、それ以外はnameをそのまま使用
        const colorName = code === 0 ? 'Unknown' : name;

        await prisma.coatColor.create({
          data: {
            id: `coat-color-${code}`, // code-based ID for consistency
            code: code,
            name: colorName,
            description: code === 0 ? 'Unknown/Unspecified color' : name,
            isActive: true,
          },
        });

        console.log(`✅ Imported: code=${code}, name="${colorName}"`);
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
    const totalColors = await prisma.coatColor.count();
    console.log(`🔍 Verification: ${totalColors} coat colors in database\n`);

    // 最初の10件を表示
    const sampleColors = await prisma.coatColor.findMany({
      take: 10,
      orderBy: { code: 'asc' },
    });

    console.log('📋 Sample CoatColor Records:');
    sampleColors.forEach((color) => {
      console.log(`   code=${color.code}: "${color.name}"`);
    });

  } catch (error: any) {
    console.error('💥 Fatal error during import:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
importCoatColors()
  .then(() => {
    console.log('\n✨ CoatColor import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💀 CoatColor import failed:', error);
    process.exit(1);
  });
