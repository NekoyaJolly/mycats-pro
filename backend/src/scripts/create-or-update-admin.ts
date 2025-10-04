import { PrismaClient, UserRole } from "@prisma/client";
import * as argon2 from "argon2";

/**
 * 再実行安全な管理者ユーザー create/update スクリプト
 * 環境変数:
 *  ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_FORCE_UPDATE=1
 *
 * 例:
 *  ADMIN_FORCE_UPDATE=1 pnpm --filter backend exec ts-node src/scripts/create-or-update-admin.ts
 */
async function main() {
  const prisma = new PrismaClient();
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Passw0rd!";
  const forceUpdate = process.env.ADMIN_FORCE_UPDATE === "1";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
    const created = await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        role: UserRole.ADMIN,
        isActive: true,
        clerkId: "local_admin",
        firstName: "Admin",
        lastName: "User",
      },
    });
    console.log("✅ Admin created", { id: created.id, email });
  } else {
  const updateData: Partial<typeof existing> = {};
    let changed = false;
    if (existing.role !== UserRole.ADMIN) {
      updateData.role = UserRole.ADMIN; changed = true;
    }
    if (!existing.isActive) { updateData.isActive = true; changed = true; }
    if (forceUpdate) {
      const hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });
      updateData.passwordHash = hash; changed = true;
    }
    if (changed) {
      await prisma.user.update({ where: { email }, data: updateData });
       
      console.log(`♻️  Admin updated (${forceUpdate ? "password+meta" : "meta"})`, { email });
    } else {
       
      console.log("ℹ️  Admin unchanged", { email });
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
   
  console.error(e);
  process.exit(1);
});
