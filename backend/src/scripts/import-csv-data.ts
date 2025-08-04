import { PrismaClient } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';
import csv from 'csv-parser';

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
  pedigreeId: string;
  title: string;
  catName: string;  // Combined field (previously catteryName + catName)
  catName2: string; // Additional name field
  breedCode: string;
  gender: string;
  eyeColor: string;
  coatColorCode: string;
  birthDate: string;
  breederName: string;
  ownerName: string;
  registrationDate: string;
  brotherCount: string;
  sisterCount: string;
  notes: string;
  notes2: string;
  otherNo: string;
  oldCode: string;
  // Father data (ChampionFlag removed)
  fatherTitle: string;
  fatherName: string;
  fatherCatName2: string;
  fatherCoatColor: string;
  fatherEyeColor: string;
  fatherJCU: string;
  fatherOtherCode: string;
  // Mother data (ChampionFlag removed)
  motherTitle: string;
  motherCatName: string;
  motherCatName2: string;
  motherCoatColor: string;
  motherEyeColor: string;
  motherJCU: string;
  motherOtherCode: string;
  // Additional ancestor data would be included here...
}

async function importBreeds() {
  console.log('🐱 Importing breed data...');
  
  const breeds: BreedData[] = [];
  const csvPath = path.join(__dirname, '../../NewPedigree/猫種データUTF8Ver.csv');
  
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv({ headers: ['key', 'name'] }))
      .on('data', (data: BreedData) => {
        if (data.key && data.name && data.key !== 'キー') {
          breeds.push(data);
        }
      })
      .on('end', async () => {
        try {
          const processedNames = new Set<string>();
          for (const breed of breeds) {
            const code = parseInt(breed.key);
            const trimmedName = breed.name.trim();
            if (!isNaN(code) && trimmedName && !processedNames.has(trimmedName)) {
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
          reject(error);
        }
      })
      .on('error', reject);
  });
}

async function importCoatColors() {
  console.log('🎨 Importing coat color data...');
  
  const colors: CoatColorData[] = [];
  const csvPath = path.join(__dirname, '../../NewPedigree/色柄データUTF8Ver.csv');
  
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv({ headers: ['key', 'name'] }))
      .on('data', (data: CoatColorData) => {
        if (data.key && data.name && data.key !== 'キー') {
          colors.push(data);
        }
      })
      .on('end', async () => {
        try {
          const processedColorNames = new Set<string>();
          for (const color of colors) {
            const code = parseInt(color.key);
            const trimmedName = color.name.trim();
            if (!isNaN(code) && trimmedName && !processedColorNames.has(trimmedName)) {
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
          reject(error);
        }
      })
      .on('error', reject);
  });
}

async function importPedigrees() {
  console.log('📜 Importing pedigree data...');
  
  const pedigrees: PedigreeData[] = [];
  const csvPath = path.join(__dirname, '../../NewPedigree/血統書データRenamed.csv');
  
  // Define headers based on updated CSV structure (ChampionFlag columns removed)
  const headers = [
    'pedigreeId', 'title', 'catName', 'catName2',
    'breedCode', 'gender', 'eyeColor', 'coatColorCode', 'birthDate',
    'breederName', 'ownerName', 'registrationDate', 'brotherCount', 'sisterCount',
    'notes', 'notes2', 'otherNo',
    // Father data (ChampionFlag removed)
    'fatherTitle', 'fatherName', 'fatherCatName2',
    'fatherCoatColor', 'fatherEyeColor', 'fatherJCU', 'fatherOtherCode',
    // Mother data (ChampionFlag removed)
    'motherTitle', 'motherCatName', 'motherCatName2',
    'motherCoatColor', 'motherEyeColor', 'motherJCU', 'motherOtherCode',
    // Grandparents data FF (ChampionFlag removed)
    'ffTitle', 'ffCatName', 'ffCatColor', 'ffJCU',
    // Grandparents data FM (ChampionFlag removed)
    'fmTitle', 'fmCatName', 'fmCatColor', 'fmJCU',
    // Grandparents data MF (ChampionFlag removed)
    'mfTitle', 'mfCatName', 'mfCatColor', 'mfJCU',
    // Grandparents data MM (ChampionFlag removed)
    'mmTitle', 'mmCatName', 'mmCatColor', 'mmJCU',
    // Great-grandparents data FFF (ChampionFlag removed)
    'fffTitle', 'fffCatName', 'fffCatColor', 'fffJCU',
    // Great-grandparents data FFM (ChampionFlag removed)
    'ffmTitle', 'ffmCatName', 'ffmCatColor', 'ffmJCU',
    // Great-grandparents data FMF (ChampionFlag removed)
    'fmfTitle', 'fmfCatName', 'fmfCatColor', 'fmfJCU',
    // Great-grandparents data FMM (ChampionFlag removed)
    'fmmTitle', 'fmmCatName', 'fmmCatColor', 'fmmJCU',
    // Great-grandparents data MFF (ChampionFlag removed)
    'mffTitle', 'mffCatName', 'mffCatColor', 'mffJCU',
    // Great-grandparents data MFM (ChampionFlag removed)
    'mfmTitle', 'mfmCatName', 'mfmCatColor', 'mfmJCU',
    // Great-grandparents data MMF (ChampionFlag removed)
    'mmfTitle', 'mmfCatName', 'mmfCatColor', 'mmfJCU',
    // Great-grandparents data MMM (ChampionFlag removed)
    'mmmTitle', 'mmmCatName', 'mmmCatColor', 'mmmJCU',
    'oldCode'
  ];
    // Additional fields...
  return new Promise<void>((resolve, reject) => {
    let rowCount = 0;
    
    fs.createReadStream(csvPath)
      .pipe(csv({ headers }))
      .on('data', (data: PedigreeData) => {
        rowCount++;
        if (rowCount > 1 && data.pedigreeId && data.pedigreeId !== 'PedigreeID') { // Skip header row
          pedigrees.push(data);
        }
      })
      .on('end', async () => {
        try {
          console.log(`Processing ${pedigrees.length} pedigrees...`);
          
          // Import in batches to avoid memory issues
          const batchSize = 100;
          for (let i = 0; i < pedigrees.length; i += batchSize) {
            const batch = pedigrees.slice(i, i + batchSize);
            
            for (const pedigree of batch) {
              try {
                // Parse dates
                const birthDate = pedigree.birthDate ? parseDate(pedigree.birthDate) : null;
                const registrationDate = pedigree.registrationDate ? parseDate(pedigree.registrationDate) : null;
                
                // Parse numbers
                const breedCode = pedigree.breedCode ? parseInt(pedigree.breedCode) : null;
                const coatColorCode = pedigree.coatColorCode ? parseInt(pedigree.coatColorCode) : null;
                const gender = pedigree.gender ? parseInt(pedigree.gender) : null;
                const brotherCount = pedigree.brotherCount ? parseInt(pedigree.brotherCount) : null;
                const sisterCount = pedigree.sisterCount ? parseInt(pedigree.sisterCount) : null;
                
                await prisma.pedigree.upsert({
                  where: { pedigreeId: pedigree.pedigreeId.toString() },
                  update: {
                    title: pedigree.title || null,
                    catName: pedigree.catName || '',
                    breedCode,
                    gender,
                    eyeColor: pedigree.eyeColor || null,
                    coatColorCode,
                    birthDate,
                    breederName: pedigree.breederName || null,
                    ownerName: pedigree.ownerName || null,
                    registrationDate,
                    brotherCount,
                    sisterCount,
                    notes: pedigree.notes || null,
                    notes2: pedigree.notes2 || null,
                    otherNo: pedigree.otherNo || null,
                    oldCode: pedigree.oldCode || null,
                  },
                  create: {
                    pedigreeId: pedigree.pedigreeId.toString(),
                    title: pedigree.title || null,
                    catName: pedigree.catName || '',
                    breedCode,
                    gender,
                    eyeColor: pedigree.eyeColor || null,
                    coatColorCode,
                    birthDate,
                    breederName: pedigree.breederName || null,
                    ownerName: pedigree.ownerName || null,
                    registrationDate,
                    brotherCount,
                    sisterCount,
                    notes: pedigree.notes || null,
                    notes2: pedigree.notes2 || null,
                    otherNo: pedigree.otherNo || null,
                    oldCode: pedigree.oldCode || null,
                  },
                });
              } catch (error) {
                console.warn(`Warning: Failed to import pedigree ${pedigree.pedigreeId}:`, error);
              }
            }
            
            console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(pedigrees.length / batchSize)}`);
          }
          
          console.log(`✅ Imported ${pedigrees.length} pedigrees`);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
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
      
      if (year > 1900 && year < 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return new Date(year, month - 1, day);
      }
    }
  }
  
  return null;
}

async function main() {
  try {
    console.log('🚀 Starting CSV data import...');
    
    await importBreeds();
    await importCoatColors();
    await importPedigrees();
    
    console.log('🎉 All data imported successfully!');
    
    // Display summary
    const breedCount = await prisma.breed.count();
    const colorCount = await prisma.coatColor.count();
    const pedigreeCount = await prisma.pedigree.count();
    
    console.log('\n📊 Import Summary:');
    console.log(`   Breeds: ${breedCount}`);
    console.log(`   Coat Colors: ${colorCount}`);
    console.log(`   Pedigrees: ${pedigreeCount}`);
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

export { importBreeds, importCoatColors, importPedigrees };
