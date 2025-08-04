import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPedigreeData() {
  try {
    console.log('🔍 血統書データを確認中...\n');
    
    // 総件数を確認
    const totalCount = await prisma.pedigree.count();
    console.log(`📊 血統書データ総件数: ${totalCount}件`);
    
    // サンプル範囲（701606-701630）のデータを確認
    const sampleData = await prisma.pedigree.findMany({
      where: {
        pedigreeId: {
          gte: '701606',
          lte: '701630'
        }
      },
      orderBy: {
        pedigreeId: 'asc'
      },
      select: {
        pedigreeId: true,
        // Removed: catName: true,
        title: true,
        catName: true,
        gender: true,
        birthDate: true,
        breederName: true,
        ownerName: true,
        breedCode: true,
        coatColorCode: true,
        notes: true
      }
    });
    
    console.log(`\n📋 サンプル範囲データ (701606-701630): ${sampleData.length}件`);
    console.log('=' .repeat(120));
    console.log('ID\t\t名前\t\t\t\t性別\t生年月日\t\t繁殖者名');
    console.log('=' .repeat(120));
    
    sampleData.forEach(data => {
      const fullName = [data.title, data.catName, data.catName].filter(Boolean).join(' ');
      const gender = data.gender === 1 ? '雄' : data.gender === 2 ? '雌' : '不明';
      const birthDate = data.birthDate ? data.birthDate.toISOString().split('T')[0] : '未設定';
      
      console.log(`${data.pedigreeId}\t${fullName.padEnd(30)}\t${gender}\t${birthDate}\t${data.breederName || '未設定'}`);
    });
    
    // 特定のIDの詳細データを表示
    console.log('\n🔍 詳細データサンプル (ID: 701606):');
    const detailSample = await prisma.pedigree.findUnique({
      where: { pedigreeId: '701606' }
    });
    
    if (detailSample) {
      console.log(JSON.stringify(detailSample, null, 2));
    }
    
    // 猫種コード別の統計
    console.log('\n📈 猫種コード別統計:');
    const breedStats = await prisma.pedigree.groupBy({
      by: ['breedCode'],
      _count: true,
      orderBy: {
        _count: {
          breedCode: 'desc'
        }
      }
    });
    
    breedStats.forEach(stat => {
      console.log(`  猫種コード ${stat.breedCode || '未設定'}: ${stat._count}件`);
    });
    
  } catch (error) {
    console.error('❌ データ確認中にエラーが発生しました:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
if (require.main === module) {
  checkPedigreeData();
}

export { checkPedigreeData };
