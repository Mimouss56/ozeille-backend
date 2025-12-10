import { Test, TestingModule } from "@nestjs/testing";
import { UserCreateInput } from "src/generated/prisma/models";
import { PrismaService } from "src/prisma/prisma.service";
import { UserUsecaseCreate } from "src/users/usecases/user.usecase.create";

describe("UserUsecaseCreate (TI)", () => {
  let module: TestingModule;
  let usecase: UserUsecaseCreate;
  const mockPrisma = { user: { create: jest.fn() } };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [UserUsecaseCreate, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    usecase = module.get<UserUsecaseCreate>(UserUsecaseCreate);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a user and omit password", async () => {
    const created = {
      id: "uuid",
      email: "a@b.com",
      password: "hashed",
      firstName: "John",
      lastName: "Doe",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.user.create.mockResolvedValue(created);

    const payload = {
      email: "a@b.com",
      password: "p",
      firstName: "John",
      lastName: "Doe",
    };
    const result = await usecase.create(payload);

    expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expect.objectContaining({ id: "uuid", email: "a@b.com" }));
    expect(result).not.toHaveProperty("password");
  });

  it("should throw Error when prisma.create fails", async () => {
    mockPrisma.user.create.mockRejectedValue(new Error("db"));

    await expect(usecase.create({} as UserCreateInput)).rejects.toThrow("Error creating user");
  });
});
