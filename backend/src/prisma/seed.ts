import { PrismaClient, UserRole, Gender } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1) Admin user
  const email = "admin@example.com";
  const password = "Passw0rd!";
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: UserRole.ADMIN, isActive: true },
    create: {
      clerkId: "local_admin",
      email,
      firstName: "Admin",
      lastName: "User",
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  // 2) Cats (one male, one female)
  const maleCat = await prisma.cat.upsert({
    where: { registrationId: "REG-ALPHA" },
    update: {},
    create: {
      registrationId: "REG-ALPHA",
      name: "Alpha",
      gender: Gender.MALE,
      birthDate: new Date("2023-01-01"),
      ownerId: admin.id,
      isActive: true,
    },
  });

  const femaleCat = await prisma.cat.upsert({
    where: { registrationId: "REG-BETA" },
    update: {},
    create: {
      registrationId: "REG-BETA",
      name: "Beta",
      gender: Gender.FEMALE,
      birthDate: new Date("2023-02-01"),
      ownerId: admin.id,
      isActive: true,
    },
  });

  // 3) A sample tag
  const tag = await prisma.tag.upsert({
    where: { name: "indoor" },
    update: { color: "#10B981" },
    create: { name: "indoor", color: "#10B981" },
  });

  console.log("Seed complete ✅");
  console.log("Admin:", { email, password, id: admin.id });
  console.log("Male Cat:", {
    id: maleCat.id,
    registrationId: maleCat.registrationId,
    name: maleCat.name,
  });
  console.log("Female Cat:", {
    id: femaleCat.id,
    registrationId: femaleCat.registrationId,
    name: femaleCat.name,
  });
  console.log("Tag:", { id: tag.id, name: tag.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
