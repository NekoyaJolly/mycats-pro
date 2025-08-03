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
  championFlag: string;
  title: string;
  catteryName: string;
  catName: string;
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
  [key: string]: string; // For parent and grandparent data
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
          for (const breed of breeds) {
            const code = parseInt(breed.key);
            if (!isNaN(code) && breed.name.trim()) {
              await prisma.breed.upsert({
                where: { code },
                update: { name: breed.name.trim() },
                create: {
                  code,
                  name: breed.name.trim(),
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
          for (const color of colors) {
            const code = parseInt(color.key);
            if (!isNaN(code) && color.name.trim()) {
              await prisma.coatColor.upsert({
                where: { code },
                update: { name: color.name.trim() },
                create: {
                  code,
                  name: color.name.trim(),
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
  const csvPath = path.join(__dirname, '../../NewPedigree/血統書データUTFVer.csv');
  
  // Define headers based on CSV structure
  const headers = [
    'pedigreeId', 'championFlag', 'title', 'catteryName', 'catName',
    'breedCode', 'gender', 'eyeColor', 'coatColorCode', 'birthDate',
    'breederName', 'ownerName', 'registrationDate', 'brotherCount', 'sisterCount',
    'notes', 'notes2', 'otherNo',
    // Father data
    'fatherChampionFlag', 'fatherTitle', 'fatherCatteryName', 'fatherCatName',
    'fatherCoatColor', 'fatherEyeColor', 'fatherJCU', 'fatherOtherCode',
    // Mother data
    'motherChampionFlag', 'motherTitle', 'motherCatteryName', 'motherCatName',
    'motherCoatColor', 'motherEyeColor', 'motherJCU', 'motherOtherCode',
    // Grandparents data (abbreviated for brevity)
    'patGrandFatherChampionFlag', 'patGrandFatherTitle', 'patGrandFatherCatteryName', 'patGrandFatherCatName', 'patGrandFatherJCU',
    'patGrandMotherChampionFlag', 'patGrandMotherTitle', 'patGrandMotherCatteryName', 'patGrandMotherCatName', 'patGrandMotherJCU',
    'matGrandFatherChampionFlag', 'matGrandFatherTitle', 'matGrandFatherCatteryName', 'matGrandFatherCatName', 'matGrandFatherJCU',
    'matGrandMotherChampionFlag', 'matGrandMotherTitle', 'matGrandMotherCatteryName', 'matGrandMotherCatName', 'matGrandMotherJCU',
    // Additional fields...
    'oldCode'
  ];
  
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
                    catteryName: pedigree.catteryName || null,
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
                    championFlag: pedigree.championFlag || null,
                    oldCode: pedigree.oldCode || null,
                  },
                  create: {
                    pedigreeId: pedigree.pedigreeId.toString(),
                    title: pedigree.title || null,
                    catteryName: pedigree.catteryName || null,
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
                    championFlag: pedigree.championFlag || null,
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
