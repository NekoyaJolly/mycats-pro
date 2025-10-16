import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
      select: {
        id: true,
        email: true,
        failedLoginAttempts: true,
        lockedUntil: true,
        isActive: true,
        passwordHash: true,
      },
    });

    if (!admin) {
      console.log('Admin user not found');
      return;
    }

    console.log('Admin user info:', {
      email: admin.email,
      failedLoginAttempts: admin.failedLoginAttempts,
      lockedUntil: admin.lockedUntil,
      isActive: admin.isActive,
      passwordHashPreview: admin.passwordHash?.slice(0, 16),
    });

    const recentAttempts = await prisma.loginAttempt.findMany({
      where: { email: admin.email },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        createdAt: true,
        success: true,
        reason: true,
        ipAddress: true,
        userAgent: true,
      },
    });

    console.log('Recent login attempts:', recentAttempts);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Failed to inspect admin user', error);
  process.exit(1);
});
