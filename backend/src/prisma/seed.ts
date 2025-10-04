import { PrismaClient, UserRole, Gender } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1) Admin user (ENV override, 非破壊化ロジック)
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Passw0rd!";
  const forceUpdate = process.env.ADMIN_FORCE_UPDATE === "1"; // 既存管理者を強制更新するか

  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  let adminAction: "created" | "kept" | "updated" = "kept";
  let admin;

  if (!existingAdmin) {
    // 新規作成
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
    admin = await prisma.user.create({
      data: {
        clerkId: "local_admin",
        email,
        firstName: "Admin",
        lastName: "User",
        role: UserRole.ADMIN,
        isActive: true,
        passwordHash: hash,
      },
    });
    adminAction = "created";
  } else {
    // 既存: 原則 passwordHash を変更しない / 役割や有効化のみ調整
    let needsUpdate = false;
  const updateData: Partial<typeof existingAdmin> = {};
    if (existingAdmin.role !== UserRole.ADMIN) {
      updateData.role = UserRole.ADMIN;
      needsUpdate = true;
    }
    if (!existingAdmin.isActive) {
      updateData.isActive = true;
      needsUpdate = true;
    }
    if (forceUpdate) {
      const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
      updateData.passwordHash = hash;
      needsUpdate = true;
    }
    if (needsUpdate) {
      admin = await prisma.user.update({ where: { email }, data: updateData });
      adminAction = forceUpdate ? "updated" : "updated"; // updated (role/status or password)
    } else {
      admin = existingAdmin;
      adminAction = "kept";
    }
  }

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
  console.log("Admin:", { email, password: forceUpdate || adminAction === "created" ? password : "(unchanged)", id: admin.id, action: adminAction });
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
  .finally(() => {
    void prisma.$disconnect();
  });
