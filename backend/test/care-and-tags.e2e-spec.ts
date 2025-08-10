import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { AppModule } from "../src/app.module";

describe("Care & Tags flows (e2e)", () => {
  let app: INestApplication;
  let server: any;

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
    const password = "secret123";

    // register & login
    await request(server)
      .post("/api/v1/auth/register")
      .send({ email, password })
      .expect(201);
    const login = await request(server)
      .post("/api/v1/auth/login")
      .send({ email, password })
      .expect(201);
    const token = login.body.data.access_token as string;

    // fetch cats and pick one (assumes seed provides at least one)
    const catsRes = await request(server).get("/api/v1/cats").expect(200);
    const catId = catsRes.body.data?.[0]?.id;
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
    const password = "secret123";

    // register & login
    await request(server)
      .post("/api/v1/auth/register")
      .send({ email, password })
      .expect(201);
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

    // pick a cat
    const catsRes = await request(server).get("/api/v1/cats").expect(200);
    const catId = catsRes.body.data?.[0]?.id;
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
