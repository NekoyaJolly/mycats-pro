import { promises as fs } from 'fs';
import * as path from 'path';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function readCsvWithBom(filePath: string): Promise<string[][]> {
  const fileBuffer = await fs.readFile(filePath);
  
  // BOMを削除（UTF-8 BOM: EF BB BF）
  let content = fileBuffer.toString('utf8');
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  
  const lines = content.split('\n').filter(line => line.trim() !== '');
  return lines.map(line => line.split(','));
}

async function importPedigreeData() {
  console.log('📋 血統データの投入開始...');
  
  const pedigreePath = path.join(process.cwd(), 'NewPedigree/testdatepedigrees100.csv');
  const pedigreeData = await readCsvWithBom(pedigreePath);
  
  // ヘッダー行をスキップ
  const pedigrees = pedigreeData.slice(1);
  
  console.log(`血統データ件数: ${pedigrees.length}`);
  console.log(`CSV列数: ${pedigrees[0]?.length}`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < pedigrees.length; i++) {
    const row = pedigrees[i];
    
    try {
      // 基本情報の取得 (列のインデックスは0から始まる)
      const pedigreeId = row[0]?.trim(); // PedigreeID
      const title = row[1]?.trim(); // Title
      const catName = row[2]?.trim(); // CatName
      const catName2 = row[3]?.trim(); // CatName2
      const breedCodeStr = row[4]?.trim(); // BreedCode
      const genderStr = row[5]?.trim(); // Gender
      const coatColorCodeStr = row[6]?.trim(); // CoatColorCode
      
      // 必須フィールドのチェック
      if (!pedigreeId || !catName) {
        console.warn(`⚠️  Row ${i + 2}: 必須フィールドが不足 - PedigreeID: ${pedigreeId}, CatName: ${catName}`);
        continue;
      }
      
      // 数値変換
      const breedCode = breedCodeStr ? parseInt(breedCodeStr, 10) : null;
      const coatColorCode = coatColorCodeStr ? parseInt(coatColorCodeStr, 10) : null;
      
      await prisma.pedigree.create({
        data: {
          id: crypto.randomUUID(),
          pedigreeId: pedigreeId,
          title: title || null,
          catName: catName,
          catName2: catName2 || null,
          breedCode: (breedCode !== null && !isNaN(breedCode)) ? breedCode : null,
          genderCode: genderStr ? parseInt(genderStr, 10) : null,
          coatColorCode: (coatColorCode !== null && !isNaN(coatColorCode)) ? coatColorCode : null,
        },
      });
      
      successCount++;
      console.log(`✓ ${i + 1}/${pedigrees.length} 血統追加: ${pedigreeId} - ${catName}`);
      
    } catch (error) {
      errorCount++;
      console.error(`✗ Row ${i + 2}: 血統追加エラー:`, error);
      console.error(`データ内容: ${row.slice(0, 10).join(', ')}...`);
    }
  }
  
  console.log(`📋 血統データの投入完了 - 成功: ${successCount}, エラー: ${errorCount}`);
}

async function main() {
  try {
    console.log('🚀 血統データ投入スクリプト開始');
    
    await importPedigreeData();
    
    console.log('✅ 血統データ投入完了');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  (async () => {
    try {
      await main();
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}
