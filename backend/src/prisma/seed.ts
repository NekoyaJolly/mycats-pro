import { PrismaClient, UserRole } from "@prisma/client";
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
  let admin: { id: string };

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
  // Clean up existing seed data first
  await prisma.cat.deleteMany({
    where: {
      OR: [
        { name: "Alpha" },
        { name: "Beta" }
      ]
    }
  });

  const maleCat = await prisma.cat.create({
    data: {
      registrationId: "REG-ALPHA",
      name: "Alpha",
      gender: "MALE",
      birthDate: new Date("2023-01-01"),
      isInHouse: true,
    },
  });

  const femaleCat = await prisma.cat.create({
    data: {
      registrationId: "REG-BETA",
      name: "Beta",
      gender: "FEMALE",
      birthDate: new Date("2023-02-01"),
      isInHouse: true,
    },
  });

  // 3) Sample tag category & tag
  const category = await prisma.tagCategory.upsert({
    where: { key: "cat_status" },
    update: {
      name: "猫ステータス",
      description: "猫の状態を判別するサンプルカテゴリ",
      color: "#6366F1",
      displayOrder: 1,
      scopes: ["cats"],
      isActive: true,
    },
    create: {
      key: "cat_status",
      name: "猫ステータス",
      description: "猫の状態を判別するサンプルカテゴリ",
      color: "#6366F1",
      displayOrder: 1,
      scopes: ["cats"],
      isActive: true,
    },
  });

  const group = await prisma.tagGroup.upsert({
    where: {
      categoryId_name: {
        categoryId: category.id,
        name: "default",
      },
    },
    update: {
      description: category.description,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
    },
    create: {
      name: "default",
      description: category.description,
      displayOrder: category.displayOrder,
      isActive: category.isActive,
      category: { connect: { id: category.id } },
    },
  });

  const tag = await prisma.tag.upsert({
    where: {
      groupId_name: {
        groupId: group.id,
        name: "indoor",
      },
    },
    update: {
      color: "#10B981",
      allowsManual: true,
      allowsAutomation: true,
      metadata: { description: "室内飼い猫" },
      isActive: true,
    },
    create: {
      name: "indoor",
      color: "#10B981",
      allowsManual: true,
      allowsAutomation: true,
      metadata: { description: "室内飼い猫" },
      isActive: true,
      group: { connect: { id: group.id } },
    },
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
  console.log("Tag Category:", { id: category.id, key: category.key, name: category.name });
  console.log("Tag Group:", { id: group.id, name: group.name, categoryId: group.categoryId });
  console.log("Tag:", { id: tag.id, name: tag.name, groupId: tag.groupId });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
