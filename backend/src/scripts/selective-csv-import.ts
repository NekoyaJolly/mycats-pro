import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

interface PedigreeRow {
  キー: string;
  ＧＰ: string;
  猫名前１: string;
  猫名前２: string;
  猫名前３: string;
  猫種ｺｰﾄﾞ: string;
  性別: string;
  目色: string;
  毛色ｺｰﾄﾞ: string;
  生年月日: string;
  繁殖者名: string;
  所有者名: string;
  登録年月日: string;
  兄弟の人数: string;
  姉妹の人数: string;
  摘要: string;
  摘要２: string;
  他団体No: string;
  父のＧＰ: string;
  父の名前１: string;
  父の名前２: string;
  父の名前３: string;
  母のＧＰ: string;
  母の名前１: string;
  母の名前２: string;
  母の名前３: string;
  // 祖父母のフィールドも必要に応じて追加
  旧コード: string;
}

interface ImportOptions {
  keyStart?: number;
  keyEnd?: number;
  specificKeys?: number[];
  maxRecords?: number;
  preview?: boolean;
}

/**
 * CSVから特定範囲のキーを抽出してサンプルデータを作成
 */
async function importSelectedPedigrees(options: ImportOptions = {}) {
  const csvPath = path.join(
    __dirname,
    "../../NewPedigree/血統書データUTFVer.csv",
  );

  if (!fs.existsSync(csvPath)) {
    console.error("❌ CSVファイルが見つかりません:", csvPath);
    return;
  }

  console.log("📂 CSVファイルを読み込み中...");
  const csvContent = fs.readFileSync(csvPath, "utf-8");

  // ヘッダー行をスキップして2行目から開始
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    from_line: 2, // 1行目は日本語ヘッダー、2行目は英語ヘッダー
  }) as PedigreeRow[];

  console.log(`📊 総レコード数: ${records.length}`);

  // キーでフィルタリング
  let filteredRecords = records;

  if (options.specificKeys && options.specificKeys.length > 0) {
    // 特定のキーのみ
    filteredRecords = records.filter((record) => {
      const key = parseInt(record.キー);
      return options.specificKeys!.includes(key);
    });
    console.log(`🔍 特定キー抽出: ${options.specificKeys.join(", ")}`);
  } else if (options.keyStart && options.keyEnd) {
    // 範囲指定
    filteredRecords = records.filter((record) => {
      const key = parseInt(record.キー);
      return key >= options.keyStart! && key <= options.keyEnd!;
    });
    console.log(`🔍 範囲抽出: ${options.keyStart} - ${options.keyEnd}`);
  }

  // 最大件数制限
  if (options.maxRecords) {
    filteredRecords = filteredRecords.slice(0, options.maxRecords);
  }

  console.log(`📋 抽出されたレコード数: ${filteredRecords.length}`);

  if (options.preview) {
    // プレビューモード：実際のインポートは行わない
    console.log("\n🔍 プレビューモード - 最初の5件:");
    filteredRecords.slice(0, 5).forEach((record, index) => {
      console.log(
        `${index + 1}. キー: ${record.キー}, GP: ${record.ＧＰ}, 名前: ${record.猫名前３}`,
      );
    });
    return;
  }

  // データベースにインポート
  console.log("💾 データベースへインポート中...");
  let successCount = 0;
  let errorCount = 0;

  for (const record of filteredRecords) {
    try {
      // 猫種とコートカラーのマッピング（必要に応じて実装）
      const breedId = await getOrCreateBreed(record.猫種ｺｰﾄﾞ);
      const colorId = await getOrCreateCoatColor(record.毛色ｺｰﾄﾞ);

      // 血統書データの作成
      await prisma.pedigree.create({
        data: {
          pedigreeId: record.ＧＰ || `GP_${record.キー}`,
          title: record.猫名前１ || null,
          catName:
            ((record.猫名前２ || "") + " " + (record.猫名前３ || "")).trim() ||
            `Cat_${record.キー}`,
          breedId: breedId,
          breedCode: parseInt(record.猫種ｺｰﾄﾞ) || null,
          gender: parseInt(record.性別) || null,
          eyeColor: record.目色 || null,
          colorId: colorId,
          coatColorCode: parseInt(record.毛色ｺｰﾄﾞ) || null,
          birthDate: parseDate(record.生年月日),
          registrationDate: parseDate(record.登録年月日),
          breederName: record.繁殖者名 || null,
          ownerName: record.所有者名 || null,
          brotherCount: parseInt(record.兄弟の人数) || null,
          sisterCount: parseInt(record.姉妹の人数) || null,
          notes: record.摘要 || null,
          notes2: record.摘要２ || null,
          otherNo: record.他団体No || null,
          oldCode: record.旧コード || null,
          // 親の情報は別途処理（リレーション構築）
        },
      });
      successCount++;
    } catch (error) {
      console.error(`❌ エラー (キー: ${record.キー}):`, error);
      errorCount++;
    }
  }

  console.log(`\n✅ インポート完了:`);
  console.log(`  成功: ${successCount}件`);
  console.log(`  エラー: ${errorCount}件`);
}

/**
 * 猫種の取得または作成
 */
async function getOrCreateBreed(breedCode: string): Promise<string | null> {
  if (!breedCode) return null;

  try {
    const code = parseInt(breedCode);
    const breed = await prisma.breed.findFirst({
      where: { code: code },
    });

    if (breed) {
      return breed.id;
    }

    // 新しい猫種を作成
    const newBreed = await prisma.breed.create({
      data: {
        code: code,
        name: `Breed_${code}`,
        description: "Imported from CSV",
      },
    });

    return newBreed.id;
  } catch (error) {
    console.error(`猫種作成エラー (${breedCode}):`, error);
    return null;
  }
}

/**
 * 毛色の取得または作成
 */
async function getOrCreateCoatColor(colorCode: string): Promise<string | null> {
  if (!colorCode) return null;

  try {
    const code = parseInt(colorCode);
    const color = await prisma.coatColor.findFirst({
      where: { code: code },
    });

    if (color) {
      return color.id;
    }

    // 新しい毛色を作成
    const newColor = await prisma.coatColor.create({
      data: {
        code: code,
        name: `Color_${code}`,
        description: "Imported from CSV",
      },
    });

    return newColor.id;
  } catch (error) {
    console.error(`毛色作成エラー (${colorCode}):`, error);
    return null;
  }
}

/**
 * 日付の解析
 */
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  try {
    // YYYY.MM.DD 形式を想定
    const parts = dateStr.split(".");
    if (parts.length === 3) {
      const year = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JSのDateは0ベース
      const day = parseInt(parts[2]);
      return new Date(year, month, day);
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * メイン実行関数
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🐱 CSVデータ選択的インポートツール

使用方法:
  # プレビュー（実行せずに確認のみ）
  npm run csv:preview

  # 範囲指定インポート
  npm run csv:import -- --start 701606 --end 701630

  # 特定キー指定インポート  
  npm run csv:import -- --keys 701606,701610,701615

  # 最大件数制限
  npm run csv:import -- --start 701606 --end 701630 --max 10

例:
  npm run csv:import -- --start 701606 --end 701630 --max 25
    `);
    process.exit(0);
  }

  const options: ImportOptions = {};

  // コマンドライン引数の解析
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--start":
        options.keyStart = parseInt(args[++i]);
        break;
      case "--end":
        options.keyEnd = parseInt(args[++i]);
        break;
      case "--keys":
        options.specificKeys = args[++i]
          .split(",")
          .map((k) => parseInt(k.trim()));
        break;
      case "--max":
        options.maxRecords = parseInt(args[++i]);
        break;
      case "--preview":
        options.preview = true;
        break;
    }
  }

  try {
    await importSelectedPedigrees(options);
  } catch (error) {
    console.error("❌ インポートエラー:", error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { importSelectedPedigrees };
