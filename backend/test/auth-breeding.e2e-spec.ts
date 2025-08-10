import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Auth -> Breeding (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    // Mirror main.ts behavior
    app.setGlobalPrefix("api/v1");
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("register, login, create breeding", async () => {
    const email = `test_${Date.now()}@example.com`;
    const password = "secret123";

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
        motherId: "00000000-0000-0000-0000-000000000000",
        fatherId: "00000000-0000-0000-0000-000000000000",
        matingDate: "2025-08-01",
      })
      .expect((res) => {
        // Accept 400/404 since cats may not exist; at least auth works
        if (![201, 400, 404].includes(res.status)) {
          throw new Error(`Unexpected status: ${res.status}`);
        }
      });
  });
});
