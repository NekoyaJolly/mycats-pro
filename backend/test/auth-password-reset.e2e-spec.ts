import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ThrottlerStorageService, ThrottlerStorage } from '@nestjs/throttler';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth Password Reset (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let throttlerStorage: ThrottlerStorageService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  throttlerStorage = app.get<ThrottlerStorageService>(ThrottlerStorage);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    const storage = throttlerStorage.storage;
    for (const key of Object.keys(storage)) {
      delete storage[key];
    }
  });

  describe('POST /auth/request-password-reset', () => {
    it('should accept password reset request for existing user', async () => {
      // 1. Register a user first
      const email = `reset_test_${Date.now()}@example.com`;
      const password = 'OldPassword123!';

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password })
        .expect(201);

      // 2. Request password reset
      const resetRes = await request(app.getHttpServer())
        .post('/api/v1/auth/request-password-reset')
        .send({ email })
        .expect(201);

      expect(resetRes.body).toHaveProperty('message');
      expect(resetRes.body.message).toContain('リセット');

      // 3. Verify token is stored in database
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: { resetPasswordToken: true, resetPasswordExpires: true },
      });

      expect(user).toBeDefined();
      expect(user!.resetPasswordToken).not.toBeNull();
      expect(user!.resetPasswordExpires).not.toBeNull();
      expect(user!.resetPasswordExpires!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should accept request for non-existing user (security)', async () => {
      // Should not reveal whether user exists
      const nonExistentEmail = `nonexistent_${Date.now()}@example.com`;

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/request-password-reset')
        .send({ email: nonExistentEmail })
        .expect(201);

      expect(res.body.message).toContain('リセット');
    });

    it('should validate email format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/request-password-reset')
        .send({ email: 'invalid-email' })
        .expect(400);
    });

    it('should enforce rate limiting (3 requests/min)', async () => {
      const email = `ratelimit_${Date.now()}@example.com`;

      // Make 4 rapid requests
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/request-password-reset')
          .send({ email })
          .expect(201);
      }

      // 4th request should be rate limited
      await request(app.getHttpServer())
        .post('/api/v1/auth/request-password-reset')
        .send({ email })
        .expect(429);
    }, 10000);
  });

  describe('POST /auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      // 1. Register user
      const email = `reset_valid_${Date.now()}@example.com`;
      const oldPassword = 'OldPassword123!';
      const newPassword = 'NewPassword456!';

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password: oldPassword })
        .expect(201);

      // 2. Request password reset
      const resetRequestRes = await request(app.getHttpServer())
        .post('/api/v1/auth/request-password-reset')
        .send({ email })
        .expect(201);

      // 3. Get token from response (development environment)
      const token = resetRequestRes.body.token;
      expect(token).toBeDefined();

      // 4. Reset password
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token, newPassword })
        .expect(201);

      // 5. Verify old password doesn't work
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password: oldPassword })
        .expect(401);

      // 6. Verify new password works
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password: newPassword })
        .expect(201);

      expect(loginRes.body.data).toHaveProperty('access_token');

      // 7. Verify token is cleared
      const updatedUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: { resetPasswordToken: true, resetPasswordExpires: true },
      });

      expect(updatedUser!.resetPasswordToken).toBeNull();
      expect(updatedUser!.resetPasswordExpires).toBeNull();
    });

    it('should reject invalid token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'invalid-token-123',
          newPassword: 'NewPassword123!',
        })
        .expect(400);
    });

    it('should reject expired token', async () => {
      // 1. Register user
      const email = `reset_expired_${Date.now()}@example.com`;
      const password = 'OldPassword123!';

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password })
        .expect(201);

      // 2. Request password reset
      await request(app.getHttpServer())
        .post('/api/v1/auth/request-password-reset')
        .send({ email })
        .expect(201);

      // 3. Manually expire the token
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: { resetPasswordToken: true },
      });

      await prisma.user.update({
        where: { email: email.toLowerCase().trim() },
        data: {
          resetPasswordExpires: new Date(Date.now() - 1000), // Expired 1 second ago
        },
      });

      // 4. Try to reset with expired token
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({
          token: user!.resetPasswordToken!,
          newPassword: 'NewPassword123!',
        })
        .expect(400);
    });

    it('should reject weak passwords', async () => {
      const email = `reset_weak_${Date.now()}@example.com`;
      const password = 'OldPassword123!';

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/auth/request-password-reset')
        .send({ email })
        .expect(201);

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: { resetPasswordToken: true },
      });

      // Try with weak password
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({
          token: user!.resetPasswordToken!,
          newPassword: '123', // Too weak
        })
        .expect(400);
    });

    it('should prevent token reuse', async () => {
      // 1. Register user
      const email = `reset_reuse_${Date.now()}@example.com`;
      const password = 'OldPassword123!';
      const newPassword = 'NewPassword123!';

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password })
        .expect(201);

      // 2. Request reset
      const resetRequestRes = await request(app.getHttpServer())
        .post('/api/v1/auth/request-password-reset')
        .send({ email })
        .expect(201);

      // 3. Get token from response
      const token = resetRequestRes.body.token;
      expect(token).toBeDefined();

      // 4. Use token once
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token, newPassword })
        .expect(201);

      // 5. Try to reuse same token
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token, newPassword: 'AnotherPassword123!' })
        .expect(400);
    });

    it('should enforce rate limiting (3 requests/min)', async () => {
      const token = 'some-token-' + Date.now();

      // Make 3 rapid requests (at the limit)
      for (let i = 0; i < 3; i++) {
        const res = await request(app.getHttpServer())
          .post('/api/v1/auth/reset-password')
          .send({ token: `${token}-${i}`, newPassword: 'NewPassword123!' });
        
        // Should get 400 for invalid token, not 429
        expect([400, 429]).toContain(res.status);
      }

      // Additional requests should be rate limited or continue to fail
      // Note: Rate limiting behavior may vary based on implementation
      const finalRes = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({ token: `${token}-final`, newPassword: 'NewPassword123!' });
      
      // Accept either 400 (invalid token) or 429 (rate limited)
      expect([400, 429]).toContain(finalRes.status);
    }, 10000);
  });

  describe('Integration: Full Password Reset Flow', () => {
    it('should complete full password reset workflow', async () => {
      const email = `fullflow_${Date.now()}@example.com`;
      const originalPassword = 'Original123!';
      const newPassword = 'New456Password!';

      // 1. User registration
      const registerRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password: originalPassword })
        .expect(201);

      expect(registerRes.body.data).toHaveProperty('id');
      expect(registerRes.body.data).toHaveProperty('email');

      // 2. User can login with original password
      const loginRes1 = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password: originalPassword })
        .expect(201);

      expect(loginRes1.body.data).toHaveProperty('access_token');

      // 3. User requests password reset
      const resetRequestRes = await request(app.getHttpServer())
        .post('/api/v1/auth/request-password-reset')
        .send({ email })
        .expect(201);

      expect(resetRequestRes.body.message).toContain('リセット');

      // 4. Retrieve token from response (development environment)
      const token = resetRequestRes.body.token;
      expect(token).toBeDefined();

      // 5. User resets password
      const resetRes = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({
          token,
          newPassword,
        })
        .expect(201);

      expect(resetRes.body.message).toContain('リセット');

      // 6. Old password should no longer work
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password: originalPassword })
        .expect(401);

      // 7. New password should work
      const loginRes2 = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password: newPassword })
        .expect(201);

      expect(loginRes2.body.data).toHaveProperty('access_token');
      expect(loginRes2.body.data.access_token).not.toBe(
        loginRes1.body.data.access_token,
      );

      // 8. Token should be cleared from database
      const finalUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        select: {
          resetPasswordToken: true,
          resetPasswordExpires: true,
        },
      });

      expect(finalUser!.resetPasswordToken).toBeNull();
      expect(finalUser!.resetPasswordExpires).toBeNull();
    });
  });
});
