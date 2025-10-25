import * as fs from "fs";
import * as path from "path";

import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse";

import { batchTransaction } from "./utils/prisma-batch";

const prisma = new PrismaClient();

/**
 * 親血統書インポートスクリプト
 * 現在のサンプルデータの父母を追加でインポート
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

async function importParentPedigrees() {
  const csvPath = path.join(
    __dirname,
    "../../NewPedigree/血統書データRenamed.csv",
  );

  // 親のIDリスト（JCUから抽出した番号）
  const parentIds = [
    "163553",
    "169010",
    "700538",
    "142007",
    "700900",
    "150501",
    "116197",
  ];

  try {
    console.log("🔄 親血統書データのインポートを開始...\n");

    const records: PedigreeData[] = [];

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(
          parse({
            columns: true,
            skip_empty_lines: true,
            trim: true,
          }),
        )
        .on("data", (record: Record<string, string>) => {
          // 親のIDが含まれる血統書のみ処理
          if (parentIds.includes(record.PedigreeID)) {
            records.push({
              PedigreeID: record.PedigreeID,
              Title: record.Title ?? undefined,
              CatteryName: record.CatteryName ?? "",
              CatName: record.CatName ?? "",
              BreedCode: record.BreedCode,
              Gender: record.Gender,
              EyeColor: record.EyeColor ?? undefined,
              CoatColorCode: record.CoatColorCode,
              BirthDate: record.BirthDate,
              BreederName: record.BreederName ?? "",
              OwnerName: record.OwnerName ?? "",
              RegistrationDate: record.RegistrationDate,
              BrotherCount: record.BrotherCount ?? "0",
              SisterCount: record.SisterCount ?? "0",
              Notes: record.Notes ?? undefined,
              Notes2: record.Notes2 ?? undefined,
              OtherNo: record.OtherNo ?? undefined,
            });
          }
        })
        .on("end", () => {
          console.log(`📊 見つかった親血統書: ${records.length}件`);
          resolve();
        })
        .on("error", reject);
    });

    const result = await batchTransaction(
      prisma,
      records,
      async (tx, record) => {
        // 既に存在するかチェック
        const existing = await tx.pedigree.findUnique({
          where: { pedigreeId: record.PedigreeID },
        });
        if (existing) return; // スキップ

        const birthDate = record.BirthDate
          ? new Date(record.BirthDate.replace(/\./g, "-")).toISOString()
          : null;
        const registrationDate = record.RegistrationDate
          ? new Date(record.RegistrationDate.replace(/\./g, "-")).toISOString()
          : null;

        await tx.pedigree.create({
          data: {
            pedigreeId: record.PedigreeID,
            title: record.Title ?? null,
            catName: record.CatName ?? "",
            breedCode: parseInt(record.BreedCode, 10),
            genderCode: parseInt(record.Gender, 10),
            eyeColor: record.EyeColor ?? null,
            coatColorCode: parseInt(record.CoatColorCode, 10),
            birthDate,
            breederName: record.BreederName ?? null,
            ownerName: record.OwnerName ?? null,
            registrationDate,
            brotherCount: parseInt(record.BrotherCount, 10),
            sisterCount: parseInt(record.SisterCount, 10),
            notes: record.Notes ?? null,
            notes2: record.Notes2 ?? null,
            otherNo: record.OtherNo ?? null,
          },
        });
      },
      { batchSize: 200, logEvery: 1000, label: "parentPedigrees" },
    );

    console.log("\n🎉 親血統書インポート完了！");
    console.log(`📊 成功: ${result.success}件`);
    console.log(`❌ エラー: ${result.failed}件`);
  } catch (error) {
    console.error("💥 インポート処理でエラーが発生しました:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// スクリプト実行
if (require.main === module) {
  importParentPedigrees()
    .then(() => {
      console.log("🎉 親血統書インポートが完了しました！");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 インポート処理でエラーが発生しました:", error);
      process.exit(1);
    });
}

export { importParentPedigrees };
