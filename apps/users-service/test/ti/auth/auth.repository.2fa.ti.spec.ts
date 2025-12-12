import { Test, TestingModule } from "@nestjs/testing";
import Redis from "ioredis";

import { AuthRepository } from "../../../src/auth/repository/auth.repository";
import { PrismaService } from "../../../src/prisma/prisma.service";

describe("AuthRepository - 2FA (TI)", () => {
  let repository: AuthRepository;
  let mockRedis: jest.Mocked<Redis>;

  beforeEach(async () => {
    mockRedis = {
      setex: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    } as unknown as jest.Mocked<Redis>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepository,
        {
          provide: Redis,
          useValue: mockRedis,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    repository = module.get<AuthRepository>(AuthRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("store2FACode", () => {
    it("devrait stocker le code dans Redis avec TTL", async () => {
      const userId = "user-id-123";
      const code = "12345678";

      await repository.store2FACode(userId, code);

      expect(mockRedis.setex).toHaveBeenCalledWith(`2fa:${userId}`, 600, code);
    });
  });

  describe("get2FACode", () => {
    it("devrait récupérer le code depuis Redis", async () => {
      const userId = "user-id-123";
      const storedCode = "87654321";

      mockRedis.get.mockResolvedValue(storedCode);

      const code = await repository.get2FACode(userId);

      expect(code).toBe(storedCode);
      expect(mockRedis.get).toHaveBeenCalledWith(`2fa:${userId}`);
    });

    it("devrait retourner null si le code n'existe pas", async () => {
      const userId = "user-id-123";

      mockRedis.get.mockResolvedValue(null);

      const code = await repository.get2FACode(userId);

      expect(code).toBeNull();
    });
  });

  describe("delete2FACode", () => {
    it("devrait supprimer le code de Redis", async () => {
      const userId = "user-id-123";

      await repository.delete2FACode(userId);

      expect(mockRedis.del).toHaveBeenCalledWith(`2fa:${userId}`);
    });
  });
});
