import { type INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.module";
import request from "supertest";

describe("POST /api/auth/register/confirm (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redis: RedisService;

  const testEmail = "confirm-test@example.com";
  const testToken = "test-token-123";

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    redis = moduleFixture.get<RedisService>(RedisService);
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  }, 10000);

  beforeEach(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.user.create({
      data: {
        email: testEmail,
        password: "hashedPassword123",
        firstName: "Test",
        lastName: "User",
      },
    });
  });

  afterEach(async () => {
    try {
      await redis.del(`confirm-email-token:${testToken}`);
    } catch (error) {
      console.warn("Failed to clean Redis in afterEach:", error);
    }
  }, 10000);

  it("devrait confirmer l'email avec un token valide", async () => {
    await redis.set(`confirm-email-token:${testToken}`, testEmail);

    const response = await request(app.getHttpServer())
      .post("/api/auth/register/confirm")
      .query({ token: testToken })
      .expect(201);

    expect(response.body).toEqual({});

    const user = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    expect(user?.confirmedAt).not.toBeNull();

    const redisValue = await redis.get(`confirm-email-token:${testToken}`);
    expect(redisValue).toBeNull();
  });

  it("devrait retourner 400 si le token est manquant", async () => {
    const response = await request(app.getHttpServer()).post("/api/auth/register/confirm").expect(400);

    expect(response.body).toHaveProperty("message", "token is required");
  });

  it("devrait retourner ok: false si le token est invalide", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/register/confirm")
      .query({ token: "invalid-token" })
      .expect(201);

    expect(response.body).toEqual({});
  });

  it("devrait retourner ok: false si le token a expiré", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/register/confirm")
      .query({ token: "expired-token" })
      .expect(201);

    expect(response.body).toEqual({});
  });
});
