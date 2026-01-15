import { HttpStatus, type INestApplication } from "@nestjs/common";
import { PrismaExceptionFilter } from "src/common/filters/prisma-exception.filter";
import { ZodValidationExceptionFilter } from "src/common/filters/validation.filter";
import { PrismaService } from "src/prisma/prisma.service";
import request from "supertest";

import { AuthTestContext } from "./auth.dataset.context.e2e";

describe("POST /api/auth/register (e2e)", () => {
  let app: INestApplication;
  let ctx: AuthTestContext;
  let prismaService: PrismaService;

  const validUser = {
    email: "test@example.com",
    password: "Password123!",
    confirmedPassword: "Password123!",
    firstName: "John",
    lastName: "Doe",
  };

  beforeAll(async () => {
    ctx = new AuthTestContext(prismaService);
    await ctx.init();
    app = ctx.app;
    // Ajoute les filtres globaux comme dans main.ts
    app.useGlobalFilters(new ZodValidationExceptionFilter(), new PrismaExceptionFilter());
  }, 30000);

  afterAll(async () => {
    await ctx.cleanup();
  }, 10000);

  beforeEach(async () => {
    await ctx.deleteUserByEmail(validUser.email);
  });

  it("devrait créer un utilisateur avec des données valides", async () => {
    const response = await request(app.getHttpServer()).post("/api/auth/register").send(validUser).expect(201);

    expect(response.body).toEqual({});

    const user = await ctx.prisma.user.findUnique({
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
