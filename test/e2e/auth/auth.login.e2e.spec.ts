import { type INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.module";
import request from "supertest";

import { AuthDataset } from "./auth.dataset.e2e";
import { AuthTestContext } from "./auth.test.context.e2e";

describe("POST /api/auth/login (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redis: RedisService;
  let testContext: AuthTestContext;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    redis = moduleFixture.get<RedisService>(RedisService);

    testContext = new AuthTestContext(prisma);
    await testContext.init(); // Crée les utilisateurs une seule fois
  }, 30000);

  afterAll(async () => {
    if (redis) await redis.disconnect();
    await testContext.cleanup();
    if (prisma) await prisma.$disconnect();
    await app.close();
  }, 10000);

  afterEach(async () => {
    // Nettoyage de Redis uniquement, la BDD reste intacte
    try {
      await redis.del(`2fa:${testContext.confirmedUserId}`);
    } catch (error) {
      console.warn("Failed to clean Redis:", error);
    }
  });

  it("devrait se connecter avec des credentials valides et envoyer un code 2FA avec un tempToken", async () => {
    const response = await request(app.getHttpServer()).post("/api/auth/login").send({
      email: AuthDataset.confirmedUser.email,
      password: AuthDataset.confirmedUser.password,
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("tempToken");
    expect(response.body.tempToken).toMatch(/^tmp_[a-f0-9]{64}$/);

    const code = await redis.get(`2fa:${testContext.confirmedUserId}`);
    expect(code).not.toBeNull();
    expect(code).toMatch(/^\d{8}$/);
  });

  it("devrait retourner 401 si l'email n'est pas encore confirmé", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        email: AuthDataset.unconfirmedUser.email,
        password: AuthDataset.unconfirmedUser.password,
      })
      .expect(401);

    expect(response.body).toHaveProperty("message");
  });

  it("devrait retourner 401 si le mot de passe est incorrect", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        email: AuthDataset.confirmedUser.email,
        password: "WrongPassword123!",
      })
      .expect(401);

    expect(response.body).toHaveProperty("message", "Email ou mot de passe incorrect");
  });

  it("devrait retourner 401 si l'email n'existe pas", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        email: "nonexistent@example.com",
        password: "SomePassword123!",
      })
      .expect(401);

    expect(response.body).toHaveProperty("message", "Email ou mot de passe incorrect");
  });

  it("devrait retourner 401 si le mot de passe est incorrect", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        email: AuthDataset.confirmedUser.email,
        password: "WrongPassword123!",
      })
      .expect(401);

    expect(response.body).toHaveProperty("message", "Email ou mot de passe incorrect");
  });

  it("devrait retourner 400 si l'email est manquant", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        password: AuthDataset.confirmedUser.password,
      })
      .expect(400);

    expect(response.body).toHaveProperty("message");
  });

  it("devrait retourner 400 si le mot de passe est manquant", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        email: AuthDataset.registerUser.email,
      })
      .expect(400);

    expect(response.body).toHaveProperty("message");
  });

  it("devrait retourner 400 si l'email est invalide", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/login")
      .send({
        email: "invalid-email",
        password: AuthDataset.confirmedUser.password,
      })
      .expect(400);

    expect(response.body).toHaveProperty("message");
  });
});
