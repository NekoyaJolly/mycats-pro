import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'Passw0rd!';

    console.log('🔍 管理者アカウントを確認中...');

    // 既存チェック
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('✅ 管理者アカウントは既に存在します');
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${password}`);
      console.log('👤 Role:', existing.role);
      return;
    }

    console.log('🔐 パスワードをハッシュ化中...');
    // パスワードハッシュ化
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    console.log('👤 管理者アカウントを作成中...');
    // 管理者作成
    const admin = await prisma.user.create({
      data: {
        clerkId: `admin-${Date.now()}`,
        email,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ 管理者アカウントを作成しました！');
    console.log('');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Password: ${password}`);
    console.log('👤 Role: ADMIN');
    console.log('🆔 User ID:', admin.id);
    console.log('');
    console.log('ログインページ: http://localhost:3000/login');
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void createAdmin();
