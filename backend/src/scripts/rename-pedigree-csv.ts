import * as fsSync from "fs";
import { promises as fs } from "fs";
import * as path from "path";

/**
 * 血統書CSVのフィールド名をリネームして、1行目を削除するスクリプト
 *
 * 変更内容:
 * 1. 1行目（日本語ヘッダー）を削除
 * 2. 祖父母世代以降のフィールド名をF/M略称に変更
 * 3. 必須フィールド: PedigreeID, Gender
 * 4. その他のフィールドはNull可
 */

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const [k, v] = a.replace(/^--/, "").split("=");
      if (k) args[k] = v ?? "";
    }
  }
  return args;
}

function detectInputPath(): string {
  const candidates = [
    path.join(__dirname, "../../NewPedigree/血統書データUTF8Ver.csv"),
    path.join(__dirname, "../../NewPedigree/血統書データUTFVer.csv"),
    path.join(__dirname, "../../NewPedigree/testdatepedigrees100.csv"),
  ];
  for (const p of candidates) {
    if (fsSync.existsSync(p)) return p;
  }
  // 最後の候補をデフォルトとして返し（存在しない場合は呼び出し側でエラーに）
  return candidates[candidates.length - 1];
}

async function renamePedigreeCsvFields() {
  const args = parseArgs(process.argv);
  // ユーザー指定のパスはカレントディレクトリ(process.cwd())基準で解決する。
  // 未指定時のみ、スクリプト位置(__dirname)基準の自動検出/デフォルトを使う。
  const csvPath = args.in
    ? path.isAbsolute(args.in)
      ? args.in
      : path.resolve(process.cwd(), args.in)
    : detectInputPath();
  const outputPath = args.out
    ? path.isAbsolute(args.out)
      ? args.out
      : path.resolve(process.cwd(), args.out)
    : path.join(__dirname, "../../NewPedigree/血統書データRenamed.csv");

  // ファイルの存在確認
  if (!fsSync.existsSync(csvPath)) {
    console.log(`⚠️  入力ファイルが見つかりません: ${csvPath}`);
    console.log('   データファイルを配置してから実行してください。');
    console.log('   使用方法: npm run pedigree:rename -- --in /path/to/input.csv');
    return;
  }

  try {
  console.log("🔄 CSVファイルを読み込み中...");
  console.log(`📂 入力パス: ${csvPath}`);
  console.log(`📂 出力パス: ${outputPath}`);
    const content = await fs.readFile(csvPath, "utf-8");
    const lines = content.split("\n");

    if (lines.length < 2) {
      throw new Error("CSVファイルが正しい形式ではありません（2行未満）");
    }

    console.log(`📊 総行数: ${lines.length}`);
    // 1行目/2行目のどちらがヘッダーかを簡易判定
    const looksLikeHeader = (s: string) => /PedigreeID|Title|Breed|Gender|Date|Name|Color/i.test(s);
    const headerIndex = looksLikeHeader(lines[0]) ? 0 : looksLikeHeader(lines[1]) ? 1 : 0;
    const dataStart = headerIndex + 1;

    console.log(`📝 ヘッダー候補(${headerIndex + 1}行目): ${lines[headerIndex].substring(0, 120)}...`);
    if (headerIndex === 1) {
      console.log(`📝 1行目 (削除想定): ${lines[0].substring(0, 100)}...`);
    }

    // ヘッダーを取得してリネーム
    const originalHeader = lines[headerIndex];
    const renamedHeader = renameFields(originalHeader);

    console.log("🔄 フィールド名をリネーム中...");
    console.log(`📝 リネーム後: ${renamedHeader.substring(0, 100)}...`);

  // ヘッダー行以外のデータを結合（headerIndexより前をスキップ）
  const newContent = [renamedHeader, ...lines.slice(dataStart)].join("\n");

    // 新しいファイルに保存
  await fs.writeFile(outputPath, newContent, "utf-8");

    console.log("✅ CSVファイルのリネームが完了しました");
    console.log(`📁 出力ファイル: ${outputPath}`);
  console.log(`📊 新しい総行数: ${newContent.split("\n").length}`);

    // 結果の確認
  const newLines = newContent.split("\n");
    console.log(`📝 新しいヘッダー: ${newLines[0].substring(0, 150)}...`);
    console.log(`📝 最初のデータ行: ${newLines[1].substring(0, 100)}...`);
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    throw error;
  }
}

/**
 * フィールド名をリネームする関数
 */
function renameFields(headerLine: string): string {
  const fields = headerLine.split(",");
  const originalSet = new Set(fields.map((f) => f.trim()));
  const used = new Set<string>();

  // フィールド名のマッピング（祖父母世代以降をF/M略称に変更）
  const fieldMapping: { [key: string]: string } = {
    // 基本情報（そのまま）
    PedigreeID: "PedigreeID",
    Title: "Title",
    CatteryName: "CatName",
    CatName: "CatName2",
    BreedCode: "BreedCode",
    Gender: "Gender",
    EyeColor: "EyeColor",
    CoatColorCode: "CoatColorCode",
    BirthDate: "BirthDate",
    BreederName: "BreederName",
    OwnerName: "OwnerName",
    RegistrationDate: "RegistrationDate",
    BrotherCount: "BrotherCount",
    SisterCount: "SisterCount",
    Notes: "Notes",
    Notes2: "Notes2",
    OtherNo: "OtherNo",

    // 父母情報（そのまま）
    FatherTitle: "FatherTitle",
    FatherCatteryName: "FatherCatName",
    FatherCatName: "FatherCatName2",
    FatherCoatColor: "FatherCoatColor",
    FatherEyeColor: "FatherEyeColor",
    FatherJCU: "FatherJCU",
    FatherOtherCode: "FatherOtherCode",
    MotherTitle: "MotherTitle",
    MotherCatteryName: "MotherCatName",
  MotherCatName: "MotherCatName2",
    MotherCoatColor: "MotherCoatColor",
    MotherEyeColor: "MotherEyeColor",
    MotherJCU: "MotherJCU",
    MotherOtherCode: "MotherOtherCode",

  // 祖父母世代（F/M略称に変更） 
    PatGrandFatherTitle: "FFTitle",
    PatGrandFatherCatteryName: "FFCatName",
    PatGrandFatherCatName: "FFCatName2",
    PatGrandFatherJCU: "FFJCU",
    PatGrandMotherTitle: "FMTitle",
    PatGrandMotherCatteryName: "FMCatName",
    PatGrandMotherCatName: "FMCatName2",
    PatGrandMotherJCU: "FMJCU",
  PatGrandFatherChampionFlag: "FFChampionFlag",
  PatGrandMotherChampionFlag: "FMChampionFlag",
  MatGrandFatherChampionFlag: "MFChampionFlag",
  MatGrandFatherTitle: "MFTitle",
  MatGrandFatherCatteryName: "MFCatName",
  MatGrandFatherCatName: "MFCatName2",
  MatGrandFatherJCU: "MFJCU",
  MatGrandMotherChampionFlag: "MMChampionFlag",
  MatGrandMotherTitle: "MMTitle",
  MatGrandMotherCatteryName: "MMCatName",
  MatGrandMotherCatName: "MMCatName2",
  MatGrandMotherJCU: "MMJCU",

    // 曾祖父母世代（FF, FM, MF, MM + F/M）
    PatGreatGrandFatherChampionFlag: "FFFChampionFlag",
    PatGreatGrandFatherTitle: "FFFTitle",
    PatGreatGrandFatherCatteryName: "FFFCatteryName",
    PatGreatGrandFatherCatName: "FFFCatName",
    PatGreatGrandFatherJCU: "FFFJCU",
    PatGreatGrandMotherChampionFlag: "FFMChampionFlag",
    PatGreatGrandMotherTitle: "FFMTitle",
    PatGreatGrandMotherCatteryName: "FFMCatteryName",
    PatGreatGrandMotherCatName: "FFMCatName",
    PatGreatGrandMotherJCU: "FFMJCU",
    PatGreatGrandFatherMatChampionFlag: "FMFChampionFlag",
    PatGreatGrandFatherMatTitle: "FMFTitle",
    PatGreatGrandFatherMatCatteryName: "FMFCatteryName",
    PatGreatGrandFatherMatCatName: "FMFCatName",
    PatGreatGrandFatherMatJCU: "FMFJCU",
    PatGreatGrandMotherMatChampionFlag: "FMMChampionFlag",
    PatGreatGrandMotherMatTitle: "FMMTitle",
    PatGreatGrandMotherMatCatteryName: "FMMCatteryName",
    PatGreatGrandMotherMatCatName: "FMMCatName",
    PatGreatGrandMotherMatJCU: "FMMJCU",
    MatGreatGrandFatherChampionFlag: "MFFChampionFlag",
    MatGreatGrandFatherTitle: "MFFTitle",
    MatGreatGrandFatherCatteryName: "MFFCatteryName",
    MatGreatGrandFatherCatName: "MFFCatName",
    MatGreatGrandFatherJCU: "MFFJCU",
    MatGreatGrandMotherChampionFlag: "MFMChampionFlag",
    MatGreatGrandMotherTitle: "MFMTitle",
    MatGreatGrandMotherCatteryName: "MFMCatteryName",
    MatGreatGrandMotherCatName: "MFMCatName",
    MatGreatGrandMotherJCU: "MFMJCU",
    MatGreatGrandFatherMatChampionFlag: "MMFChampionFlag",
    MatGreatGrandFatherMatTitle: "MMFTitle",
    MatGreatGrandFatherMatCatteryName: "MMFCatteryName",
    MatGreatGrandFatherMatCatName: "MMFCatName",
    MatGreatGrandFatherMatJCU: "MMFJCU",
    MatGreatGrandMotherMatChampionFlag: "MMMChampionFlag",
    MatGreatGrandMotherMatTitle: "MMMTitle",
    MatGreatGrandMotherMatCatteryName: "MMMCatteryName",
    MatGreatGrandMotherMatCatName: "MMMCatName",
    MatGreatGrandMotherMatJCU: "MMMJCU",

    // その他
    OldCode: "OldCode",
  };

  // フィールド名をマッピングに従って変更
  const renamedFields = fields.map((field) => {
    const trimmedField = field.trim();
    let target = fieldMapping[trimmedField] || trimmedField;

    // 既に「*2」列が存在する場合、同じ「*2」へのリネームはスキップして重複を回避
    if (target !== trimmedField && originalSet.has(target) && /2$/.test(target)) {
      target = trimmedField; // 末尾2が既にあるので、この列は元のままにする
    }

    // 同一実行中の重複も回避（例えば前列のリネーム結果と衝突した場合）
    if (used.has(target) && target !== trimmedField) {
      // 衝突時はオリジナル名を維持
      target = trimmedField;
    }

    used.add(target);
    return target;
  });

  return renamedFields.join(",");
}

// スクリプト実行
if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  (async () => {
    try {
      await renamePedigreeCsvFields();
      console.log("🎉 血統書CSVのリネームが完了しました！");
      process.exit(0);
    } catch (error) {
      console.error("💥 リネーム処理でエラーが発生しました:", error);
      process.exit(1);
    }
  })();
}

export { renamePedigreeCsvFields };
