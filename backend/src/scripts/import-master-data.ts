import * as fsSync from 'fs';
import { promises as fs } from 'fs';
import path from 'path';

import { PrismaClient } from '@prisma/client';

import { batchTransaction } from './utils/prisma-batch';

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

async function importBreeds() {
  console.log('🐱 猫種データの投入開始...');
  
  const breedPath = path.join(__dirname, '../../NewPedigree/猫種データUTF8Ver.csv');
  
  // ファイルの存在確認
  if (!fsSync.existsSync(breedPath)) {
    console.log(`⚠️  データファイルが見つかりません: ${breedPath}`);
    console.log('   データファイルを配置してから実行してください。');
    return;
  }
  
  // 既存データクリア
  await prisma.breed.deleteMany();
  
  const breedData = await readCsvWithBom(breedPath);
  
  // ヘッダー行をスキップ
  const breeds = breedData.slice(1).map(row => ({
    code: parseInt(row[0].trim(), 10),
    name: row[1]?.trim() || '',
  })).filter(breed => !isNaN(breed.code) && breed.name);
  
  console.log(`投入予定件数: ${breeds.length}`);
  await batchTransaction(
    prisma,
    breeds,
    async (tx, breed) => {
      await tx.breed.create({
        data: {
          id: crypto.randomUUID(),
          code: breed.code,
          name: breed.name,
        },
      });
    },
    { batchSize: 200, logEvery: 1000, label: 'breeds' },
  );
  
  console.log('🐱 猫種データの投入完了');
}

async function importCoatColors() {
  console.log('🎨 色柄データの投入開始...');
  
  const colorPath = path.join(__dirname, '../../NewPedigree/色柄データUTF8Ver.csv');
  
  // ファイルの存在確認
  if (!fsSync.existsSync(colorPath)) {
    console.log(`⚠️  データファイルが見つかりません: ${colorPath}`);
    console.log('   データファイルを配置してから実行してください。');
    return;
  }
  
  // 既存データクリア
  await prisma.coatColor.deleteMany();
  
  const colorData = await readCsvWithBom(colorPath);
  
  // ヘッダー行をスキップ
  const colors = colorData.slice(1).map(row => ({
    code: parseInt(row[0].trim(), 10),
    name: row[1]?.trim() || '',
  })).filter(color => !isNaN(color.code) && color.name);
  
  console.log(`投入予定件数: ${colors.length}`);
  await batchTransaction(
    prisma,
    colors,
    async (tx, color) => {
      await tx.coatColor.create({
        data: {
          id: crypto.randomUUID(),
          code: color.code,
          name: color.name,
        },
      });
    },
    { batchSize: 200, logEvery: 1000, label: 'coatColors' },
  );
  
  console.log('🎨 色柄データの投入完了');
}

async function clearPedigreeData() {
  console.log('📋 既存血統データのクリア開始...');
  
  // リレーションを考慮した順序でクリア
  await prisma.pedigree.deleteMany();
  
  console.log('📋 既存血統データのクリア完了');
}

async function main() {
  try {
    console.log('🚀 マスターデータ投入スクリプト開始');
    
    await clearPedigreeData();
    await importBreeds();
    await importCoatColors();
    
    console.log('✅ マスターデータ投入完了');
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
