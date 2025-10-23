import * as fs from "node:fs";
import * as path from "node:path";

import { PrismaClient } from "@prisma/client";
import csv from "csv-parser";

const prisma = new PrismaClient();

interface BreedData {
  key: string;
  name: string;
}

interface CoatColorData {
  key: string;
  name: string;
}

interface PedigreeData {
  PedigreeID: string;
  Title: string;
  CatName: string;
  CatName2: string;
  BreedCode: string;
  Gender: string; // CSV header uses "Gender", maps to genderCode in database
  EyeColor: string;
  CoatColorCode: string;
  BirthDate: string;
  BreederName: string;
  OwnerName: string;
  RegistrationDate: string;
  BrotherCount: string;
  SisterCount: string;
  Notes: string;
  Notes2: string;
  OtherNo: string;
  // Father data
  FatherTitle: string;
  FatherName: string;
  FatherCatName2: string;
  FatherCoatColor: string;
  FatherEyeColor: string;
  FatherJCU: string;
  FatherOtherCode: string;
  // Mother data
  MotherTitle: string;
  MotherCatName: string;
  MotherCatName2: string;
  MotherCoatColor: string;
  MotherEyeColor: string;
  MotherJCU: string;
  MotherOtherCode: string;
  // Grandparents data - Father's Father's side
  FFTitle: string;
  FFCatName: string;
  FFCatColor: string;
  FFJCU: string;
  // Grandparents data - Father's Mother's side
  FMTitle: string;
  FMCatName: string;
  FMCatColor: string;
  FMJCU: string;
  // Grandparents data - Mother's Father's side
  MFTitle: string;
  MFCatName: string;
  MFCatColor: string;
  MFJCU: string;
  // Grandparents data - Mother's Mother's side
  MMTitle: string;
  MMCatName: string;
  MMCatColor: string;
  MMJCU: string;
  // Great-grandparents data - Father's Father's Father's side
  FFFTitle: string;
  FFFCatName: string;
  FFFCatColor: string;
  FFFJCU: string;
  // Great-grandparents data - Father's Father's Mother's side
  FFMTitle: string;
  FFMCatName: string;
  FFMCatColor: string;
  FFMJCU: string;
  // Great-grandparents data - Father's Mother's Father's side
  FMFTitle: string;
  FMFCatName: string;
  FMFCatColor: string;
  FMFJCU: string;
  // Great-grandparents data - Father's Mother's Mother's side
  FMMTitle: string;
  FMMCatName: string;
  FMMCatColor: string;
  FMMJCU: string;
  // Great-grandparents data - Mother's Father's Father's side
  MFFTitle: string;
  MFFCatName: string;
  MFFCatColor: string;
  MFFJCU: string;
  // Great-grandparents data - Mother's Father's Mother's side
  MFMTitle: string;
  MFMCatName: string;
  MFMCatColor: string;
  MFMJCU: string;
  // Great-grandparents data - Mother's Mother's Father's side
  MMFTitle: string;
  MMFCatName: string;
  MMFCatColor: string;
  MMFJCU: string;
  // Great-grandparents data - Mother's Mother's Mother's side
  MMMTitle: string;
  MMMCatName: string;
  MMMCatColor: string;
  MMMJCU: string;
  OldCode: string;
}

async function importBreeds() {
  console.log("🐱 Importing breed data...");

  const breeds: BreedData[] = [];
  const csvPath = path.join(
    __dirname,
    "../../NewPedigree/猫種データUTF8Ver.csv",
  );

  // Use absolute path to ensure it works regardless of execution context
  const absoluteCsvPath = path.resolve(__dirname, "../../NewPedigree/猫種データUTF8Ver.csv");

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(absoluteCsvPath)
      .pipe(csv({ headers: ["key", "name"] }))
      .on("data", (data: BreedData) => {
        if (data.key && data.name && data.key !== "キー") {
          breeds.push(data);
        }
      })
      .on("end", async () => {
        try {
          const processedNames = new Set<string>();
          for (const breed of breeds) {
            const code = parseInt(breed.key);
            const trimmedName = breed.name.trim();
            if (
              !isNaN(code) &&
              trimmedName &&
              !processedNames.has(trimmedName)
            ) {
              processedNames.add(trimmedName);
              await prisma.breed.upsert({
                where: { code },
                update: { name: trimmedName },
                create: {
                  code,
                  name: trimmedName,
                },
              });
            }
          }
          console.log(`✅ Imported ${breeds.length} breeds`);
          resolve();
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      })
  .on("error", (err) => reject(err instanceof Error ? err : new Error(String(err))));
  });
}

async function importCoatColors() {
  console.log("🎨 Importing coat color data...");

  const colors: CoatColorData[] = [];
  const csvPath = path.join(
    __dirname,
    "../../NewPedigree/色柄データUTF8Ver.csv",
  );

  // Use absolute path to ensure it works regardless of execution context
  const absoluteCsvPath = path.resolve(__dirname, "../../NewPedigree/色柄データUTF8Ver.csv");

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(absoluteCsvPath)
      .pipe(csv({ headers: ["key", "name"] }))
      .on("data", (data: CoatColorData) => {
        if (data.key && data.name && data.key !== "キー") {
          colors.push(data);
        }
      })
      .on("end", async () => {
        try {
          const processedColorNames = new Set<string>();
          for (const color of colors) {
            const code = parseInt(color.key);
            const trimmedName = color.name.trim();
            if (
              !isNaN(code) &&
              trimmedName &&
              !processedColorNames.has(trimmedName)
            ) {
              processedColorNames.add(trimmedName);
              await prisma.coatColor.upsert({
                where: { code },
                update: { name: trimmedName },
                create: {
                  code,
                  name: trimmedName,
                },
              });
            }
          }
          console.log(`✅ Imported ${colors.length} coat colors`);
          resolve();
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      })
      .on("error", (err) => reject(err instanceof Error ? err : new Error(String(err))));
  });
}

async function assertCsvHeaders(csvPath: string, expected: string[]): Promise<void> {
  const fullPath = path.resolve(__dirname, "../../NewPedigree/", path.basename(csvPath));
  const content = fs.readFileSync(fullPath, "utf-8");
  const firstLine = content.split("\n")[0];
  if (!firstLine) {
    throw new Error("Could not read CSV header");
  }
  const header = firstLine.split(",").map(h => h.trim());
  const missing = expected.filter((k) => !header.includes(k));
  if (missing.length > 0) {
    throw new Error(`CSV header missing keys: ${missing.join(", ")}`);
  }
}

async function importPedigrees() {
  console.log("📜 Importing pedigree data...");

  const pedigrees: PedigreeData[] = [];
  const csvPath = path.join(
    process.cwd(),
    "NewPedigree/血統書データRenamed.csv",
  );

  // Use absolute path to ensure it works regardless of execution context
  const absoluteCsvPath = path.resolve(process.cwd(), "NewPedigree/血統書データRenamed.csv");

  // Define headers based on actual CSV structure
  const headers = [
    "PedigreeID",
    "Title",
    "CatName",
    "CatName2",
    "BreedCode",
    "Gender",
    "EyeColor",
    "CoatColorCode",
    "BirthDate",
    "BreederName",
    "OwnerName",
    "RegistrationDate",
    "BrotherCount",
    "SisterCount",
    "Notes",
    "Notes2",
    "OtherNo",
    "FatherTitle",
    "FatherName",
    "FatherCatName2",
    "FatherCoatColor",
    "FatherEyeColor",
    "FatherJCU",
    "FatherOtherCode",
    "MotherTitle",
    "MotherCatName",
    "MotherCatName2",
    "MotherCoatColor",
    "MotherEyeColor",
    "MotherJCU",
    "MotherOtherCode",
    "FFTitle",
    "FFCatName",
    "FFCatColor",
    "FFJCU",
    "FMTitle",
    "FMCatName",
    "FMCatColor",
    "FMJCU",
    "MFTitle",
    "MFCatName",
    "MFCatColor",
    "MFJCU",
    "MMTitle",
    "MMCatName",
    "MMCatColor",
    "MMJCU",
    "FFFTitle",
    "FFFCatName",
    "FFFCatColor",
    "FFFJCU",
    "FFMTitle",
    "FFMCatName",
    "FFMCatColor",
    "FFMJCU",
    "FMFTitle",
    "FMFCatName",
    "FMFCatColor",
    "FMFJCU",
    "FMMTitle",
    "FMMCatName",
    "FMMCatColor",
    "FMMJCU",
    "MFFTitle",
    "MFFCatName",
    "MFFCatColor",
    "MFFJCU",
    "MFMTitle",
    "MFMCatName",
    "MFMCatColor",
    "MFMJCU",
    "MMFTitle",
    "MMFCatName",
    "MMFCatColor",
    "MMFJCU",
    "MMMTitle",
    "MMMCatName",
    "MMMCatColor",
    "MMMJCU",
    "OldCode",
  ];

  // Early check: CSV header must include expected columns
  await assertCsvHeaders(csvPath, headers);
  // Additional fields...
  return new Promise<void>((resolve, reject) => {
    let rowCount = 0;

    fs.createReadStream(absoluteCsvPath)
      .pipe(csv({ headers }))
      .on("data", (data: PedigreeData) => {
        rowCount++;
        if (data.PedigreeID) {
          // Skip empty rows
          pedigrees.push(data);
        }
      })
      .on("end", async () => {
        try {
          console.log(`Processing ${pedigrees.length} pedigrees...`);

          // Import in batches to avoid memory issues
          const batchSize = 100;
          for (let i = 0; i < pedigrees.length; i += batchSize) {
            const batch = pedigrees.slice(i, i + batchSize);

            for (const pedigree of batch) {
              try {
                // Parse dates as strings (not Date objects)
                const birthDate = pedigree.BirthDate || null;
                const registrationDate = pedigree.RegistrationDate || null;

                // Parse numbers
                const breedCode = pedigree.BreedCode
                  ? parseInt(pedigree.BreedCode)
                  : null;
                const coatColorCode = pedigree.CoatColorCode
                  ? parseInt(pedigree.CoatColorCode)
                  : null;
                const genderCode = pedigree.Gender
                  ? parseInt(pedigree.Gender)
                  : null;
                const brotherCount = pedigree.BrotherCount
                  ? parseInt(pedigree.BrotherCount)
                  : null;
                const sisterCount = pedigree.SisterCount
                  ? parseInt(pedigree.SisterCount)
                  : null;

                await prisma.pedigree.upsert({
                  where: { pedigreeId: pedigree.PedigreeID.toString() },
                  update: {
                    title: pedigree.Title || null,
                    catName: pedigree.CatName || "",
                    catName2: pedigree.CatName2 || null,
                    breedCode,
                    genderCode,
                    eyeColor: pedigree.EyeColor || null,
                    coatColorCode,
                    birthDate,
                    breederName: pedigree.BreederName || null,
                    ownerName: pedigree.OwnerName || null,
                    registrationDate,
                    brotherCount,
                    sisterCount,
                    notes: pedigree.Notes || null,
                    notes2: pedigree.Notes2 || null,
                    otherNo: pedigree.OtherNo || null,
                    // Father data
                    fatherTitle: pedigree.FatherTitle || null,
                    fatherCatName: pedigree.FatherName || null,
                    fatherCatName2: pedigree.FatherCatName2 || null,
                    fatherCoatColor: pedigree.FatherCoatColor || null,
                    fatherEyeColor: pedigree.FatherEyeColor || null,
                    fatherJCU: pedigree.FatherJCU || null,
                    fatherOtherCode: pedigree.FatherOtherCode || null,
                    // Mother data
                    motherTitle: pedigree.MotherTitle || null,
                    motherCatName: pedigree.MotherCatName || null,
                    motherCatName2: pedigree.MotherCatName2 || null,
                    motherCoatColor: pedigree.MotherCoatColor || null,
                    motherEyeColor: pedigree.MotherEyeColor || null,
                    motherJCU: pedigree.MotherJCU || null,
                    motherOtherCode: pedigree.MotherOtherCode || null,
                    // Grandparents data - Father's Father's side
                    ffTitle: pedigree.FFTitle || null,
                    ffCatName: pedigree.FFCatName || null,
                    ffCatColor: pedigree.FFCatColor || null,
                    ffjcu: pedigree.FFJCU || null,
                    // Grandparents data - Father's Mother's side
                    fmTitle: pedigree.FMTitle || null,
                    fmCatName: pedigree.FMCatName || null,
                    fmCatColor: pedigree.FMCatColor || null,
                    fmjcu: pedigree.FMJCU || null,
                    // Grandparents data - Mother's Father's side
                    mfTitle: pedigree.MFTitle || null,
                    mfCatName: pedigree.MFCatName || null,
                    mfCatColor: pedigree.MFCatColor || null,
                    mfjcu: pedigree.MFJCU || null,
                    // Grandparents data - Mother's Mother's side
                    mmTitle: pedigree.MMTitle || null,
                    mmCatName: pedigree.MMCatName || null,
                    mmCatColor: pedigree.MMCatColor || null,
                    mmjcu: pedigree.MMJCU || null,
                    // Great-grandparents data - Father's Father's Father's side
                    fffTitle: pedigree.FFFTitle || null,
                    fffCatName: pedigree.FFFCatName || null,
                    fffCatColor: pedigree.FFFCatColor || null,
                    fffjcu: pedigree.FFFJCU || null,
                    // Great-grandparents data - Father's Father's Mother's side
                    ffmTitle: pedigree.FFMTitle || null,
                    ffmCatName: pedigree.FFMCatName || null,
                    ffmCatColor: pedigree.FFMCatColor || null,
                    ffmjcu: pedigree.FFMJCU || null,
                    // Great-grandparents data - Father's Mother's Father's side
                    fmfTitle: pedigree.FMFTitle || null,
                    fmfCatName: pedigree.FMFCatName || null,
                    fmfCatColor: pedigree.FMFCatColor || null,
                    fmfjcu: pedigree.FMFJCU || null,
                    // Great-grandparents data - Father's Mother's Mother's side
                    fmmTitle: pedigree.FMMTitle || null,
                    fmmCatName: pedigree.FMMCatName || null,
                    fmmCatColor: pedigree.FMMCatColor || null,
                    fmmjcu: pedigree.FMMJCU || null,
                    // Great-grandparents data - Mother's Father's Father's side
                    mffTitle: pedigree.MFFTitle || null,
                    mffCatName: pedigree.MFFCatName || null,
                    mffCatColor: pedigree.MFFCatColor || null,
                    mffjcu: pedigree.MFFJCU || null,
                    // Great-grandparents data - Mother's Father's Mother's side
                    mfmTitle: pedigree.MFMTitle || null,
                    mfmCatName: pedigree.MFMCatName || null,
                    mfmCatColor: pedigree.MFMCatColor || null,
                    mfmjcu: pedigree.MFMJCU || null,
                    // Great-grandparents data - Mother's Mother's Father's side
                    mmfTitle: pedigree.MMFTitle || null,
                    mmfCatName: pedigree.MMFCatName || null,
                    mmfCatColor: pedigree.MMFCatColor || null,
                    mmfjcu: pedigree.MMFJCU || null,
                    // Great-grandparents data - Mother's Mother's Mother's side
                    mmmTitle: pedigree.MMMTitle || null,
                    mmmCatName: pedigree.MMMCatName || null,
                    mmmCatColor: pedigree.MMMCatColor || null,
                    mmmjcu: pedigree.MMMJCU || null,
                    oldCode: pedigree.OldCode || null,
                  },
                  create: {
                    pedigreeId: pedigree.PedigreeID.toString(),
                    title: pedigree.Title || null,
                    catName: pedigree.CatName || "",
                    catName2: pedigree.CatName2 || null,
                    breedCode,
                    genderCode,
                    eyeColor: pedigree.EyeColor || null,
                    coatColorCode,
                    birthDate,
                    breederName: pedigree.BreederName || null,
                    ownerName: pedigree.OwnerName || null,
                    registrationDate,
                    brotherCount,
                    sisterCount,
                    notes: pedigree.Notes || null,
                    notes2: pedigree.Notes2 || null,
                    otherNo: pedigree.OtherNo || null,
                    // Father data
                    fatherTitle: pedigree.FatherTitle || null,
                    fatherCatName: pedigree.FatherName || null,
                    fatherCatName2: pedigree.FatherCatName2 || null,
                    fatherCoatColor: pedigree.FatherCoatColor || null,
                    fatherEyeColor: pedigree.FatherEyeColor || null,
                    fatherJCU: pedigree.FatherJCU || null,
                    fatherOtherCode: pedigree.FatherOtherCode || null,
                    // Mother data
                    motherTitle: pedigree.MotherTitle || null,
                    motherCatName: pedigree.MotherCatName || null,
                    motherCatName2: pedigree.MotherCatName2 || null,
                    motherCoatColor: pedigree.MotherCoatColor || null,
                    motherEyeColor: pedigree.MotherEyeColor || null,
                    motherJCU: pedigree.MotherJCU || null,
                    motherOtherCode: pedigree.MotherOtherCode || null,
                    // Grandparents data - Father's Father's side
                    ffTitle: pedigree.FFTitle || null,
                    ffCatName: pedigree.FFCatName || null,
                    ffCatColor: pedigree.FFCatColor || null,
                    ffjcu: pedigree.FFJCU || null,
                    // Grandparents data - Father's Mother's side
                    fmTitle: pedigree.FMTitle || null,
                    fmCatName: pedigree.FMCatName || null,
                    fmCatColor: pedigree.FMCatColor || null,
                    fmjcu: pedigree.FMJCU || null,
                    // Grandparents data - Mother's Father's side
                    mfTitle: pedigree.MFTitle || null,
                    mfCatName: pedigree.MFCatName || null,
                    mfCatColor: pedigree.MFCatColor || null,
                    mfjcu: pedigree.MFJCU || null,
                    // Grandparents data - Mother's Mother's side
                    mmTitle: pedigree.MMTitle || null,
                    mmCatName: pedigree.MMCatName || null,
                    mmCatColor: pedigree.MMCatColor || null,
                    mmjcu: pedigree.MMJCU || null,
                    // Great-grandparents data - Father's Father's Father's side
                    fffTitle: pedigree.FFFTitle || null,
                    fffCatName: pedigree.FFFCatName || null,
                    fffCatColor: pedigree.FFFCatColor || null,
                    fffjcu: pedigree.FFFJCU || null,
                    // Great-grandparents data - Father's Father's Mother's side
                    ffmTitle: pedigree.FFMTitle || null,
                    ffmCatName: pedigree.FFMCatName || null,
                    ffmCatColor: pedigree.FFMCatColor || null,
                    ffmjcu: pedigree.FFMJCU || null,
                    // Great-grandparents data - Father's Mother's Father's side
                    fmfTitle: pedigree.FMFTitle || null,
                    fmfCatName: pedigree.FMFCatName || null,
                    fmfCatColor: pedigree.FMFCatColor || null,
                    fmfjcu: pedigree.FMFJCU || null,
                    // Great-grandparents data - Father's Mother's Mother's side
                    fmmTitle: pedigree.FMMTitle || null,
                    fmmCatName: pedigree.FMMCatName || null,
                    fmmCatColor: pedigree.FMMCatColor || null,
                    fmmjcu: pedigree.FMMJCU || null,
                    // Great-grandparents data - Mother's Father's Father's side
                    mffTitle: pedigree.MFFTitle || null,
                    mffCatName: pedigree.MFFCatName || null,
                    mffCatColor: pedigree.MFFCatColor || null,
                    mffjcu: pedigree.MFFJCU || null,
                    // Great-grandparents data - Mother's Father's Mother's side
                    mfmTitle: pedigree.MFMTitle || null,
                    mfmCatName: pedigree.MFMCatName || null,
                    mfmCatColor: pedigree.MFMCatColor || null,
                    mfmjcu: pedigree.MFMJCU || null,
                    // Great-grandparents data - Mother's Mother's Father's side
                    mmfTitle: pedigree.MMFTitle || null,
                    mmfCatName: pedigree.MMFCatName || null,
                    mmfCatColor: pedigree.MMFCatColor || null,
                    mmfjcu: pedigree.MMFJCU || null,
                    // Great-grandparents data - Mother's Mother's Mother's side
                    mmmTitle: pedigree.MMMTitle || null,
                    mmmCatName: pedigree.MMMCatName || null,
                    mmmCatColor: pedigree.MMMCatColor || null,
                    mmmjcu: pedigree.MMMJCU || null,
                    oldCode: pedigree.OldCode || null,
                  },
                });
              } catch (error) {
                console.warn(
                  `Warning: Failed to import pedigree ${pedigree.PedigreeID}:`,
                  error,
                );
              }
            }

            console.log(
              `Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(pedigrees.length / batchSize)}`,
            );
          }

          console.log(`✅ Imported ${pedigrees.length} pedigrees`);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on("error", (err) => reject(err instanceof Error ? err : new Error(String(err))));
  });
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === "") return null;

  // Handle different date formats
  const formats = [
    /(\d{4})\.(\d{1,2})\.(\d{1,2})/, // YYYY.MM.DD
    /(\d{4})-(\d{1,2})-(\d{1,2})/, // YYYY-MM-DD
    /(\d{4})\/(\d{1,2})\/(\d{1,2})/, // YYYY/MM/DD
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]);
      const day = parseInt(match[3]);

      if (
        year > 1900 &&
        year < 2100 &&
        month >= 1 &&
        month <= 12 &&
        day >= 1 &&
        day <= 31
      ) {
        return new Date(year, month - 1, day);
      }
    }
  }

  return null;
}

async function main() {
  try {
    console.log("🚀 Starting CSV data import...");

    await importBreeds();
    await importCoatColors();
    await importPedigrees();

    console.log("🎉 All data imported successfully!");

    // Display summary
    const breedCount = await prisma.breed.count();
    const colorCount = await prisma.coatColor.count();
    const pedigreeCount = await prisma.pedigree.count();

    console.log("\n📊 Import Summary:");
    console.log(`   Breeds: ${breedCount}`);
    console.log(`   Coat Colors: ${colorCount}`);
    console.log(`   Pedigrees: ${pedigreeCount}`);
  } catch (error) {
    console.error("❌ Import failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  void (async (): Promise<void> => {
    try {
      await main();
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}

export { importBreeds, importCoatColors, importPedigrees };
