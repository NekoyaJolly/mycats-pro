import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'crypto';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { PedigreeService } from '../src/pedigree/pedigree.service';
import { CreatePedigreeDto } from '../src/pedigree/dto/create-pedigree.dto';
import { createTestApp } from './utils/create-test-app';

const httpStatus = {
  ok: 200,
  created: 201,
  forbidden: 403,
  notFound: 404,
};

describe('Pedigree module (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let pedigreeService: PedigreeService;
  const createdPedigreeIds: string[] = [];
  const createdBreedIds: string[] = [];
  const createdCoatColorIds: string[] = [];
  const createdGenderIds: string[] = [];

  const buildCreateDto = (overrides: Partial<CreatePedigreeDto> = {}) => {
    const base: Partial<CreatePedigreeDto> = {
      pedigreeId: overrides.pedigreeId ?? `PED-${Date.now()}-${randomUUID()}`,
      catName: overrides.catName ?? `Coverage Cat ${randomUUID()}`,
    };

    const cleanedOverrides = Object.fromEntries(
      Object.entries(overrides).filter(([, value]) => value !== undefined),
    ) as Partial<CreatePedigreeDto>;

    return {
      ...base,
      ...cleanedOverrides,
    } as CreatePedigreeDto;
  };

  const registerPedigree = async (overrides: Partial<CreatePedigreeDto> = {}) => {
    const dto = buildCreateDto(overrides);
    const result = await pedigreeService.create(dto);
    createdPedigreeIds.push(result.data.id);
    return result.data;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleRef);
    prisma = app.get(PrismaService);
    pedigreeService = app.get(PedigreeService);
  });

  afterAll(async () => {
    if (createdPedigreeIds.length > 0) {
      await prisma.pedigree.deleteMany({
        where: { id: { in: createdPedigreeIds } },
      });
    }

    if (createdBreedIds.length > 0) {
      await prisma.breed.deleteMany({ where: { id: { in: createdBreedIds } } });
    }

    if (createdCoatColorIds.length > 0) {
      await prisma.coatColor.deleteMany({ where: { id: { in: createdCoatColorIds } } });
    }

    if (createdGenderIds.length > 0) {
      await prisma.gender.deleteMany({ where: { id: { in: createdGenderIds } } });
    }

    await app.close();
  });

  describe('read operations via HTTP', () => {
    it('creates pedigrees via service and exposes them through list and detail endpoints', async () => {
      const created = await registerPedigree({ title: 'Integration Pedigree' });

      const listRes = await request(app.getHttpServer())
        .get('/api/v1/pedigrees')
        .query({ search: 'Integration' })
        .expect(httpStatus.ok);

      expect(listRes.body.success).toBe(true);
      expect(Array.isArray(listRes.body.data)).toBe(true);
      expect(listRes.body.data.some((item: any) => item.id === created.id)).toBe(true);
      expect(listRes.body.meta).toMatchObject({
        page: 1,
        total: expect.any(Number),
        limit: expect.any(Number),
        totalPages: expect.any(Number),
      });

      const byIdRes = await request(app.getHttpServer())
        .get(`/api/v1/pedigrees/${created.id}`)
        .expect(httpStatus.ok);

      expect(byIdRes.body.success).toBe(true);
      expect(byIdRes.body.data.id).toBe(created.id);
      expect(byIdRes.body.data.catName).toBe(created.catName);

      const byPedigreeIdRes = await request(app.getHttpServer())
        .get(`/api/v1/pedigrees/pedigree-id/${created.pedigreeId}`)
        .expect(httpStatus.ok);

      expect(byPedigreeIdRes.body.success).toBe(true);
      expect(byPedigreeIdRes.body.data.id).toBe(created.id);
    });

    it('returns family tree and family projections for stored pedigrees', async () => {
      const created = await registerPedigree({ title: 'Family Tree Pedigree' });

      const familyTreeRes = await request(app.getHttpServer())
        .get(`/api/v1/pedigrees/${created.id}/family-tree`)
        .expect(httpStatus.ok);

      expect(familyTreeRes.body.success).toBe(true);
      expect(familyTreeRes.body.data.id).toBe(created.id);

      const familyRes = await request(app.getHttpServer())
        .get(`/api/v1/pedigrees/${created.id}/family`)
        .query({ generations: 2 })
        .expect(httpStatus.ok);

      expect(familyRes.body.success).toBe(true);
      expect(familyRes.body.data.id).toBe(created.id);
    });
  });

  describe('write operations via service', () => {
    it('updates an existing pedigree and persists changes', async () => {
      const created = await registerPedigree({ title: 'Update target' });

      const updated = await pedigreeService.update(created.id, { notes: 'Updated note for coverage' });

      expect(updated.success).toBe(true);
      expect(updated.data.notes).toBe('Updated note for coverage');

      const verifyRes = await request(app.getHttpServer())
        .get(`/api/v1/pedigrees/${created.id}`)
        .expect(httpStatus.ok);

      expect(verifyRes.body.data.notes).toBe('Updated note for coverage');
    });

    it('removes a pedigree and the endpoint responds with not found afterwards', async () => {
      const created = await registerPedigree({ title: 'Delete target' });

      const removal = await pedigreeService.remove(created.id);

      expect(removal.success).toBe(true);

      const notFoundRes = await request(app.getHttpServer())
        .get(`/api/v1/pedigrees/${created.id}`)
        .expect(httpStatus.notFound);

      expect(notFoundRes.body.success).toBe(false);
      expect(notFoundRes.body.error.code).toBe('NOT_FOUND');

      // remove id to avoid afterAll attempting to delete again
      const index = createdPedigreeIds.indexOf(created.id);
      if (index !== -1) {
        createdPedigreeIds.splice(index, 1);
      }
    });
  });

  describe('authorization and error handling', () => {
    it('rejects pedigree creation via HTTP without admin role', async () => {
      const payload = buildCreateDto({ title: 'Forbidden attempt' });

      const res = await request(app.getHttpServer())
        .post('/api/v1/pedigrees')
        .send(payload)
        .expect(httpStatus.forbidden);

      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('returns not found for pedigree lookups by id and pedigree id', async () => {
      const missingId = randomUUID();
      const missingPedigreeId = `PED-MISSING-${Date.now()}`;

      const byIdRes = await request(app.getHttpServer())
        .get(`/api/v1/pedigrees/${missingId}`)
        .expect(httpStatus.notFound);

      expect(byIdRes.body.success).toBe(false);
      expect(byIdRes.body.error.code).toBe('NOT_FOUND');

      const byPedigreeIdRes = await request(app.getHttpServer())
        .get(`/api/v1/pedigrees/pedigree-id/${missingPedigreeId}`)
        .expect(httpStatus.notFound);

      expect(byPedigreeIdRes.body.success).toBe(false);
      expect(byPedigreeIdRes.body.error.code).toBe('NOT_FOUND');
    });

    it('propagates not found errors from service update and removal', async () => {
      const missingId = randomUUID();

      await expect(
        pedigreeService.update(missingId, { notes: 'never persisted' }),
      ).rejects.toBeInstanceOf(NotFoundException);

      await expect(pedigreeService.remove(missingId)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns not found for family and descendant endpoints when pedigree does not exist', async () => {
      const missingId = randomUUID();

      const familyTreeRes = await request(app.getHttpServer())
        .get(`/api/v1/pedigrees/${missingId}/family-tree`)
        .expect(httpStatus.notFound);

      expect(familyTreeRes.body.success).toBe(false);

      const familyRes = await request(app.getHttpServer())
        .get(`/api/v1/pedigrees/${missingId}/family`)
        .expect(httpStatus.notFound);

      expect(familyRes.body.success).toBe(false);

      const descendantsRes = await request(app.getHttpServer())
        .get(`/api/v1/pedigrees/${missingId}/descendants`)
        .expect(httpStatus.notFound);

      expect(descendantsRes.body.success).toBe(false);
    });
  });

  describe('advanced list and relation projections', () => {
    it('filters pedigrees by codes and attributes', async () => {
      let breed = await prisma.breed.findFirst();

      if (!breed) {
        const code = 100000 + Math.floor(Math.random() * 900000);
        breed = await prisma.breed.create({
          data: {
            code,
            name: `Test Breed ${code}`,
          },
        });
        createdBreedIds.push(breed.id);
      }

      let color = await prisma.coatColor.findFirst();

      if (!color) {
        const code = 100000 + Math.floor(Math.random() * 900000);
        color = await prisma.coatColor.create({
          data: {
            code,
            name: `Test Coat ${code}`,
          },
        });
        createdCoatColorIds.push(color.id);
      }

      let gender = await prisma.gender.findFirst();

      if (!gender) {
        const code = 100000 + Math.floor(Math.random() * 900000);
        gender = await prisma.gender.create({
          data: {
            code,
            name: `Test Gender ${code}`,
          },
        });
        createdGenderIds.push(gender.id);
      }

      const created = await registerPedigree({
        title: 'Filter coverage pedigree',
        eyeColor: 'Amber',
      });

      await prisma.pedigree.update({
        where: { id: created.id },
        data: {
          breedCode: breed.code,
          coatColorCode: color.code,
          genderCode: gender.code,
          eyeColor: 'Amber',
        },
      });

      const listRes = await request(app.getHttpServer())
        .get('/api/v1/pedigrees')
        .query({
          breedId: String(breed.code),
          colorId: String(color.code),
          gender: String(gender.code),
          eyeColor: 'Amber',
          page: 1,
          limit: 5,
          sortBy: 'createdAt',
          sortOrder: 'asc',
        })
        .expect(httpStatus.ok);

      expect(listRes.body.success).toBe(true);
      expect(listRes.body.data.some((item: any) => item.id === created.id)).toBe(true);
      expect(listRes.body.meta).toMatchObject({ total: expect.any(Number), page: 1, limit: 5 });
    });

    it('returns descendants list for an existing pedigree', async () => {
      const parent = await registerPedigree({ title: 'Descendant root', catName: `Parent Cat ${randomUUID()}` });

      const child = await prisma.pedigree.create({
        data: {
          pedigreeId: `PED-CHILD-${Date.now()}-${randomUUID()}`,
          catName: `Child Cat ${randomUUID()}`,
          fatherCatName: parent.catName,
        },
      });

      createdPedigreeIds.push(child.id);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/pedigrees/${parent.id}/descendants`)
        .expect(httpStatus.ok);

      expect(res.body.success).toBe(true);
      expect(res.body.data.pedigree.id).toBe(parent.id);
      expect(Array.isArray(res.body.data.children)).toBe(true);
    });
  });
});
