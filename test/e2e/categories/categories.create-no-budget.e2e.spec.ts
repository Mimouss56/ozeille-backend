import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { PrismaService } from "src/prisma/prisma.service";
import { RedisService } from "src/redis/redis.module";
import request from "supertest";

describe("Categories E2E - Création sans budgetId", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    try {
      // Pour Prisma
      const prisma = app.get(PrismaService);
      if (prisma) {
        await prisma.$disconnect();
      }
      // Pour Redis
      const redis = app.get(RedisService);
      if (redis) {
        await redis.disconnect();
      }
    } catch (e) {
      // Log l'erreur pour comprendre si quelque chose échoue
      console.error("Erreur lors du nettoyage des connexions :", e);
    } finally {
      // 2. On ferme l'application NestJS à la toute fin
      await app.close();
    }
  });

  it("doit retourner 406 si budgetId est manquant", async () => {
    const res = await request(app.getHttpServer()).post("/api/categories").send({
      name: "Test Catégorie",
      // budgetId manquant volontairement
    });
    expect(res.status).toBe(400);
  });
});
