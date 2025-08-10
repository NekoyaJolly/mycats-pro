import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse";

const prisma = new PrismaClient();

/**
 * 血統書リレーション構築スクリプト
 *
 * JCU情報を使用して父母のリレーションを構築
 * JCU形式: "JCU-No XXXXXX-YYYYYY" または "WCA-No XXXXXX-YYYYYY"
 */

interface PedigreeRelationData {
  PedigreeID: string;
  FatherJCU: string;
  MotherJCU: string;
}

async function buildPedigreeRelations() {
  const csvPath = path.join(
    __dirname,
    "../../NewPedigree/血統書データRenamed.csv",
  );

  try {
    console.log("🔄 血統書リレーション構築を開始...\n");

    // 1. CSV データを読み込み
    console.log("📁 CSVファイルを読み込み中...");
    const records: PedigreeRelationData[] = [];

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(
          parse({
            columns: true,
            skip_empty_lines: true,
            trim: true,
          }),
        )
        .on("data", (record: any) => {
          records.push({
            PedigreeID: record.PedigreeID,
            FatherJCU: record.FatherJCU,
            MotherJCU: record.MotherJCU,
          });
        })
        .on("end", () => {
          console.log(`📊 CSVデータ読み込み完了: ${records.length}件`);
          resolve();
        })
        .on("error", reject);
    });

    // 2. データベース内の血統書データを取得
    console.log("🗄️  データベースから血統書データを取得中...");
    const pedigrees = await prisma.pedigree.findMany({
      select: {
        id: true,
        pedigreeId: true,
      },
    });

    console.log(`📊 データベース内血統書: ${pedigrees.length}件`);

    // 3. 血統書番号からUUIDへのマッピングを作成
    const pedigreeMap = new Map<string, string>();

    pedigrees.forEach((p) => {
      if (p.pedigreeId) {
        pedigreeMap.set(p.pedigreeId, p.id);
      }
    });

    console.log(`📋 血統書マッピング: ${pedigreeMap.size}件`);

    // 4. リレーション構築
    let relationCount = 0;
    let errorCount = 0;

    console.log("🔗 リレーション構築中...\n");

    for (const record of records) {
      if (!pedigreeMap.has(record.PedigreeID)) {
        continue; // データベースに存在しない血統書はスキップ
      }

      try {
        const updateData: any = {};

        // 父親のリレーション
        const fatherPedigreeId = extractPedigreeNumber(record.FatherJCU);
        if (fatherPedigreeId && pedigreeMap.has(fatherPedigreeId)) {
          updateData.fatherPedigreeId = pedigreeMap.get(fatherPedigreeId);
        }

        // 母親のリレーション
        const motherPedigreeId = extractPedigreeNumber(record.MotherJCU);
        if (motherPedigreeId && pedigreeMap.has(motherPedigreeId)) {
          updateData.motherPedigreeId = pedigreeMap.get(motherPedigreeId);
        }

        // アップデートする内容がある場合のみ実行
        if (Object.keys(updateData).length > 0) {
          await prisma.pedigree.update({
            where: { pedigreeId: record.PedigreeID },
            data: updateData,
          });

          relationCount++;

          if (relationCount <= 10) {
            console.log(
              `✅ ${record.PedigreeID}: ${Object.keys(updateData).join(", ")}`,
            );
          }
        }
      } catch (error) {
        console.error(`❌ エラー (ID: ${record.PedigreeID}):`, error);
        errorCount++;
      }
    }

    console.log("\n🎉 リレーション構築完了！");
    console.log(`📊 成功: ${relationCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);

    // 5. 結果確認
    console.log("\n🔍 構築されたリレーション確認:");
    const relatedPedigrees = await prisma.pedigree.findMany({
      where: {
        OR: [
          { fatherPedigreeId: { not: null } },
          { motherPedigreeId: { not: null } },
        ],
      },
      include: {
        fatherPedigree: {
          select: { pedigreeId: true, catName: true },
        },
        motherPedigree: {
          select: { pedigreeId: true, catName: true },
        },
      },
      take: 10,
    });

    relatedPedigrees.forEach((p) => {
      const father = p.fatherPedigree
        ? `父: ${p.fatherPedigree.pedigreeId} (${p.fatherPedigree.catName})`
        : "";
      const mother = p.motherPedigree
        ? `母: ${p.motherPedigree.pedigreeId} (${p.motherPedigree.catName})`
        : "";
      console.log(`  ${p.pedigreeId}: ${father} ${mother}`);
    });
  } catch (error) {
    console.error("💥 リレーション構築中にエラーが発生しました:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * JCU文字列から血統書番号を抽出
 * 例: "JCU-No 921361-163553" -> "163553" (末尾6桁)
 */
function extractPedigreeNumber(jcuString: string): string | null {
  if (!jcuString) return null;

  // "JCU-No " または "WCA-No " を除去
  const match = jcuString.match(/(?:JCU-No|WCA-No)\s+(.+)/);
  if (match) {
    const fullNumber = match[1].trim();
    // "XXXXXX-YYYYYY" から末尾の "YYYYYY" を抽出
    const keyMatch = fullNumber.match(/^\d{6}-(\d{6})$/);
    if (keyMatch) {
      return keyMatch[1]; // 末尾6桁のキー部分
    }
    return fullNumber;
  }

  // 直接血統書番号の場合
  if (jcuString.match(/^\d{6}$/)) {
    return jcuString;
  }

  return null;
}

// スクリプト実行
if (require.main === module) {
  buildPedigreeRelations()
    .then(() => {
      console.log("🎉 血統書リレーション構築が完了しました！");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 リレーション構築処理でエラーが発生しました:", error);
      process.exit(1);
    });
}

export { buildPedigreeRelations };
