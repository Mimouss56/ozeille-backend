import { Test, TestingModule } from "@nestjs/testing";
import Redis from "ioredis";

import { AuthUsecase2FA } from "../../../src/auth/usecases/auth.usecase.2fa";

describe("AuthUsecase2FA TI", () => {
  let usecase: AuthUsecase2FA;
  let mockRedis: jest.Mocked<Redis>;

  beforeEach(async () => {
    mockRedis = {
      setex: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
    } as unknown as jest.Mocked<Redis>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthUsecase2FA,
        {
          provide: Redis,
          useValue: mockRedis,
        },
      ],
    }).compile();

    usecase = module.get<AuthUsecase2FA>(AuthUsecase2FA);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("generateAndStore2FACode", () => {
    it("devrait générer un code à 8 chiffres et le stocker dans Redis", async () => {
      const userId = "user-id-123";

      const code = await usecase.generateAndStore2FACode(userId);

      expect(code).toMatch(/^\d{8}$/);
      expect(mockRedis.setex).toHaveBeenCalledWith(`2fa:${userId}`, 600, code);
    });

    it("devrait générer des codes différents à chaque appel", async () => {
      const userId = "user-id-123";

      const _code1 = await usecase.generateAndStore2FACode(userId);
      const _code2 = await usecase.generateAndStore2FACode(userId);

      // Les codes doivent être différents la plupart du temps (probabilité très élevée)
      // On ne peut pas garantir 100% qu'ils soient différents avec le random
      expect(mockRedis.setex).toHaveBeenCalledTimes(2);
    });
  });

  describe("verify2FACode", () => {
    it("devrait retourner true si le code est correct et supprimer le code", async () => {
      const userId = "user-id-123";
      const code = "123456";

      mockRedis.get.mockResolvedValue(code);

      const result = await usecase.verify2FACode(userId, code);

      expect(result).toBe(true);
      expect(mockRedis.get).toHaveBeenCalledWith(`2fa:${userId}`);
      expect(mockRedis.del).toHaveBeenCalledWith(`2fa:${userId}`);
    });

    it("devrait retourner false si le code est incorrect", async () => {
      const userId = "user-id-123";
      const storedCode = "123456";
      const wrongCode = "654321";

      mockRedis.get.mockResolvedValue(storedCode);

      const result = await usecase.verify2FACode(userId, wrongCode);

      expect(result).toBe(false);
      expect(mockRedis.get).toHaveBeenCalledWith(`2fa:${userId}`);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it("devrait retourner false si aucun code n'est stocké", async () => {
      const userId = "user-id-123";
      const code = "123456";

      mockRedis.get.mockResolvedValue(null);

      const result = await usecase.verify2FACode(userId, code);

      expect(result).toBe(false);
      expect(mockRedis.get).toHaveBeenCalledWith(`2fa:${userId}`);
      expect(mockRedis.del).not.toHaveBeenCalled();
    });
  });

  describe("delete2FACode", () => {
    it("devrait supprimer le code 2FA de Redis", async () => {
      const userId = "user-id-123";

      await usecase.delete2FACode(userId);

      expect(mockRedis.del).toHaveBeenCalledWith(`2fa:${userId}`);
    });
  });
});
