import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Care & Tags flows (e2e)", () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it("tags: register -> login -> create cat -> create tag -> assign/unassign", async () => {
    const email = `care_${Date.now()}@example.com`;
  const password = "Secret123!";

    // register
    const reg = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ email, password })
      .expect(201);
    const ownerId = reg.body.data.id as string;

    // login
    const login = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email, password })
      .expect(201);
    const token = login.body.data.access_token as string;

    // create a cat (owned by the registered user)
    const catRes = await request(app.getHttpServer())
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

    // create a tag (auth required)
    const tagRes = await request(app.getHttpServer())
      .post("/api/v1/tags")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: `indoor-${Date.now()}`, color: "#00AA88" })
      .expect(201);
    const tagId = tagRes.body.data.id as string;

    // assign tag to cat
    await request(app.getHttpServer())
      .post(`/api/v1/tags/cats/${catId}/tags`)
      .set("Authorization", `Bearer ${token}`)
      .send({ tagId })
      .expect(200)
      .expect((res) => {
        if (!res.body.success) throw new Error("assign failed");
      });

    // unassign tag from cat
    await request(app.getHttpServer())
      .delete(`/api/v1/tags/cats/${catId}/tags/${tagId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        if (!res.body.success) throw new Error("unassign failed");
      });
  });

  it("care: register -> login -> create cat -> create schedule -> complete", async () => {
    const email = `care2_${Date.now()}@example.com`;
  const password = "Secret123!";

    // register & login
    const reg = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({ email, password })
      .expect(201);
    const ownerId = reg.body.data.id as string;
    const login = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email, password })
      .expect(201);
    const token = login.body.data.access_token as string;

    // create a cat
    const catRes = await request(app.getHttpServer())
      .post("/api/v1/cats")
      .set("Authorization", `Bearer ${token}`)
      .send({
        registrationId: `REG-${Date.now()}`,
        name: "E2E Care Cat",
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

    // create care schedule
    const schedCreate = await request(app.getHttpServer())
      .post("/api/v1/care/schedules")
      .set("Authorization", `Bearer ${token}`)
      .send({
        catId,
        careType: "HEALTH_CHECK",
        scheduledDate: "2025-09-01",
        description: "Annual check",
      })
      .expect(201);
    const scheduleId = schedCreate.body.data.id as string;

    // complete it with next schedule
    await request(app.getHttpServer())
      .patch(`/api/v1/care/schedules/${scheduleId}/complete`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        completedDate: "2025-09-01",
        nextScheduledDate: "2026-09-01",
        notes: "All good",
      })
      .expect(200)
      .expect((res) => {
        if (!res.body.success) throw new Error("complete failed");
      });

    // fetch schedules list for the cat
    const list = await request(app.getHttpServer())
      .get(`/api/v1/care/schedules?catId=${catId}`)
      .expect(200);
    expect(list.body.data?.length).toBeGreaterThan(0);
  });
});
