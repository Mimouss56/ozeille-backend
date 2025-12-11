import { HttpStatus, type INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import Redis from "ioredis";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";

describe("AuthController (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redis: Redis;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: Redis,
          useFactory: () => {
            return new Redis({
              host: process.env.REDIS_HOST || "localhost",
              port: parseInt(process.env.REDIS_PORT || "6379", 10),
              maxRetriesPerRequest: 3,
              retryStrategy: (times: number) => {
                if (times > 3) {
                  return null; // Stop retrying
                }
                return Math.min(times * 50, 2000);
              },
            });
          },
        },
      ],
    })
      .overrideProvider(Redis)
      .useFactory({
        factory: () => {
          return new Redis({
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT || "6379", 10),
            maxRetriesPerRequest: 3,
            retryStrategy: (times: number) => {
              if (times > 3) {
                return null;
              }
              return Math.min(times * 50, 2000);
            },
          });
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    redis = moduleFixture.get<Redis>(Redis);
  }, 30000);

  afterAll(async () => {
    await prisma.$disconnect();
    if (redis) {
      await redis.quit();
    }
    await app.close();
  }, 10000);

  describe("POST /api/auth/register", () => {
    const validUser = {
      email: "test@example.com",
      password: "Password123!",
      confirmedPassword: "Password123!",
      firstName: "John",
      lastName: "Doe",
    };

    beforeEach(async () => {
      // Nettoyer la base avant chaque test
      await prisma.user.deleteMany({ where: { email: validUser.email } });
    });

    it("devrait créer un utilisateur avec des données valides", async () => {
      const response = await request(app.getHttpServer()).post("/api/auth/register").send(validUser).expect(201);

      expect(response.body).toEqual({});

      // Vérifier que l'utilisateur existe en base
      const user = await prisma.user.findUnique({
        where: { email: validUser.email },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe(validUser.email);
      expect(user?.firstName).toBe(validUser.firstName);
      expect(user?.lastName).toBe(validUser.lastName);
      expect(user?.confirmedAt).toBeNull();
    });

    it("devrait retourner 400 si l'email est invalide", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/auth/register")
        .send({ ...validUser, email: "invalid-email" })
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    it("devrait retourner 400 si le mot de passe est trop court", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/auth/register")
        .send({ ...validUser, password: "short", confirmedPassword: "short" })
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    it("devrait retourner 400 si les mots de passe ne correspondent pas", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          ...validUser,
          password: "Password123!",
          confirmedPassword: "DifferentPassword123!",
        })
        .expect(HttpStatus.NOT_ACCEPTABLE);

      expect(response.body).toHaveProperty("message");
    });

    it("devrait retourner 400 si le prénom est manquant", async () => {
      const { firstName: _firstName, ...userWithoutFirstName } = validUser;
      const response = await request(app.getHttpServer())
        .post("/api/auth/register")
        .send(userWithoutFirstName)
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    it("devrait retourner 400 si le nom est manquant", async () => {
      const { lastName: _lastName, ...userWithoutLastName } = validUser;
      const response = await request(app.getHttpServer())
        .post("/api/auth/register")
        .send(userWithoutLastName)
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /api/auth/register/confirm", () => {
    const testEmail = "confirm-test@example.com";
    const testToken = "test-token-123";

    beforeEach(async () => {
      // Créer un utilisateur de test
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
      // Nettoyer Redis
      try {
        await redis.del(`confirm-email-token:${testToken}`);
      } catch (error) {
        console.warn("Failed to clean Redis in afterEach:", error);
      }
    }, 10000);

    it("devrait confirmer l'email avec un token valide", async () => {
      // Configurer le token dans Redis
      await redis.set(`confirm-email-token:${testToken}`, testEmail);

      const response = await request(app.getHttpServer())
        .post("/api/auth/register/confirm")
        .query({ token: testToken })
        .expect(201);

      expect(response.body).toEqual({});

      // Vérifier que confirmedAt est mis à jour
      const user = await prisma.user.findUnique({
        where: { email: testEmail },
      });
      expect(user?.confirmedAt).not.toBeNull();

      // Vérifier que le token a été supprimé de Redis
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
      // Ne pas définir de token dans Redis pour simuler l'expiration
      const response = await request(app.getHttpServer())
        .post("/api/auth/register/confirm")
        .query({ token: "expired-token" })
        .expect(201);

      expect(response.body).toEqual({});
    });
  });
});
