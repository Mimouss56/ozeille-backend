import { type INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.module";
import request from "supertest";

import { AuthDataset } from "./auth.dataset.e2e";
import { AuthTestContext } from "./auth.test.context.e2e";

describe("POST /api/auth/register (e2e)", () => {
  let app: INestApplication;
  let ctx: AuthTestContext;
  let prisma: PrismaService;
  let redis: RedisService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    redis = moduleFixture.get<RedisService>(RedisService);

    app = moduleFixture.createNestApplication();
    ctx = new AuthTestContext(prisma);
    await ctx.init();
    await app.init();
  }, 30000);

  afterAll(async () => {
    if (redis) await redis.disconnect();
    await ctx.cleanup();
    if (prisma) await prisma.$disconnect();
    await app.close();
  }, 10000);

  beforeEach(async () => {
    // On s'assure que l'utilisateur de test d'inscription est bien supprimé avant chaque test
    await prisma.user.deleteMany({
      where: { email: AuthDataset.registerUser.email },
    });
  });

  it("devrait créer un utilisateur avec des données valides", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send(AuthDataset.registerUser)
      .expect(201);

    expect(response.body).toEqual({});

    const user = await prisma.user.findUnique({
      where: { email: AuthDataset.registerUser.email },
    });
    expect(user).toBeDefined();
    expect(user?.email).toBe(AuthDataset.registerUser.email);
    expect(user?.confirmedAt).toBeNull();
  });

  // Test a revoir, attendu normal on ne previent pas qu'on n'a pas le bon email
  it.skip("devrait refuser si l'email existe déjà", async () => {
    // On utilise l'utilisateur déjà présent dans le Dataset !
    const duplicateUser = {
      ...AuthDataset.registerUser,
      email: AuthDataset.confirmedUser.email,
    };
    const response = await request(app.getHttpServer()).post("/api/auth/register").send(duplicateUser);

    expect([400, 409]).toContain(response.status);
  });

  it("devrait retourner 400 si le prénom est manquant", async () => {
    const { firstName: _, ...userWithoutFirstName } = AuthDataset.registerUser;
    const response = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send(userWithoutFirstName)
      .expect(400);

    expect(response.body).toHaveProperty("message");
  });

  it("devrait retourner 400 si le nom est manquant", async () => {
    const { lastName: _lastName, ...userWithoutLastName } = AuthDataset.registerUser;
    const response = await request(app.getHttpServer())
      .post("/api/auth/register")
      .send(userWithoutLastName)
      .expect(400);

    expect(response.body).toHaveProperty("message");
  });
});
