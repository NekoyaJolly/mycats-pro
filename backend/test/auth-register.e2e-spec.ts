import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Auth register (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix("api/v1");
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("registers then rejects duplicate email with 409/400", async () => {
    const emailRaw = ` Dup_${Date.now()}@Example.com `;
    const email = emailRaw; // server should normalize
    const password = "Secret123!";

    // first register
    await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ email, password })
      .expect((res) => {
        if (![201, 200].includes(res.status)) {
          throw new Error(`unexpected status: ${res.status}`);
        }
      });

    // duplicate register should fail (409 or 400 as BadRequest)
    await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ email: emailRaw.toUpperCase(), password }) // different casing/spacing
      .expect((res) => {
        if (![409, 400].includes(res.status)) {
          throw new Error(`expected 409/400, got ${res.status}`);
        }
      });
  });
});
