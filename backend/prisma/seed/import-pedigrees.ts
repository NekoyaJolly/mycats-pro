import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface PedigreeRecord {
  pedigree_id: string;
  title: string;
  cat_name: string;
  cat_name2: string;
  breed_code: string;
  gender_code: string;
  eye_color: string;
  coat_color_code: string;
  birth_date: string;
  breeder_name: string;
  owner_name: string;
  registration_date: string;
  brother_count: string;
  sister_count: string;
  notes: string;
  notes2: string;
  other_no: string;
  father_title: string;
  father_cat_name: string;
  father_cat_name2: string;
  father_coat_color: string;
  father_eye_color: string;
  father_jcu: string;
  father_other_code: string;
  mother_title: string;
  mother_cat_name: string;
  mother_cat_name2: string;
  mother_coat_color: string;
  mother_eye_color: string;
  mother_jcu: string;
  mother_other_code: string;
  ff_title: string;
  ff_cat_name: string;
  ff_cat_color: string;
  ffjcu: string;
  fm_title: string;
  fm_cat_name: string;
  fm_cat_color: string;
  fmjcu: string;
  mf_title: string;
  mf_cat_name: string;
  mf_cat_color: string;
  mfjcu: string;
  mm_title: string;
  mm_cat_name: string;
  mm_cat_color: string;
  mmjcu: string;
  fff_title: string;
  fff_cat_name: string;
  fff_cat_color: string;
  fffjcu: string;
  ffm_title: string;
  ffm_cat_name: string;
  ffm_cat_color: string;
  ffmjcu: string;
  fmf_title: string;
  fmf_cat_name: string;
  fmf_cat_color: string;
  fmfjcu: string;
  fmm_title: string;
  fmm_cat_name: string;
  fmm_cat_color: string;
  fmmjcu: string;
  mff_title: string;
  mff_cat_name: string;
  mff_cat_color: string;
  mffjcu: string;
  mfm_title: string;
  mfm_cat_name: string;
  mfm_cat_color: string;
  mfmjcu: string;
  mmf_title: string;
  mmf_cat_name: string;
  mmf_cat_color: string;
  mmfjcu: string;
  mmm_title: string;
  mmm_cat_name: string;
  mmm_cat_color: string;
  mmmjcu: string;
  old_code: string;
}

// 数値フィールドの変換（空文字列はnullに）
const parseIntOrNull = (value: string) => {
  if (!value || value.trim() === '') return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
};

// 文字列フィールドの変換（空文字列はundefinedに）
const parseStringOrUndefined = (value: string) => {
  if (!value || value.trim() === '') return undefined;
  return value;
};

async function main() {
  const csvFilePath = path.join(__dirname, 'testdatepedigrees100_snake.csv');
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

  // CSVをパース
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as PedigreeRecord[];

  console.log(`Found ${records.length} records to import`);
  
  // デバッグ: 最初のレコードを確認
  if (records.length > 0) {
    const firstRecord = records[0] as any;
    console.log('First record keys:', Object.keys(firstRecord));
    console.log('First record pedigree_id:', firstRecord['pedigree_id']);
  }

  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    try {
      // pedigree_idを取得
      const recordAny = record as any;
      const pedigreeIdValue = recordAny.pedigree_id || recordAny['pedigree_id'];
      
      if (!pedigreeIdValue) {
        console.error('Skipping record with missing pedigree_id');
        errorCount++;
        continue;
      }

      console.log(`About to insert: pedigreeId="${pedigreeIdValue}", type=${typeof pedigreeIdValue}, length=${pedigreeIdValue.length}`);

      await prisma.pedigree.create({
        data: {
          pedigreeId: pedigreeIdValue,
          title: parseStringOrUndefined(recordAny.title),
          catName: parseStringOrUndefined(recordAny.cat_name),
          catName2: parseStringOrUndefined(recordAny.cat_name2),
          breedCode: parseIntOrNull(recordAny.breed_code) ?? undefined,
          genderCode: parseIntOrNull(recordAny.gender_code) ?? undefined,
          eyeColor: parseStringOrUndefined(recordAny.eye_color),
          coatColorCode: parseIntOrNull(recordAny.coat_color_code) ?? undefined,
          birthDate: parseStringOrUndefined(recordAny.birth_date),
          breederName: parseStringOrUndefined(recordAny.breeder_name),
          ownerName: parseStringOrUndefined(recordAny.owner_name),
          registrationDate: parseStringOrUndefined(recordAny.registration_date),
          brotherCount: parseIntOrNull(recordAny.brother_count) ?? undefined,
          sisterCount: parseIntOrNull(recordAny.sister_count) ?? undefined,
          notes: parseStringOrUndefined(recordAny.notes),
          notes2: parseStringOrUndefined(recordAny.notes2),
          otherNo: parseStringOrUndefined(recordAny.other_no),
          fatherTitle: parseStringOrUndefined(recordAny.father_title),
          fatherCatName: parseStringOrUndefined(recordAny.father_cat_name),
          fatherCatName2: parseStringOrUndefined(recordAny.father_cat_name2),
          fatherCoatColor: parseStringOrUndefined(recordAny.father_coat_color),
          fatherEyeColor: parseStringOrUndefined(recordAny.father_eye_color),
          fatherJCU: parseStringOrUndefined(recordAny.father_jcu),
          fatherOtherCode: parseStringOrUndefined(recordAny.father_other_code),
          motherTitle: parseStringOrUndefined(recordAny.mother_title),
          motherCatName: parseStringOrUndefined(recordAny.mother_cat_name),
          motherCatName2: parseStringOrUndefined(recordAny.mother_cat_name2),
          motherCoatColor: parseStringOrUndefined(recordAny.mother_coat_color),
          motherEyeColor: parseStringOrUndefined(recordAny.mother_eye_color),
          motherJCU: parseStringOrUndefined(recordAny.mother_jcu),
          motherOtherCode: parseStringOrUndefined(recordAny.mother_other_code),
          ffTitle: parseStringOrUndefined(recordAny.ff_title),
          ffCatName: parseStringOrUndefined(recordAny.ff_cat_name),
          ffCatColor: parseStringOrUndefined(recordAny.ff_cat_color),
          ffjcu: parseStringOrUndefined(recordAny.ffjcu),
          fmTitle: parseStringOrUndefined(recordAny.fm_title),
          fmCatName: parseStringOrUndefined(recordAny.fm_cat_name),
          fmCatColor: parseStringOrUndefined(recordAny.fm_cat_color),
          fmjcu: parseStringOrUndefined(recordAny.fmjcu),
          mfTitle: parseStringOrUndefined(recordAny.mf_title),
          mfCatName: parseStringOrUndefined(recordAny.mf_cat_name),
          mfCatColor: parseStringOrUndefined(recordAny.mf_cat_color),
          mfjcu: parseStringOrUndefined(recordAny.mfjcu),
          mmTitle: parseStringOrUndefined(recordAny.mm_title),
          mmCatName: parseStringOrUndefined(recordAny.mm_cat_name),
          mmCatColor: parseStringOrUndefined(recordAny.mm_cat_color),
          mmjcu: parseStringOrUndefined(recordAny.mmjcu),
          fffTitle: parseStringOrUndefined(recordAny.fff_title),
          fffCatName: parseStringOrUndefined(recordAny.fff_cat_name),
          fffCatColor: parseStringOrUndefined(recordAny.fff_cat_color),
          fffjcu: parseStringOrUndefined(recordAny.fffjcu),
          ffmTitle: parseStringOrUndefined(recordAny.ffm_title),
          ffmCatName: parseStringOrUndefined(recordAny.ffm_cat_name),
          ffmCatColor: parseStringOrUndefined(recordAny.ffm_cat_color),
          ffmjcu: parseStringOrUndefined(recordAny.ffmjcu),
          fmfTitle: parseStringOrUndefined(recordAny.fmf_title),
          fmfCatName: parseStringOrUndefined(recordAny.fmf_cat_name),
          fmfCatColor: parseStringOrUndefined(recordAny.fmf_cat_color),
          fmfjcu: parseStringOrUndefined(recordAny.fmfjcu),
          fmmTitle: parseStringOrUndefined(recordAny.fmm_title),
          fmmCatName: parseStringOrUndefined(recordAny.fmm_cat_name),
          fmmCatColor: parseStringOrUndefined(recordAny.fmm_cat_color),
          fmmjcu: parseStringOrUndefined(recordAny.fmmjcu),
          mffTitle: parseStringOrUndefined(recordAny.mff_title),
          mffCatName: parseStringOrUndefined(recordAny.mff_cat_name),
          mffCatColor: parseStringOrUndefined(recordAny.mff_cat_color),
          mffjcu: parseStringOrUndefined(recordAny.mffjcu),
          mfmTitle: parseStringOrUndefined(recordAny.mfm_title),
          mfmCatName: parseStringOrUndefined(recordAny.mfm_cat_name),
          mfmCatColor: parseStringOrUndefined(recordAny.mfm_cat_color),
          mfmjcu: parseStringOrUndefined(recordAny.mfmjcu),
          mmfTitle: parseStringOrUndefined(recordAny.mmf_title),
          mmfCatName: parseStringOrUndefined(recordAny.mmf_cat_name),
          mmfCatColor: parseStringOrUndefined(recordAny.mmf_cat_color),
          mmfjcu: parseStringOrUndefined(recordAny.mmfjcu),
          mmmTitle: parseStringOrUndefined(recordAny.mmm_title),
          mmmCatName: parseStringOrUndefined(recordAny.mmm_cat_name),
          mmmCatColor: parseStringOrUndefined(recordAny.mmm_cat_color),
          mmmjcu: parseStringOrUndefined(recordAny.mmmjcu),
          oldCode: parseStringOrUndefined(recordAny.old_code),
        },
      });
      successCount++;
      if (successCount % 10 === 0) {
        console.log(`Imported ${successCount} records...`);
      }
    } catch (error) {
      errorCount++;
      console.error(`Error importing record ${record.pedigree_id}:`, error);
    }
  }

  console.log(`\nImport completed!`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
