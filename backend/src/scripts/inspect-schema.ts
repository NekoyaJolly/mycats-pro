import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const tables = [
  'users',
  'login_attempts',
  'breeds',
  'coat_colors',
  'cats',
  'breeding_records',
  'care_records',
  'schedules',
  'tags',
  'pedigrees',
  'cat_tags',
];

async function main() {
  for (const t of tables) {
    const cols = await prisma.$queryRawUnsafe<
      { column_name: string; data_type: string; is_nullable: string; column_default: string | null }[]
    >(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = '${t}'
      ORDER BY ordinal_position
    `);

    console.log(`\nTABLE: ${t}`);
    console.table(
      cols.map((c) => ({
        column: c.column_name,
        type: c.data_type,
        nullable: c.is_nullable,
        default: c.column_default,
      }))
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  try {
    await main();
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
