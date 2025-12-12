import { Test, TestingModule } from "@nestjs/testing";
import { Prisma } from "src/generated/prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { UsersRepository } from "src/users/repository/users.repository";

describe("UsersRepository (TI)", () => {
  let module: TestingModule;
  let repository: UsersRepository;
  const mockPrisma = { user: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() } };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [UsersRepository, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a user", async () => {
    const created = {
      id: "uuid",
      email: "a@b.com",
      password: "hashed",
      firstName: "John",
      lastName: "Doe",
      confirmedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.user.create.mockResolvedValue(created);

    const payload: Prisma.UserCreateInput = {
      email: "a@b.com",
      password: "p",
      firstName: "John",
      lastName: "Doe",
    };
    const result = await repository.create(payload);

    expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expect.objectContaining({ id: "uuid", email: "a@b.com" }));
  });

  it("should find a user by email", async () => {
    const user = {
      id: "uuid",
      email: "test@example.com",
      password: "hashed",
      firstName: "John",
      lastName: "Doe",
      confirmedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.user.findUnique.mockResolvedValue(user);

    const result = await repository.findByEmail("test@example.com");

    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "test@example.com" } });
    expect(result).toEqual(user);
  });

  it("should return null when user not found", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const result = await repository.findByEmail("notfound@example.com");

    expect(result).toBeNull();
  });
});
