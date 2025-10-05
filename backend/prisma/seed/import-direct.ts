import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import { randomUUID } from 'crypto';

/**
 * CSV record type definition for pedigree data
 */
interface PedigreeCSVRecord {
  pedigree_id: string;
  cat_name?: string;
  breed_code?: string;
  gender_code?: string;
  eye_color?: string;
  coat_color_code?: string;
  birth_date?: string;
  breeder_name?: string;
  registration_date?: string;
  brother_count?: string;
  sister_count?: string;
}

const client = new Client({
  host: 'localhost',
  port: 55432,
  user: 'runner',
  password: 'password',
  database: 'mycats_development',
});

async function main() {
  await client.connect();
  
  const csvFilePath = path.join(__dirname, 'testdatepedigrees100_snake.csv');
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as PedigreeCSVRecord[];

  console.log(`Found ${records.length} records to import`);

  let successCount = 0;
  let errorCount = 0;

  for (const record of records) {
    try {
      const id = randomUUID();
      const now = new Date();
      
      const pedigreeId = record.pedigree_id;
      
      if (!pedigreeId) {
        console.error('Skipping record with missing pedigree_id');
        errorCount++;
        continue;
      }

      const query = `
        INSERT INTO pedigrees (
          id, pedigree_id, cat_name, breed_code, gender_code, 
          eye_color, coat_color_code, birth_date, breeder_name,
          registration_date, brother_count, sister_count,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
        )
      `;
      
      await client.query(query, [
        id,
        pedigreeId,
        record.cat_name || null,
        record.breed_code ? parseInt(record.breed_code, 10) : null,
        record.gender_code ? parseInt(record.gender_code, 10) : null,
        record.eye_color || null,
        record.coat_color_code ? parseInt(record.coat_color_code, 10) : null,
        record.birth_date || null,
        record.breeder_name || null,
        record.registration_date || null,
        record.brother_count ? parseInt(record.brother_count, 10) : null,
        record.sister_count ? parseInt(record.sister_count, 10) : null,
        now,
        now,
      ]);
      
      successCount++;
      if (successCount % 10 === 0) {
        console.log(`Imported ${successCount} records...`);
      }
    } catch (error: unknown) {
      errorCount++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error importing record ${record.pedigree_id}:`, errorMessage);
    }
  }

  console.log(`\nImport completed!`);
  console.log(`Success: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  
  await client.end();
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  });
