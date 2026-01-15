import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { MailerService } from "src/mailer/services/mailer.service";
import { UsersRepository } from "src/users/repository/users.repository";
import { UsersService } from "src/users/services/users.service";

describe("UsersService (TI)", () => {
  let module: TestingModule;
  let service: UsersService;
  let mockRepository: jest.Mocked<UsersRepository>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendAlreadyExistsEmail: jest.fn(),
            registerEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    mockRepository = module.get(UsersRepository);
  });

  beforeEach(() => jest.clearAllMocks());

  it("should return mapped user when found by email", async () => {
    const user = {
      id: "u1",
      email: "x@y.com",
      password: "secret",
      firstName: "A",
      lastName: "B",
      confirmedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.findByEmail.mockResolvedValue(user);

    const result = await service.findByEmail("x@y.com");

    expect(mockRepository.findByEmail).toHaveBeenCalledWith("x@y.com");
    expect(result).toEqual({
      id: "u1",
      email: "x@y.com",
      firstName: "A",
      lastName: "B",
      confirmedAt: expect.any(Date),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
    expect(result).not.toHaveProperty("password");
  });

  it("should return null when not found by email", async () => {
    mockRepository.findByEmail.mockResolvedValue(null);

    const result = await service.findByEmail("no@one.com");

    expect(result).toBeNull();
  });

  it("should throw NotFoundException when user not found by id", async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(service.findById("nonexistent")).rejects.toThrow(
      new NotFoundException("The user with the given ID was not found."),
    );
  });

  it("should return user with password when findByEmailWithPassword", async () => {
    const user = {
      id: "u1",
      email: "x@y.com",
      password: "hashed",
      firstName: "A",
      lastName: "B",
      confirmedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.findByEmail.mockResolvedValue(user);

    const result = await service.findByEmailWithPassword("x@y.com");

    expect(result).toHaveProperty("password");
    expect(result?.password).toBe("hashed");
  });
});
