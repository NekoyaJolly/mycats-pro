import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';

describe('Auth JWT & Rate Limiting (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();

    jwtService = app.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('JWT Authentication', () => {
    it('should reject requests without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/cats')
        .expect(401);
    });

    it('should reject requests with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/cats')
        .set('Authorization', 'Bearer invalid-token-123')
        .expect(401);
    });

    it('should reject requests with malformed Authorization header', async () => {
      const email = `jwt_test_${Date.now()}@example.com`;
      const password = 'Password123!';

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password })
        .expect(201);

      const token = loginRes.body.data.access_token;

      // Missing "Bearer" prefix
      await request(app.getHttpServer())
        .get('/api/v1/cats')
        .set('Authorization', token)
        .expect(401);
    });

    it('should accept valid JWT token', async () => {
      const email = `jwt_valid_${Date.now()}@example.com`;
      const password = 'Password123!';

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password })
        .expect(201);

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password })
        .expect(201);

      const token = loginRes.body.data.access_token;
      expect(token).toBeDefined();

      // Should successfully access protected route
      await request(app.getHttpServer())
        .get('/api/v1/cats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should include user info in JWT payload', async () => {
      const email = `jwt_payload_${Date.now()}@example.com`;
      const password = 'Password123!';

      const registerRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password })
        .expect(201);

      const token = registerRes.body.data.access_token;
      const decoded = jwtService.decode(token) as any;

      expect(decoded).toHaveProperty('sub');
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('role');
      expect(decoded.email).toBe(email.toLowerCase().trim());
    });

    it('should refresh token after login', async () => {
      const email = `jwt_refresh_${Date.now()}@example.com`;
      const password = 'Password123!';

      // First login
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password })
        .expect(201);

      const login1Res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password })
        .expect(201);

      const token1 = login1Res.body.data.access_token;

      // Second login should generate new token
      const login2Res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password })
        .expect(201);

      const token2 = login2Res.body.data.access_token;

      // Tokens should be different
      expect(token1).not.toBe(token2);

      // Both tokens should be valid
      await request(app.getHttpServer())
        .get('/api/v1/cats')
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/api/v1/cats')
        .set('Authorization', `Bearer ${token2}`)
        .expect(200);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limit on login (20/min)', async () => {
      const email = `ratelimit_login_${Date.now()}@example.com`;
      const password = 'Password123!';

      // Register user
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password })
        .expect(201);

      // Make 20 login requests
      for (let i = 0; i < 20; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({ email, password })
          .expect(201);
      }

      // 21st request should be rate limited
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password })
        .expect(429);
    }, 30000);

    it('should enforce rate limit on register (5/min)', async () => {
      const baseEmail = `ratelimit_register_${Date.now()}`;
      const password = 'Password123!';

      // Make 5 registration requests
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({ email: `${baseEmail}_${i}@example.com`, password })
          .expect(201);
      }

      // 6th request should be rate limited
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: `${baseEmail}_6@example.com`, password })
        .expect(429);
    }, 20000);

    it('should have separate rate limit counters per endpoint', async () => {
      const email = `ratelimit_separate_${Date.now()}@example.com`;
      const password = 'Password123!';

      // Register user (counts toward register limit)
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password })
        .expect(201);

      // Login should have independent counter
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({ email, password })
          .expect(201);
      }

      // Should still be able to login (not affected by register limit)
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password })
        .expect(201);
    }, 15000);
  });

  describe('Security Headers', () => {
    it('should include security headers (Helmet)', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      // Helmet security headers
      expect(res.headers).toHaveProperty('x-content-type-options');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      
      expect(res.headers).toHaveProperty('x-frame-options');
      
      // Strict-Transport-Security for HTTPS
      expect(res.headers).toHaveProperty('strict-transport-security');
    });

    it('should set proper CORS headers', async () => {
      const email = `cors_test_${Date.now()}@example.com`;
      const password = 'Password123!';

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password })
        .set('Origin', 'http://localhost:3000')
        .expect(201);

      expect(res.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Login Failure Tracking', () => {
    it('should track failed login attempts', async () => {
      const email = `failed_login_${Date.now()}@example.com`;
      const correctPassword = 'CorrectPassword123!';
      const wrongPassword = 'WrongPassword123!';

      // Register user
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password: correctPassword })
        .expect(201);

      // Make failed login attempts
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({ email, password: wrongPassword })
          .expect(401);
      }

      // Correct password should still work (account not locked yet)
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password: correctPassword })
        .expect(201);
    });

    it('should return proper error message for wrong password', async () => {
      const email = `wrong_password_${Date.now()}@example.com`;
      const password = 'CorrectPassword123!';

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email, password: 'WrongPassword!' })
        .expect(401);

      expect(res.body).toHaveProperty('message');
    });

    it('should return same error for non-existent user (security)', async () => {
      const nonExistentEmail = `nonexistent_${Date.now()}@example.com`;

      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: nonExistentEmail, password: 'SomePassword123!' })
        .expect(401);

      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Input Validation', () => {
    it('should validate email format on registration', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'invalid-email', password: 'Password123!' })
        .expect(400);
    });

    it('should enforce password requirements', async () => {
      const email = `password_req_${Date.now()}@example.com`;

      // Too short
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password: 'Ab1!' })
        .expect(400);

      // No uppercase
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password: 'password123!' })
        .expect(400);

      // No lowercase
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password: 'PASSWORD123!' })
        .expect(400);

      // No number
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email, password: 'PasswordABC!' })
        .expect(400);
    });

    it('should trim and lowercase email', async () => {
      const emailRaw = `  Trim_Test_${Date.now()}@EXAMPLE.COM  `;
      const password = 'Password123!';

      // Register with messy email
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: emailRaw, password })
        .expect(201);

      // Login with cleaned email should work
      const cleanEmail = emailRaw.trim().toLowerCase();
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: cleanEmail, password })
        .expect(201);

      // Login with different casing should also work
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: emailRaw.toUpperCase(), password })
        .expect(201);
    });
  });
});
