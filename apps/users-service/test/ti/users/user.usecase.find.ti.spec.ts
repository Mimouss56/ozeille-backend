import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";
import { UserUsecaseFind } from "src/users/usecases/user.usecase.find-by";

describe("UserUsecaseFind (TI)", () => {
  let module: TestingModule;
  let usecase: UserUsecaseFind;
  const mockPrisma = { user: { findUnique: jest.fn() } };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [UserUsecaseFind, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    usecase = module.get<UserUsecaseFind>(UserUsecaseFind);
  });

  beforeEach(() => jest.clearAllMocks());

  it("should return mapped user when found", async () => {
    const user = {
      id: "u1",
      email: "x@y.com",
      password: "secret",
      firstName: "A",
      lastName: "B",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.user.findUnique.mockResolvedValue(user);

    const result = await usecase.findOne({ id: "u1" });

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: "u1" } });
    expect(result).toEqual({
      id: "u1",
      email: "x@y.com",
      firstName: "A",
      lastName: "B",
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
    expect(result).not.toHaveProperty("password");
  });

  it("should return null when not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const result = await usecase.findOne({ email: "no@one.com" });

    expect(result).toBeNull();
  });
});
