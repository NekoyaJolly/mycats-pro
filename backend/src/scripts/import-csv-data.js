const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const prisma = new PrismaClient();

async function importBreeds() {
  console.log('🐱 Importing breed data...');
  
  const breeds = [];
  const csvPath = path.join(__dirname, '../../NewPedigree/猫種データUTF8Ver.csv');
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv({ headers: ['key', 'name'] }))
      .on('data', (data) => {
        if (data.key && data.name && data.key !== 'キー' && data.name.trim()) {
          breeds.push(data);
        }
      })
      .on('end', async () => {
        try {
          const processedNames = new Set();
          
          for (const breed of breeds) {
            const code = parseInt(breed.key);
            const name = breed.name.trim();
            
            if (!isNaN(code) && name && !processedNames.has(name)) {
              processedNames.add(name);
              
              try {
                await prisma.breed.upsert({
                  where: { code },
                  update: { name },
                  create: { code, name },
                });
              } catch (error) {
                // If unique constraint fails on name, try with code only
                console.warn(`Warning: Skipping duplicate breed name: ${name}`);
              }
            }
          }
          
          const actualCount = await prisma.breed.count();
          console.log(`✅ Imported ${actualCount} breeds (processed ${breeds.length} entries)`);
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
  
  const colors = [];
  const csvPath = path.join(__dirname, '../../NewPedigree/色柄データUTF8Ver.csv');
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv({ headers: ['key', 'name'] }))
      .on('data', (data) => {
        if (data.key && data.name && data.key !== 'キー' && data.name.trim()) {
          colors.push(data);
        }
      })
      .on('end', async () => {
        try {
          const processedNames = new Set();
          
          for (const color of colors) {
            const code = parseInt(color.key);
            const name = color.name.trim();
            
            if (!isNaN(code) && name && !processedNames.has(name)) {
              processedNames.add(name);
              
              try {
                await prisma.coatColor.upsert({
                  where: { code },
                  update: { name },
                  create: { code, name },
                });
              } catch (error) {
                console.warn(`Warning: Skipping duplicate color name: ${name}`);
              }
            }
          }
          
          const actualCount = await prisma.coatColor.count();
          console.log(`✅ Imported ${actualCount} coat colors (processed ${colors.length} entries)`);
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

function parseDate(dateStr) {
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
    
    console.log('🎉 Data import completed!');
    
    // Display summary
    const breedCount = await prisma.breed.count();
    const colorCount = await prisma.coatColor.count();
    
    console.log('\n📊 Import Summary:');
    console.log(`   Breeds: ${breedCount}`);
    console.log(`   Coat Colors: ${colorCount}`);
    
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

module.exports = { importBreeds, importCoatColors, main };
