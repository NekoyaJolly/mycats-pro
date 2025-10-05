/**
 * Breed Data Import Script
 * 猫種データUTF8Ver.csv から Breed テーブルにデータをインポート
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface BreedCsvRow {
  キー: string;
  種類名称: string;
}

async function importBreeds() {
  try {
    console.log('🚀 Starting Breed data import...\n');

    // CSV ファイルを読み込み
    const csvPath = path.join(__dirname, '猫種データUTF8Ver.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    console.log(`📁 Reading from: ${csvPath}`);

    // CSV をパース
    const records: BreedCsvRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true, // UTF-8 BOM対応
    });

    console.log(`📊 Found ${records.length} breed records in CSV\n`);

    // 既存のBreedデータを削除
    const deleteResult = await prisma.breed.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.count} existing breed records\n`);

    let successCount = 0;
    let errorCount = 0;

    // 各レコードをインポート
    for (const record of records) {
      try {
        const code = parseInt(record.キー.trim(), 10);
        const name = record.種類名称.trim();

        // code=0 の場合は空文字、それ以外はnameをそのまま使用
        const breedName = code === 0 ? 'Unknown' : name;

        await prisma.breed.create({
          data: {
            id: `breed-${code}`, // code-based ID for consistency
            code: code,
            name: breedName,
            description: code === 0 ? 'Unknown/Unspecified breed' : name,
            isActive: true,
          },
        });

        console.log(`✅ Imported: code=${code}, name="${breedName}"`);
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
    const totalBreeds = await prisma.breed.count();
    console.log(`🔍 Verification: ${totalBreeds} breeds in database\n`);

    // 最初の10件を表示
    const sampleBreeds = await prisma.breed.findMany({
      take: 10,
      orderBy: { code: 'asc' },
    });

    console.log('📋 Sample Breed Records:');
    sampleBreeds.forEach((breed) => {
      console.log(`   code=${breed.code}: "${breed.name}"`);
    });

  } catch (error: any) {
    console.error('💥 Fatal error during import:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
importBreeds()
  .then(() => {
    console.log('\n✨ Breed import completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💀 Breed import failed:', error);
    process.exit(1);
  });
