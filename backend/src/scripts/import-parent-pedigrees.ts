import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();

/**
 * 親血統書インポートスクリプト
 * 現在のサンプルデータの父母を追加でインポート
 */

interface PedigreeData {
  PedigreeID: string;
  Title?: string;
  CatteryName: string;
  CatName?: string;
  BreedCode: string;
  Gender: string;
  EyeColor?: string;
  CoatColorCode: string;
  BirthDate: string;
  BreederName: string;
  OwnerName: string;
  RegistrationDate: string;
  BrotherCount: string;
  SisterCount: string;
  Notes?: string;
  Notes2?: string;
  OtherNo?: string;
}

async function importParentPedigrees() {
  const csvPath = path.join(__dirname, '../../NewPedigree/血統書データRenamed.csv');
  
  // 親のIDリスト（JCUから抽出した番号）
  const parentIds = ['163553', '169010', '700538', '142007', '700900', '150501', '116197'];
  
  try {
    console.log('🔄 親血統書データのインポートを開始...\n');
    
    const records: PedigreeData[] = [];
    
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
        }))
        .on('data', (record: any) => {
          // 親のIDが含まれる血統書のみ処理
          if (parentIds.includes(record.PedigreeID)) {
            records.push({
              PedigreeID: record.PedigreeID,
              Title: record.Title || null,
              CatteryName: record.CatteryName || '',
              CatName: record.CatName || '',
              BreedCode: record.BreedCode,
              Gender: record.Gender,
              EyeColor: record.EyeColor || null,
              CoatColorCode: record.CoatColorCode,
              BirthDate: record.BirthDate,
              BreederName: record.BreederName || '',
              OwnerName: record.OwnerName || '',
              RegistrationDate: record.RegistrationDate,
              BrotherCount: record.BrotherCount || '0',
              SisterCount: record.SisterCount || '0',
              Notes: record.Notes || null,
              Notes2: record.Notes2 || null,
              OtherNo: record.OtherNo || null,
            });
          }
        })
        .on('end', () => {
          console.log(`📊 見つかった親血統書: ${records.length}件`);
          resolve();
        })
        .on('error', reject);
    });
    
    let importCount = 0;
    let errorCount = 0;
    
    for (const record of records) {
      try {
        // 既に存在するかチェック
        const existing = await prisma.pedigree.findUnique({
          where: { pedigreeId: record.PedigreeID }
        });
        
        if (existing) {
          console.log(`⏭️  スキップ: ${record.PedigreeID} (既に存在)`);
          continue;
        }
        
        // 日付変換
        const birthDate = record.BirthDate ? new Date(record.BirthDate.replace(/\./g, '-')) : null;
        const registrationDate = record.RegistrationDate ? new Date(record.RegistrationDate.replace(/\./g, '-')) : null;
        
        await prisma.pedigree.create({
          data: {
            pedigreeId: record.PedigreeID,
            title: record.Title,
            // Removed: catName: record.CatteryName,
            catName: record.CatName,
            breedCode: parseInt(record.BreedCode),
            gender: parseInt(record.Gender),
            eyeColor: record.EyeColor,
            coatColorCode: parseInt(record.CoatColorCode),
            birthDate: birthDate,
            breederName: record.BreederName,
            ownerName: record.OwnerName,
            registrationDate: registrationDate,
            brotherCount: parseInt(record.BrotherCount),
            sisterCount: parseInt(record.SisterCount),
            notes: record.Notes,
            notes2: record.Notes2,
            otherNo: record.OtherNo,
          }
        });
        
        console.log(`✅ インポート: ${record.PedigreeID} - ${record.CatteryName} ${record.CatName}`);
        importCount++;
        
      } catch (error) {
        console.error(`❌ エラー (ID: ${record.PedigreeID}):`, error);
        errorCount++;
      }
    }
    
    console.log('\n🎉 親血統書インポート完了！');
    console.log(`📊 成功: ${importCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
  } catch (error) {
    console.error('💥 インポート処理でエラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
if (require.main === module) {
  importParentPedigrees()
    .then(() => {
      console.log('🎉 親血統書インポートが完了しました！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 インポート処理でエラーが発生しました:', error);
      process.exit(1);
    });
}

export { importParentPedigrees };
