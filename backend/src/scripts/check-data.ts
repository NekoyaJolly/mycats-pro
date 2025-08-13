import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 データベース内容確認開始');
    
    // 猫種データの確認
    const breedCount = await prisma.breed.count();
    console.log(`📊 猫種データ: ${breedCount} 件`);
    
    if (breedCount > 0) {
      const firstBreeds = await prisma.breed.findMany({
        take: 5,
        select: { code: true, name: true }
      });
      console.log('🐱 猫種サンプル:');
      firstBreeds.forEach(breed => {
        console.log(`  - ${breed.code}: ${breed.name}`);
      });
    }
    
    // 色柄データの確認
    const colorCount = await prisma.coatColor.count();
    console.log(`\n🎨 色柄データ: ${colorCount} 件`);
    
    if (colorCount > 0) {
      const firstColors = await prisma.coatColor.findMany({
        take: 5,
        select: { code: true, name: true }
      });
      console.log('🌈 色柄サンプル:');
      firstColors.forEach(color => {
        console.log(`  - ${color.code}: ${color.name}`);
      });
    }
    
    // 血統データの確認
    const pedigreeCount = await prisma.pedigree.count();
    console.log(`\n📋 血統データ: ${pedigreeCount} 件`);
    
    if (pedigreeCount > 0) {
      const firstPedigrees = await prisma.pedigree.findMany({
        take: 5,
        select: { 
          pedigreeId: true, 
          catName: true, 
          title: true,
          breedCode: true,
          coatColorCode: true 
        }
      });
      console.log('📝 血統サンプル:');
      firstPedigrees.forEach(pedigree => {
        console.log(`  - ${pedigree.pedigreeId}: ${pedigree.title || ''} ${pedigree.catName} (品種:${pedigree.breedCode}, 色柄:${pedigree.coatColorCode})`);
      });
    }
    
    console.log('\n✅ データ確認完了');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
