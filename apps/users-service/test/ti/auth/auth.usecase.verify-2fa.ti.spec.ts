import { UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma/prisma.service";
import { UserUsecaseFind } from "src/users/usecases/user.usecase.find-by";

import { AuthUsecase2FA } from "../../../src/auth/usecases/auth.usecase.2fa";
import { AuthUsecaseVerify2FA } from "../../../src/auth/usecases/auth.usecase.verify-2fa";

describe("AuthUsecaseVerify2FA TI", () => {
  let usecase: AuthUsecaseVerify2FA;
  let mockAuthUsecase2FA: jest.Mocked<AuthUsecase2FA>;
  let mockUserUsecaseFind: jest.Mocked<UserUsecaseFind>;

  beforeEach(async () => {
    mockAuthUsecase2FA = {
      verify2FACode: jest.fn(),
      generateAndStore2FACode: jest.fn(),
      delete2FACode: jest.fn(),
    } as unknown as jest.Mocked<AuthUsecase2FA>;

    mockUserUsecaseFind = {
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UserUsecaseFind>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthUsecaseVerify2FA,
        UserUsecaseFind,
        PrismaService,
        {
          provide: AuthUsecase2FA,
          useValue: mockAuthUsecase2FA,
        },
      ],
    }).compile();

    usecase = module.get<AuthUsecaseVerify2FA>(AuthUsecaseVerify2FA);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("verify", () => {
    it("devrait retourner userId et email si le code 2FA est valide", async () => {
      const email = "test@example.com";
      const code = "12345678";
      const mockUser = {
        id: "user-id-123",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        confirmedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserUsecaseFind.findByEmail.mockResolvedValue(mockUser);
      mockAuthUsecase2FA.verify2FACode.mockResolvedValue(true);

      const result = await usecase.verify(email, code);

      expect(result).toEqual({
        userId: mockUser.id,
        email: mockUser.email,
      });
      expect(mockUserUsecaseFind.findByEmail).toHaveBeenCalledWith(email);
      expect(mockAuthUsecase2FA.verify2FACode).toHaveBeenCalledWith(mockUser.id, code);
    });

    it("devrait lever une UnauthorizedException si l'utilisateur n'existe pas", async () => {
      const email = "nonexistent@example.com";
      const code = "12345678";

      mockUserUsecaseFind.findByEmail.mockResolvedValue(null);

      await expect(usecase.verify(email, code)).rejects.toThrow(UnauthorizedException);
      await expect(usecase.verify(email, code)).rejects.toThrow("Email ou code incorrect");

      expect(mockUserUsecaseFind.findByEmail).toHaveBeenCalledWith(email);
      expect(mockAuthUsecase2FA.verify2FACode).not.toHaveBeenCalled();
    });

    it("devrait lever une UnauthorizedException si le code 2FA est invalide", async () => {
      const email = "test@example.com";
      const code = "87654321";
      const mockUser = {
        id: "user-id-123",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        confirmedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserUsecaseFind.findByEmail.mockResolvedValue(mockUser);
      mockAuthUsecase2FA.verify2FACode.mockResolvedValue(false);

      await expect(usecase.verify(email, code)).rejects.toThrow(UnauthorizedException);
      await expect(usecase.verify(email, code)).rejects.toThrow("Code de vérification invalide ou expiré");

      expect(mockUserUsecaseFind.findByEmail).toHaveBeenCalledWith(email);
      expect(mockAuthUsecase2FA.verify2FACode).toHaveBeenCalledWith(mockUser.id, code);
    });

    it("devrait lever une UnauthorizedException si le code 2FA est expiré", async () => {
      const email = "test@example.com";
      const code = "12345678";
      const mockUser = {
        id: "user-id-123",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        confirmedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserUsecaseFind.findByEmail.mockResolvedValue(mockUser);
      mockAuthUsecase2FA.verify2FACode.mockResolvedValue(false); // Expiré = false

      await expect(usecase.verify(email, code)).rejects.toThrow(UnauthorizedException);
      await expect(usecase.verify(email, code)).rejects.toThrow("Code de vérification invalide ou expiré");
    });

    it("devrait gérer les codes avec le bon format (8 chiffres)", async () => {
      const email = "test@example.com";
      const code = "98765432";
      const mockUser = {
        id: "user-id-123",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        confirmedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserUsecaseFind.findByEmail.mockResolvedValue(mockUser);
      mockAuthUsecase2FA.verify2FACode.mockResolvedValue(true);

      const result = await usecase.verify(email, code);

      expect(result).toEqual({
        userId: mockUser.id,
        email: mockUser.email,
      });
      expect(mockAuthUsecase2FA.verify2FACode).toHaveBeenCalledWith(mockUser.id, code);
    });
  });
});
