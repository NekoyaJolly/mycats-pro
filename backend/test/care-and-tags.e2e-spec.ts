import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Server } from "http";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Care & Tags flows (e2e)", () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.setGlobalPrefix("api/v1");
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it("care schedule: create -> complete (happy path with seed cat)", async () => {
    const email = `e2e_${Date.now()}@example.com`;
  const password = "Secret123!";

    // register & login
    const reg = await request(server)
      .post("/api/v1/auth/register")
      .send({ email, password })
      .expect(201);
    const ownerId = reg.body.data.id as string;
    const login = await request(server)
      .post("/api/v1/auth/login")
      .send({ email, password })
      .expect(201);
    const token = login.body.data.access_token as string;

    // create a cat owned by the registered user (avoid seed dependency)
    const catRes = await request(server)
      .post("/api/v1/cats")
      .set("Authorization", `Bearer ${token}`)
      .send({
        registrationId: `REG-${Date.now()}`,
        name: "E2E Kitty",
        gender: "FEMALE",
        birthDate: "2024-01-01T00:00:00.000Z",
        ownerId,
      })
      .expect(201);
    const catId =
      catRes.body.id ??
      catRes.body.data?.id ??
      catRes.body?.data?.cat?.id ??
      catRes.body?.cat?.id ??
      catRes.body?.data?.catId;
    expect(catId).toBeDefined();

    // create schedule
    const createRes = await request(server)
      .post("/api/v1/care/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({
        catId,
        careType: "HEALTH_CHECK",
        scheduledDate: "2025-09-01",
        description: "年次健診",
      })
      .expect(201);
    const scheduleId = createRes.body.data.id as string;
    expect(scheduleId).toBeDefined();

    // complete schedule
    await request(server)
      .patch(`/api/v1/care/schedules/${scheduleId}/complete`)
      .set("Authorization", `Bearer ${token}`)
      .send({ completedDate: "2025-09-02", notes: "良好" })
      .expect(200);
  });

  it("tags: create -> assign -> unassign", async () => {
    const email = `e2e_${Date.now()}@example.com`;
    const password = "Secret123!";

    // register & login
    const reg = await request(server)
      .post("/api/v1/auth/register")
      .send({ email, password })
      .expect(201);
    const ownerId = reg.body.data.id as string;
    const login = await request(server)
      .post("/api/v1/auth/login")
      .send({ email, password })
      .expect(201);
    const token = login.body.data.access_token as string;

    // create tag
    const tagName = `tag_${Date.now()}`;
    const tagRes = await request(server)
      .post("/api/v1/tags")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: tagName, color: "#3B82F6" })
      .expect(201);
    const tagId = tagRes.body.data.id as string;
    expect(tagId).toBeDefined();

    // create a cat (avoid dependency on existing data)
    const catRes = await request(server)
      .post("/api/v1/cats")
      .set("Authorization", `Bearer ${token}`)
      .send({
        registrationId: `REG-${Date.now()}`,
        name: "E2E Tag Cat",
        gender: "FEMALE",
        birthDate: "2024-01-01T00:00:00.000Z",
        ownerId,
      })
      .expect(201);
    const catId =
      catRes.body.id ??
      catRes.body.data?.id ??
      catRes.body?.data?.cat?.id ??
      catRes.body?.cat?.id ??
      catRes.body?.data?.catId;
    expect(catId).toBeDefined();

    // assign
    await request(server)
      .post(`/api/v1/tags/cats/${catId}/tags`)
      .set("Authorization", `Bearer ${token}`)
      .send({ tagId })
      .expect(200);

    // unassign
    await request(server)
      .delete(`/api/v1/tags/cats/${catId}/tags/${tagId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
  });
});
