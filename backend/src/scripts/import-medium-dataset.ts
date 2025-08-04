import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();

/**
 * 中規模データインポートスクリプト
 * パフォーマンステスト用に500-1000件をインポート
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

async function importMediumDataset() {
  const csvPath = path.join(__dirname, '../../NewPedigree/血統書データRenamed.csv');
  const targetCount = parseInt(process.argv[2]) || 500; // デフォルト500件
  
  try {
    console.log(`🔄 中規模データインポートを開始... (目標: ${targetCount}件)\n`);
    
    const startTime = Date.now();
    const records: PedigreeData[] = [];
    let processedCount = 0;
    
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
        }))
        .on('data', (record: any) => {
          if (processedCount < targetCount) {
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
            processedCount++;
          }
        })
        .on('end', () => {
          console.log(`📊 CSVデータ読み込み完了: ${records.length}件`);
          resolve();
        })
        .on('error', reject);
    });
    
    let importCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    // バッチインポートのためのデータ配列
    const batchData: any[] = [];
    
    for (const record of records) {
      try {
        // 既に存在するかチェック
        const existing = await prisma.pedigree.findUnique({
          where: { pedigreeId: record.PedigreeID }
        });
        
        if (existing) {
          skipCount++;
          continue;
        }
        
        // 日付変換
        const birthDate = record.BirthDate ? new Date(record.BirthDate.replace(/\./g, '-')) : null;
        const registrationDate = record.RegistrationDate ? new Date(record.RegistrationDate.replace(/\./g, '-')) : null;
        
        batchData.push({
          pedigreeId: record.PedigreeID,
          title: record.Title,
          catteryName: record.CatteryName,
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
        });
        
        importCount++;
        
        // 100件ごとにログ出力
        if (importCount % 100 === 0) {
          console.log(`🔄 処理中... ${importCount}件完了`);
        }
        
      } catch (error) {
        console.error(`❌ エラー (ID: ${record.PedigreeID}):`, error);
        errorCount++;
      }
    }
    
    // バッチインサート実行
    if (batchData.length > 0) {
      console.log(`🚀 バッチインサート実行: ${batchData.length}件`);
      await prisma.pedigree.createMany({
        data: batchData,
        skipDuplicates: true
      });
    }
    
    const endTime = Date.now();
    const processingTime = (endTime - startTime) / 1000;
    
    console.log('\n🎉 中規模データインポート完了！');
    console.log(`📊 処理時間: ${processingTime}秒`);
    console.log(`✅ 成功: ${importCount}件`);
    console.log(`⏭️  スキップ: ${skipCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);
    
    // パフォーマンス統計
    const recordsPerSecond = importCount / processingTime;
    console.log(`⚡ 処理速度: ${recordsPerSecond.toFixed(2)}件/秒`);
    
    // データベース統計
    const totalRecords = await prisma.pedigree.count();
    console.log(`📈 データベース総件数: ${totalRecords}件`);
    
  } catch (error) {
    console.error('💥 インポート処理でエラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
if (require.main === module) {
  importMediumDataset()
    .then(() => {
      console.log('🎉 中規模データインポートが完了しました！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 インポート処理でエラーが発生しました:', error);
      process.exit(1);
    });
}

export { importMediumDataset };
