import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkParentPedigrees() {
  try {
    // データベース内の全血統書番号を取得
    const allPedigrees = await prisma.pedigree.findMany({
      select: {
        pedigreeId: true,
        catName: true,
        breedCode: true,
        genderCode: true,
      },
    });

    console.log(`📊 データベース内血統書: ${allPedigrees.length}件`);
    console.log("血統書ID一覧:");
    allPedigrees.forEach((p) => {
      console.log(
        `  ${p.pedigreeId} - ${p.catName || "名前なし"} (猫種: ${p.breedCode}, 性別: ${p.genderCode})`,
      );
    });

    // 検索する父母の血統書番号
    const searchPedigreeIds = [
      "921361-163553", // 701606の父
      "941862-169010", // 701606の母
      "841901-700538", // 701607の父
      "441652-142007", // 701607の母
      "662862-700900", // 701608の母
      "400371-150501", // 701609の父
      "391402-116197", // 701609の母
    ];

    console.log("\n🔍 父母血統書番号の検索結果:");
    for (const pedigreeId of searchPedigreeIds) {
      const found = allPedigrees.find((p) => p.pedigreeId === pedigreeId);
      if (found) {
        console.log(
          `  ✅ ${pedigreeId}: 見つかりました - ${found.catName || "名前なし"}`,
        );
      } else {
        console.log(`  ❌ ${pedigreeId}: 見つかりませんでした`);
      }
    }
  } catch (error) {
    console.error("エラー:", error);
  } finally {
    await prisma.$disconnect();
  }
}

void checkParentPedigrees();
