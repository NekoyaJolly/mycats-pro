import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Cats API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();

    // Create test user and get auth token
    const email = `cats_test_${Date.now()}@example.com`;
    const password = 'CatsTest123!';

    const registerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password })
      .expect(201);

    testUserId = registerRes.body.data.id;

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
    it('should return empty array when no cats', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should reject request without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/cats')
        .expect(401);
    });

    it('should respond within 1 second (performance check)', async () => {
      const startTime = Date.now();
      
      await request(app.getHttpServer())
        .get('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('POST /api/v1/cats', () => {
    it('should create a new cat with valid data', async () => {
      const catData = {
        registrationNumber: `CAT${Date.now()}`,
        catName: 'Test Cat',
        gender: 'MALE',
        birthDate: '2024-01-01',
        coatColor: 'WHITE',
        eyeColor: 'BLUE',
      };

      const res = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send(catData)
        .expect(201);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.catName).toBe(catData.catName);
      expect(res.body.data.gender).toBe(catData.gender);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing catName and gender
          birthDate: '2024-01-01',
        })
        .expect(400);
    });

    it('should validate gender enum', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          registrationNumber: `CAT${Date.now()}`,
          catName: 'Invalid Gender Cat',
          gender: 'INVALID_GENDER',
          birthDate: '2024-01-01',
        });

      expect([400, 422]).toContain(res.status);
    });

    it('should validate date format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          registrationNumber: `CAT${Date.now()}`,
          catName: 'Invalid Date Cat',
          gender: 'FEMALE',
          birthDate: 'invalid-date',
        })
        .expect(400);
    });

    it('should handle unique registration number constraint', async () => {
      const registrationNumber = `UNIQUE${Date.now()}`;

      // First creation should succeed
      await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          registrationNumber,
          catName: 'First Cat',
          gender: 'MALE',
          birthDate: '2024-01-01',
        })
        .expect(201);

      // Duplicate registration number should fail
      const res = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          registrationNumber,
          catName: 'Second Cat',
          gender: 'FEMALE',
          birthDate: '2024-01-02',
        });

      expect([400, 409]).toContain(res.status);
    });

    it('should create multiple cats successfully', async () => {
      const cats = [
        {
          registrationNumber: `MULTI1_${Date.now()}`,
          catName: 'Multi Cat 1',
          gender: 'MALE',
          birthDate: '2024-01-01',
        },
        {
          registrationNumber: `MULTI2_${Date.now()}`,
          catName: 'Multi Cat 2',
          gender: 'FEMALE',
          birthDate: '2024-02-01',
        },
        {
          registrationNumber: `MULTI3_${Date.now()}`,
          catName: 'Multi Cat 3',
          gender: 'MALE',
          birthDate: '2024-03-01',
        },
      ];

      for (const catData of cats) {
        const res = await request(app.getHttpServer())
          .post('/api/v1/cats')
          .set('Authorization', `Bearer ${authToken}`)
          .send(catData)
          .expect(201);

        expect(res.body.data.catName).toBe(catData.catName);
      }
    });
  });

  describe('GET /api/v1/cats/:id', () => {
    let createdCatId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          registrationNumber: `GET_BY_ID_${Date.now()}`,
          catName: 'Get By ID Test',
          gender: 'FEMALE',
          birthDate: '2024-01-15',
        })
        .expect(201);

      createdCatId = res.body.data.id;
    });

    it('should get cat by valid ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/cats/${createdCatId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.data).toHaveProperty('id', createdCatId);
      expect(res.body.data).toHaveProperty('catName', 'Get By ID Test');
    });

    it('should return 404 for non-existent ID', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      await request(app.getHttpServer())
        .get(`/api/v1/cats/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid UUID format', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/cats/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PATCH /api/v1/cats/:id', () => {
    let catId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          registrationNumber: `UPDATE_${Date.now()}`,
          catName: 'Original Name',
          gender: 'MALE',
          birthDate: '2024-01-01',
        })
        .expect(201);

      catId = res.body.data.id;
    });

    it('should update cat with valid data', async () => {
      const updateData = {
        catName: 'Updated Name',
        coatColor: 'BLACK',
        eyeColor: 'GREEN',
      };

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/cats/${catId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(res.body.data.catName).toBe(updateData.catName);
      expect(res.body.data.coatColor).toBe(updateData.coatColor);
    });

    it('should allow partial updates', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/cats/${catId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ catName: 'Only Name Updated' })
        .expect(200);

      expect(res.body.data.catName).toBe('Only Name Updated');
      expect(res.body.data.gender).toBe('MALE'); // Unchanged
    });

    it('should return 404 for non-existent cat', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      await request(app.getHttpServer())
        .patch(`/api/v1/cats/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ catName: 'New Name' })
        .expect(404);
    });

    it('should validate updated data', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/cats/${catId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ gender: 'INVALID_GENDER' })
        .expect(400);
    });
  });

  describe('DELETE /api/v1/cats/:id', () => {
    let catId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          registrationNumber: `DELETE_${Date.now()}`,
          catName: 'To Be Deleted',
          gender: 'FEMALE',
          birthDate: '2024-01-01',
        })
        .expect(201);

      catId = res.body.data.id;
    });

    it('should delete cat successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/cats/${catId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify cat is deleted
      await request(app.getHttpServer())
        .get(`/api/v1/cats/${catId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent cat', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      
      await request(app.getHttpServer())
        .delete(`/api/v1/cats/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/cats/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('Performance Tests', () => {
    it('should handle bulk create efficiently', async () => {
      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/api/v1/cats')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              registrationNumber: `BULK_${Date.now()}_${i}`,
              catName: `Bulk Cat ${i}`,
              gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
              birthDate: '2024-01-01',
            })
        );
      }

      await Promise.all(promises);
      const duration = Date.now() - startTime;

      // 10 creations should complete in under 5 seconds
      expect(duration).toBeLessThan(5000);
    }, 10000);

    it('should list cats efficiently with pagination', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .get('/api/v1/cats')
        .query({ page: 1, limit: 50 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Error Handling', () => {
    it('should return structured error response', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Invalid data
          gender: 'INVALID',
        })
        .expect(400);

      expect(res.body).toHaveProperty('statusCode');
      expect(res.body).toHaveProperty('message');
    });

    it('should handle database errors gracefully', async () => {
      // Try to create with invalid foreign key
      const res = await request(app.getHttpServer())
        .post('/api/v1/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          registrationNumber: `FK_TEST_${Date.now()}`,
          catName: 'FK Test',
          gender: 'MALE',
          birthDate: '2024-01-01',
          breedId: '00000000-0000-0000-0000-000000000000', // Non-existent breed
        });

      expect([400, 404]).toContain(res.status);
    });
  });
});
