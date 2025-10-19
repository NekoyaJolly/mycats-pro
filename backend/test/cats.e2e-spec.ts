import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { randomUUID } from 'crypto';

import { AppModule } from '../src/app.module';
import { createTestApp } from './utils/create-test-app';

interface CatPayload {
  registrationId: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  pattern?: string;
  weight?: number;
  microchipId?: string;
  notes?: string;
  breedId?: string;
  colorId?: string;
  fatherId?: string;
  motherId?: string;
}

function buildCatPayload(overrides: Partial<CatPayload> = {}): CatPayload {
  return {
    registrationId: `CAT-${randomUUID()}`,
    name: 'Test Cat',
    gender: 'MALE',
    birthDate: '2024-01-01',
    pattern: 'SOLID',
    ...overrides,
  };
}

describe('Cats API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleRef);

    const email = `cats_test_${Date.now()}@example.com`;
    const password = 'CatsTest123!';

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(201);

    authToken = loginRes.body.data.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/cats', () => {
    it('should return paginated list of cats', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toMatchObject({
        page: expect.any(Number),
        limit: expect.any(Number),
        total: expect.any(Number),
        totalPages: expect.any(Number),
      });
    });

    it('should reject request without authentication', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/cats')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should respond within 1 second (performance check)', async () => {
      const startTime = Date.now();

      const res = await request(app.getHttpServer())
        .get('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('POST /api/v1/cats', () => {
    it('should create a new cat with valid data', async () => {
      const catData = buildCatPayload();

      const res = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send(catData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        registrationId: catData.registrationId,
        name: catData.name,
        gender: catData.gender,
      });
      expect(res.body.data.id).toBeDefined();
    });

    it('should validate required fields', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
      expect(res.body.error.details).toEqual(
        expect.arrayContaining([
          expect.stringContaining('registrationId'),
          expect.stringContaining('name'),
        ]),
      );
    });

    it('should validate gender enum', async () => {
      const invalidPayload = {
        ...buildCatPayload(),
        gender: 'INVALID_GENDER' as unknown as 'MALE',
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPayload)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });

    it('should validate date format', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...buildCatPayload(),
          birthDate: 'invalid-date',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });

    it('should handle unique registration number constraint', async () => {
      const registrationId = `UNIQUE-${randomUUID()}`;

      await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildCatPayload({ registrationId }))
        .expect(201);

      const duplicateRes = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildCatPayload({ registrationId, name: 'Duplicate Cat' }))
        .expect(409);

      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.error.code).toBe('CONFLICT');
      expect(duplicateRes.body.error.message).toContain('registration ID');
    });

    it('should handle unique microchip number constraint', async () => {
      const microchipNumber = `${randomUUID().replace(/-/g, '').substring(0, 15)}`;
      const registrationId1 = `CAT-${randomUUID()}`;
      const registrationId2 = `CAT-${randomUUID()}`;

      await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...buildCatPayload({ registrationId: registrationId1 }), microchipNumber })
        .expect(201);

      const duplicateRes = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...buildCatPayload({ registrationId: registrationId2, name: 'Duplicate Cat' }), microchipNumber })
        .expect(409);

      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.error.code).toBe('CONFLICT');
      expect(duplicateRes.body.error.message).toContain('microchip');
    });

    it('should create multiple cats successfully', async () => {
      const payloads = [buildCatPayload(), buildCatPayload(), buildCatPayload()];

      for (const payload of payloads) {
        const res = await request(app.getHttpServer())
          .post('/api/v1/cats')
          .set('Authorization', `Bearer ${authToken}`)
          .send(payload)
          .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe(payload.name);
      }
    });
  });

  describe('GET /api/v1/cats/:id', () => {
    let createdCatId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildCatPayload({ name: 'Get By ID Test' }))
        .expect(201);

      createdCatId = res.body.data.id;
    });

    it('should get cat by valid ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/cats/${createdCatId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdCatId);
      expect(res.body.data.name).toBe('Get By ID Test');
    });

    it('should return 404 for non-existent ID', async () => {
      const missingId = randomUUID();
      const res = await request(app.getHttpServer())
        .get(`/api/v1/cats/${missingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(res.body.error.message).toContain(missingId);
    });

    it('should return 400 for invalid UUID format', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/cats/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
      expect(res.body.error.message).toContain('uuid');
    });
  });

  describe('PATCH /api/v1/cats/:id', () => {
    let catId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildCatPayload({ name: 'Original Name' }))
        .expect(201);

      catId = res.body.data.id;
    });

    it('should update cat with valid data', async () => {
      const updateData = {
        name: 'Updated Name',
        pattern: 'STRIPED',
      };

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/cats/${catId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(updateData.name);
      expect(res.body.data.pattern).toBe(updateData.pattern);
    });

    it('should allow partial updates', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/cats/${catId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Only Name Updated' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Only Name Updated');
    });

    it('should return 404 for non-existent cat', async () => {
      const missingId = randomUUID();
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/cats/${missingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'New Name' })
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(res.body.error.message).toContain(missingId);
    });

    it('should validate updated data', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/cats/${catId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ gender: 'INVALID_GENDER' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
    });
  });

  describe('DELETE /api/v1/cats/:id', () => {
    let catId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildCatPayload({ name: 'To Be Deleted' }))
        .expect(201);

      catId = res.body.data.id;
    });

    it('should delete cat successfully', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/cats/${catId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      const verifyRes = await request(app.getHttpServer())
        .get(`/api/v1/cats/${catId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(verifyRes.body.success).toBe(false);
      expect(verifyRes.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when deleting non-existent cat', async () => {
      const missingId = randomUUID();
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/cats/${missingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(res.body.error.message).toContain(missingId);
    });

    it('should return 400 for invalid UUID', async () => {
      const res = await request(app.getHttpServer())
        .delete('/api/v1/cats/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
      expect(res.body.error.message).toContain('uuid');
    });
  });

  describe('Performance Tests', () => {
    it('should handle bulk create efficiently', async () => {
      const startTime = Date.now();
      const responses = [];

      for (let i = 0; i < 10; i++) {
        const res = await request(app.getHttpServer())
          .post('/api/v1/cats')
          .set('Authorization', `Bearer ${authToken}`)
          .send(buildCatPayload())
          .expect(201);
        responses.push(res);
      }

      responses.forEach((res) => expect(res.body.success).toBe(true));

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000);
    }, 10000);

    it('should list cats efficiently with pagination', async () => {
      const startTime = Date.now();

      const res = await request(app.getHttpServer())
        .get('/api/v1/cats')
        .query({ page: 1, limit: 50 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Error Handling', () => {
    it('should return structured error response', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ gender: 'INVALID' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatchObject({
        code: 'BAD_REQUEST',
        statusCode: 400,
      });
      expect(Array.isArray(res.body.error.details) || typeof res.body.error.details === 'undefined').toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...buildCatPayload(),
          breedId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('BAD_REQUEST');
  expect(res.body.error.message).toContain('Invalid breed ID');
    });
  });
});
