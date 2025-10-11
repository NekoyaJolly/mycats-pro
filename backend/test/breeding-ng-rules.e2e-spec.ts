import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { createTestApp } from './utils/create-test-app';

describe('Breeding NG Rules API (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdRuleId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleRef);

    const email = `breeding_ng_rules_${Date.now()}@example.com`;
    const password = 'NgRulesTest123!';

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

  it('should create a new NG rule', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/breeding/ng-rules')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: '同一タグ禁止',
        description: '同じタグ同士の交配を禁止',
        type: 'TAG_COMBINATION',
        maleConditions: ['Champion'],
        femaleConditions: ['Champion'],
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      name: '同一タグ禁止',
      type: 'TAG_COMBINATION',
      active: true,
    });

    createdRuleId = res.body.data.id;
    expect(createdRuleId).toBeDefined();
  });

  it('should list NG rules including the created one', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/breeding/ng-rules')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    const found = res.body.data.find((rule: { id: string }) => rule.id === createdRuleId);
    expect(found).toBeDefined();
  });

  it('should update an existing NG rule', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/breeding/ng-rules/${createdRuleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        description: '条件を更新',
        maleConditions: ['GrandChampion'],
        femaleConditions: ['Champion'],
        active: false,
      })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      id: createdRuleId,
      description: '条件を更新',
      maleConditions: ['GrandChampion'],
      femaleConditions: ['Champion'],
      active: false,
    });
  });

  it('should delete the NG rule', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/api/v1/breeding/ng-rules/${createdRuleId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/breeding/ng-rules')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const found = listRes.body.data.find((rule: { id: string }) => rule.id === createdRuleId);
    expect(found).toBeUndefined();
  });
});
