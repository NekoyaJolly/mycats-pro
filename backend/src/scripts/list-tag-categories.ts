import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const categories = await prisma.tagCategory.findMany({
      include: {
        groups: {
          include: {
            tags: true,
          },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });

    if (!categories.length) {
      console.log('No tag categories found');
      return;
    }

    console.log(`Found ${categories.length} categories`);
    for (const category of categories) {
      console.log(
        JSON.stringify(
          {
            id: category.id,
            name: category.name,
            key: category.key,
            scopes: category.scopes,
            isActive: category.isActive,
            groups: category.groups.map((group) => ({
              id: group.id,
              name: group.name,
              isActive: group.isActive,
              tags: group.tags.map((tag) => ({ id: tag.id, name: tag.name, isActive: tag.isActive })),
            })),
          },
          null,
          2,
        ),
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Failed to list tag categories', error);
  process.exit(1);
});
