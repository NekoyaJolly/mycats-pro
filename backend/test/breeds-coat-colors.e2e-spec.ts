import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import request from 'supertest';
import { UserRole } from '@prisma/client';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './utils/create-test-app';

const httpStatus = {
  ok: 200,
  created: 201,
  badRequest: 400,
  notFound: 404,
};

const reserveUniqueCode = async (
  usedCodes: Set<number>,
  fetchExisting: (code: number) => Promise<unknown | null>,
) => {
  const maxAttempts = 500;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = 1000 + Math.floor(Math.random() * 9000);
    if (usedCodes.has(candidate)) {
      continue;
    }
    const exists = await fetchExisting(candidate);
    if (!exists) {
      usedCodes.add(candidate);
      return candidate;
    }
    usedCodes.add(candidate);
  }
  throw new Error('Unable to allocate a unique code within test constraints');
};

describe('Breeds & Coat Colors API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  const createdBreedIds: string[] = [];
  const createdCoatColorIds: string[] = [];
  const usedBreedCodes = new Set<number>();
  const usedCoatColorCodes = new Set<number>();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleRef);
    prisma = app.get(PrismaService);

    const [existingBreeds, existingColors] = await Promise.all([
      prisma.breed.findMany({ select: { code: true } }),
      prisma.coatColor.findMany({ select: { code: true } }),
    ]);

    existingBreeds.forEach(({ code }) => usedBreedCodes.add(code));
    existingColors.forEach(({ code }) => usedCoatColorCodes.add(code));

    const email = `coverage_admin_${Date.now()}@example.com`;
    const password = 'AdminCoverage123!';

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password })
      .expect(httpStatus.created);

    await prisma.user.update({
      where: { email },
      data: { role: UserRole.ADMIN },
    });

    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(httpStatus.created);

    adminToken = loginRes.body.data.access_token;
  });

  afterAll(async () => {
    if (createdCoatColorIds.length > 0) {
      await prisma.coatColor.deleteMany({ where: { id: { in: createdCoatColorIds } } });
    }
    if (createdBreedIds.length > 0) {
      await prisma.breed.deleteMany({ where: { id: { in: createdBreedIds } } });
    }
    await app.close();
  });

  describe('Breeds endpoints', () => {
    let createdBreedId: string;

    const buildBreedPayload = async (
      overrides: Partial<{ code: number; name: string; description?: string }> = {},
    ) => ({
      code:
        overrides.code ??
        (await reserveUniqueCode(usedBreedCodes, (code: number) =>
          prisma.breed.findUnique({ where: { code } }),
        )),
      name: overrides.name ?? `Integration Breed ${randomUUID()}`,
      description: overrides.description ?? 'Integration coverage test breed',
    });

    it('allows admin to create a breed', async () => {
  const payload = await buildBreedPayload();

      const res = await request(app.getHttpServer())
        .post('/api/v1/breeds')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)
        .expect(httpStatus.created);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        name: payload.name,
        code: payload.code,
        description: payload.description,
      });

      createdBreedId = res.body.data.id;
      createdBreedIds.push(createdBreedId);
    });

    it('lists breeds with pagination and search support', async () => {
      const searchableBreed = await buildBreedPayload({
        name: `Integration Search Breed ${randomUUID()}`,
      });

  const createRes = await request(app.getHttpServer())
        .post('/api/v1/breeds')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(searchableBreed)
        .expect(httpStatus.created);

      createdBreedIds.push(createRes.body.data.id);

      const res = await request(app.getHttpServer())
        .get('/api/v1/breeds')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 5, search: 'Search' })
        .expect(httpStatus.ok);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toMatchObject({
        page: 1,
        limit: 5,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      });
      expect(res.body.data.some((breed: any) => breed.name === searchableBreed.name)).toBe(true);
    });

    it('retrieves breed details including counts', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/breeds/${createdBreedId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.ok);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdBreedId);
      expect(res.body.data._count).toBeDefined();
      expect(res.body.data._count.cats).toBeGreaterThanOrEqual(0);
    });

    it('updates breed metadata', async () => {
      const updatedDescription = 'Updated description for coverage checks';

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/breeds/${createdBreedId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: updatedDescription })
        .expect(httpStatus.ok);

      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe(updatedDescription);
    });

    it('returns breed statistics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/breeds/statistics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.ok);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        totalBreeds: expect.any(Number),
        mostPopularBreeds: expect.any(Array),
        breedDistribution: expect.any(Array),
      });
    });

    it('responds with 404 for missing breed', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/breeds/${randomUUID()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.notFound);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('Coat color endpoints', () => {
    let createdCoatColorId: string;

    const buildCoatColorPayload = async (
      overrides: Partial<{ code: number; name: string; description?: string }> = {},
    ) => ({
      code:
        overrides.code ??
        (await reserveUniqueCode(usedCoatColorCodes, (code: number) =>
          prisma.coatColor.findUnique({ where: { code } }),
        )),
      name: overrides.name ?? `Integration Coat Color ${randomUUID()}`,
      description: overrides.description ?? 'Integration coverage test coat color',
    });

    it('allows admin to create a coat color', async () => {
  const payload = await buildCoatColorPayload();

      const res = await request(app.getHttpServer())
        .post('/api/v1/coat-colors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)
        .expect(httpStatus.created);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        name: payload.name,
        code: payload.code,
      });

      createdCoatColorId = res.body.data.id;
      createdCoatColorIds.push(createdCoatColorId);
    });

    it('lists coat colors with pagination and search support', async () => {
      const searchableColor = await buildCoatColorPayload({
        name: `Integration Search Color ${randomUUID()}`,
      });

  const createRes = await request(app.getHttpServer())
        .post('/api/v1/coat-colors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(searchableColor)
        .expect(httpStatus.created);

      createdCoatColorIds.push(createRes.body.data.id);

      const res = await request(app.getHttpServer())
        .get('/api/v1/coat-colors')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ page: 1, limit: 5, search: 'Search' })
        .expect(httpStatus.ok);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toMatchObject({
        page: 1,
        limit: 5,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      });
      expect(res.body.data.some((color: any) => color.name === searchableColor.name)).toBe(true);
    });

    it('retrieves coat color details including counts', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/coat-colors/${createdCoatColorId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.ok);

      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdCoatColorId);
      expect(res.body.data._count).toBeDefined();
    });

    it('updates coat color description', async () => {
      const updatedDescription = 'Updated coat color description for coverage';

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/coat-colors/${createdCoatColorId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: updatedDescription })
        .expect(httpStatus.ok);

      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe(updatedDescription);
    });

    it('returns coat color statistics', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/coat-colors/statistics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.ok);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toMatchObject({
        totalColors: expect.any(Number),
        mostPopularColors: expect.any(Array),
        colorDistribution: expect.any(Array),
      });
    });

    it('responds with 404 for missing coat color', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/coat-colors/${randomUUID()}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(httpStatus.notFound);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
