import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createViews() {
  // Drop if exists, then create with snake_case columns (各文を個別に実行)
  await prisma.$executeRawUnsafe(`DROP VIEW IF EXISTS public.v_cats_summary`);
  await prisma.$executeRawUnsafe(`
    CREATE VIEW public.v_cats_summary AS
    SELECT
      c.id AS cat_id,
      c.registration_id,
      c.name AS cat_name,
      c.gender,
      c.birth_date,
      c.microchip_id,
      c.is_active,
      c.created_at,
      c.updated_at,
      b.code AS breed_code,
      b.name AS breed_name,
      cc.code AS coat_color_code,
      cc.name AS coat_color_name,
      u.email AS owner_email
    FROM public.cats c
    LEFT JOIN public.breeds b ON b.id = c.breed_id
    LEFT JOIN public.coat_colors cc ON cc.id = c.color_id
    LEFT JOIN public.users u ON u.id = c.owner_id
  `);

  await prisma.$executeRawUnsafe(`DROP VIEW IF EXISTS public.v_pedigrees_summary`);
  await prisma.$executeRawUnsafe(`
    CREATE VIEW public.v_pedigrees_summary AS
    SELECT
      p.id AS pedigree_row_id,
      p.pedigree_id,
      p.cat_id,
      p.cat_name,
      p.cat_name2,
      p.gender,
      p.birth_date,
      p.registration_date,
      p.pedigree_issue_date,
      p.breeder_name,
      p.owner_name,
      p.brother_count,
      p.sister_count,
      p.other_no,
      p.old_code,
      p.created_at,
      p.updated_at,
      b.code AS breed_code,
      b.name AS breed_name,
      cc.code AS coat_color_code,
      cc.name AS coat_color_name,
      f.pedigree_id AS father_pedigree_no,
      m.pedigree_id AS mother_pedigree_no
    FROM public.pedigrees p
    LEFT JOIN public.breeds b ON b.id = p.breed_id
    LEFT JOIN public.coat_colors cc ON cc.id = p.color_id
    LEFT JOIN public.pedigrees f ON f.id = p.father_pedigree_id
    LEFT JOIN public.pedigrees m ON m.id = p.mother_pedigree_id
  `);
}

type Row = Record<string, unknown>;
async function preview() {
  const cats = await prisma.$queryRawUnsafe<Row[]>(`SELECT * FROM public.v_cats_summary ORDER BY created_at DESC LIMIT 10`);
  const peds = await prisma.$queryRawUnsafe<Row[]>(`SELECT * FROM public.v_pedigrees_summary ORDER BY created_at DESC LIMIT 10`);

  console.log('\nVIEW v_cats_summary (top 10)');
  console.table(cats);

  console.log('\nVIEW v_pedigrees_summary (top 10)');
  console.table(peds);
}

(async () => {
  try {
    await createViews();
    await preview();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
