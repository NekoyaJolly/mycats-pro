import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse";

const prisma = new PrismaClient();

/**
 * 血統書CSVから特定の範囲のIDを抽出してサンプルデータとしてインポート
 *
 * 使用方法:
 * - 全データをインポート: npm run pedigree:import
 * - 範囲指定: npm run pedigree:import -- --range 701606-701630
 * - 特定のIDのみ: npm run pedigree:import -- --ids 701606,701610,701615
 */

interface PedigreeData {
  PedigreeID: string;
  ChampionFlag?: string;
  Title?: string;
  CatteryName?: string;
  CatName: string;
  BreedCode?: string;
  Gender?: string;
  EyeColor?: string;
  CoatColorCode?: string;
  BirthDate?: string;
  BreederName?: string;
  OwnerName?: string;
  RegistrationDate?: string;
  BrotherCount?: string;
  SisterCount?: string;
  Notes?: string;
  Notes2?: string;
  OtherNo?: string;

  // 父母情報
  FatherChampionFlag?: string;
  FatherTitle?: string;
  FatherCatteryName?: string;
  FatherCatName?: string;
  FatherCoatColor?: string;
  FatherEyeColor?: string;
  FatherJCU?: string;
  FatherOtherCode?: string;
  MotherChampionFlag?: string;
  MotherTitle?: string;
  MotherCatteryName?: string;
  MotherCatName?: string;
  MotherCoatColor?: string;
  MotherEyeColor?: string;
  MotherJCU?: string;
  MotherOtherCode?: string;

  // 祖父母世代（F/M略称）
  FFChampionFlag?: string;
  FFTitle?: string;
  FFCatteryName?: string;
  FFCatName?: string;
  FFJCU?: string;
  FMChampionFlag?: string;
  FMTitle?: string;
  FMCatteryName?: string;
  FMCatName?: string;
  FMJCU?: string;
  MFChampionFlag?: string;
  MFTitle?: string;
  MFCatteryName?: string;
  MFCatName?: string;
  MFJCU?: string;
  MMChampionFlag?: string;
  MMTitle?: string;
  MMCatteryName?: string;
  MMCatName?: string;
  MMJCU?: string;

  // 曾祖父母世代
  FFFChampionFlag?: string;
  FFFTitle?: string;
  FFFCatteryName?: string;
  FFFCatName?: string;
  FFFJCU?: string;
  FFMChampionFlag?: string;
  FFMTitle?: string;
  FFMCatteryName?: string;
  FFMCatName?: string;
  FFMJCU?: string;
  FMFChampionFlag?: string;
  FMFTitle?: string;
  FMFCatteryName?: string;
  FMFCatName?: string;
  FMFJCU?: string;
  FMMChampionFlag?: string;
  FMMTitle?: string;
  FMMCatteryName?: string;
  FMMCatName?: string;
  FMMJCU?: string;
  MFFChampionFlag?: string;
  MFFTitle?: string;
  MFFCatteryName?: string;
  MFFCatName?: string;
  MFFJCU?: string;
  MFMChampionFlag?: string;
  MFMTitle?: string;
  MFMCatteryName?: string;
  MFMCatName?: string;
  MFMJCU?: string;
  MMFChampionFlag?: string;
  MMFTitle?: string;
  MMFCatteryName?: string;
  MMFCatName?: string;
  MMFJCU?: string;
  MMMChampionFlag?: string;
  MMMTitle?: string;
  MMMCatteryName?: string;
  MMMCatName?: string;
  MMMJCU?: string;

  OldCode?: string;
}

async function importPedigreeSampleData() {
  const args = process.argv.slice(2);
  const csvPath = path.join(
    __dirname,
    "../../NewPedigree/血統書データRenamed.csv",
  );

  // コマンドライン引数を解析
  const rangeArg = args.find((arg) => arg.startsWith("--range="));
  const idsArg = args.find((arg) => arg.startsWith("--ids="));

  let targetIds: string[] = [];

  if (rangeArg) {
    // 範囲指定の場合 (例: --range=701606-701630)
    const range = rangeArg.split("=")[1];
    const [start, end] = range.split("-").map(Number);
    for (let i = start; i <= end; i++) {
      targetIds.push(i.toString());
    }
    console.log(`📊 範囲指定: ${start} - ${end} (${targetIds.length}件)`);
  } else if (idsArg) {
    // 個別ID指定の場合 (例: --ids=701606,701610,701615)
    targetIds = idsArg
      .split("=")[1]
      .split(",")
      .map((id) => id.trim());
    console.log(`📊 個別指定: ${targetIds.join(", ")} (${targetIds.length}件)`);
  } else {
    // デフォルト: サンプル範囲
    const start = 701606;
    const end = 701630;
    for (let i = start; i <= end; i++) {
      targetIds.push(i.toString());
    }
    console.log(`📊 デフォルト範囲: ${start} - ${end} (${targetIds.length}件)`);
  }

  try {
    console.log("🔄 CSVファイルを読み込み中...");

    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSVファイルが見つかりません: ${csvPath}`);
    }

    const records: PedigreeData[] = [];

    // CSVを解析
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(
          parse({
            columns: true,
            skip_empty_lines: true,
            trim: true,
          }),
        )
        .on("data", (record: PedigreeData) => {
          // 対象IDに含まれる場合のみ追加
          if (targetIds.includes(record.PedigreeID)) {
            records.push(record);
          }
        })
        .on("end", () => {
          console.log(
            `📊 対象データ: ${records.length}件 / 指定ID: ${targetIds.length}件`,
          );
          resolve();
        })
        .on("error", reject);
    });

    if (records.length === 0) {
      console.log("⚠️  対象データが見つかりませんでした");
      return;
    }

    console.log("🔄 データベースに保存中...");

    // 既存の血統書データを削除（サンプルデータの場合）
    await prisma.pedigree.deleteMany({
      where: {
        pedigreeId: {
          in: targetIds,
        },
      },
    });

    let importedCount = 0;
    let errorCount = 0;

    // データを1件ずつ処理
    for (const record of records) {
      try {
        await prisma.pedigree.create({
          data: {
            pedigreeId: record.PedigreeID,
            title: record.Title || null,
            // Removed: catName: record.CatteryName || null,
            catName: record.CatName,
            breedCode: record.BreedCode ? parseInt(record.BreedCode) : null,
            gender: record.Gender ? parseInt(record.Gender) : null,
            eyeColor: record.EyeColor || null,
            coatColorCode: record.CoatColorCode
              ? parseInt(record.CoatColorCode)
              : null,
            birthDate: record.BirthDate ? parseDate(record.BirthDate) : null,
            registrationDate: record.RegistrationDate
              ? parseDate(record.RegistrationDate)
              : null,
            breederName: record.BreederName || null,
            ownerName: record.OwnerName || null,
            brotherCount: record.BrotherCount
              ? parseInt(record.BrotherCount)
              : null,
            sisterCount: record.SisterCount
              ? parseInt(record.SisterCount)
              : null,
            notes: record.Notes || null,
            notes2: record.Notes2 || null,
            otherNo: record.OtherNo || null,
            oldCode: record.OldCode || null,

            // TODO: 将来的にリレーション情報も処理する
            // fatherPedigreeId: ...,
            // motherPedigreeId: ...,
            // etc.
          },
        });

        importedCount++;
        if (importedCount % 10 === 0) {
          console.log(`⏳ 処理中... ${importedCount}/${records.length}`);
        }
      } catch (error) {
        console.error(`❌ エラー (ID: ${record.PedigreeID}):`, error);
        errorCount++;
      }
    }

    console.log("✅ インポート完了");
    console.log(`📊 成功: ${importedCount}件`);
    console.log(`❌ エラー: ${errorCount}件`);

    // サンプルデータを表示
    if (importedCount > 0) {
      console.log("\n📋 インポートされたサンプルデータ:");
      const samples = await prisma.pedigree.findMany({
        where: {
          pedigreeId: {
            in: targetIds.slice(0, 5), // 最初の5件を表示
          },
        },
        select: {
          pedigreeId: true,
          catName: true,
          title: true,
          // Removed: catName: true,
          birthDate: true,
          breederName: true,
        },
      });

      samples.forEach((sample) => {
        console.log(
          `  - ${sample.pedigreeId}: ${sample.title || ""} ${sample.catName || ""} ${sample.catName}`,
        );
      });
    }
  } catch (error) {
    console.error("💥 インポート中にエラーが発生しました:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 日付文字列をDateオブジェクトに変換
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  try {
    // YYYY.MM.DD形式を想定
    const cleanedDate = dateStr.replace(/\./g, "-");
    const date = new Date(cleanedDate);

    if (isNaN(date.getTime())) {
      console.warn(`⚠️  無効な日付形式: ${dateStr}`);
      return null;
    }

    return date;
  } catch (error) {
    console.warn(`⚠️  日付変換エラー: ${dateStr}`, error);
    return null;
  }
}

// スクリプト実行
if (require.main === module) {
  importPedigreeSampleData()
    .then(() => {
      console.log("🎉 血統書サンプルデータのインポートが完了しました！");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 インポート処理でエラーが発生しました:", error);
      process.exit(1);
    });
}

export { importPedigreeSampleData };
