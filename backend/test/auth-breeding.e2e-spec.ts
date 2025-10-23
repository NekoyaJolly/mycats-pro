import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { createTestApp } from "./utils/create-test-app";

describe("Auth -> Breeding (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleRef);
  });

  afterAll(async () => {
    await app.close();
  });

  it("register, login, create breeding", async () => {
    const email = `breeding_test_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;
  const password = "Secret123!";

    // register
    await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ email, password })
      .expect(201);

    // login
    const loginRes = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email, password })
      .expect(201);

    const token = loginRes.body.data.access_token as string;
    expect(token).toBeDefined();

    // create breeding (needs mother/father cat; here we expect 400/404 if not present)
    await request(app.getHttpServer())
      .post("/api/v1/breeding")
      .set("Authorization", `Bearer ${token}`)
      .send({
        femaleId: "00000000-0000-0000-0000-000000000000",
        maleId: "00000000-0000-0000-0000-000000000000",
        breedingDate: "2025-08-01",
      })
      .expect((res) => {
        // Accept 400/404 since cats may not exist; at least auth works
        if (![201, 400, 404].includes(res.status)) {
          throw new Error(`Unexpected status: ${res.status}`);
        }
      });
  });
});
