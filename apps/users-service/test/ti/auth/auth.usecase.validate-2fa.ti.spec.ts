import { UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthUsecase2FA } from "src/auth/usecases/auth.usecase.2fa";
import { AuthUsecaseJWT } from "src/auth/usecases/auth.usecase.jwt";
import { AuthUsecaseTempToken } from "src/auth/usecases/auth.usecase.temp-token";
import { AuthUsecaseValidate2FA } from "src/auth/usecases/auth.usecase.validate-2fa";
import { RedisModule } from "src/redis/redis.module";
import { UserUsecaseFind } from "src/users/usecases/user.usecase.find-by";

describe("AuthUsecaseValidate2FA (TI)", () => {
  let authUsecaseValidate2FA: AuthUsecaseValidate2FA;
  let authUsecase2FA: AuthUsecase2FA;
  let authUsecaseTempToken: AuthUsecaseTempToken;
  let mockUserUsecaseFind: jest.Mocked<UserUsecaseFind>;

  const userId = "test-user-id-123";
  const email = "test@example.com";
  const mockUser = {
    id: userId,
    email: email,
    firstName: "Test",
    lastName: "User",
    password: "hashed-password",
    confirmedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockUserUsecaseFind = {
      findOne: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
    } as unknown as jest.Mocked<UserUsecaseFind>;

    const module: TestingModule = await Test.createTestingModule({
      imports: [RedisModule],
      providers: [
        AuthUsecase2FA,
        AuthUsecaseTempToken,
        AuthUsecaseJWT,
        AuthUsecaseValidate2FA,
        {
          provide: UserUsecaseFind,
          useValue: mockUserUsecaseFind,
        },
      ],
    }).compile();

    authUsecaseValidate2FA = module.get<AuthUsecaseValidate2FA>(AuthUsecaseValidate2FA);
    authUsecase2FA = module.get<AuthUsecase2FA>(AuthUsecase2FA);
    authUsecaseTempToken = module.get<AuthUsecaseTempToken>(AuthUsecaseTempToken);
  });

  describe("validate", () => {
    it("devrait valider avec succès le tempToken et le code 2FA et retourner les tokens JWT", async () => {
      // Générer un tempToken et un code 2FA
      const tempToken = await authUsecaseTempToken.generateAndStoreTempToken(userId);
      const code = await authUsecase2FA.generateAndStore2FACode(userId);

      // Mock findOne pour retourner l'utilisateur
      mockUserUsecaseFind.findOne.mockResolvedValue(mockUser);

      // Valider
      const result = await authUsecaseValidate2FA.validate(tempToken, code);

      // Vérifier le résultat
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(typeof result.accessToken).toBe("string");
      expect(typeof result.refreshToken).toBe("string");
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();

      // Vérifier que findOne a été appelé avec le bon userId
      expect(mockUserUsecaseFind.findOne).toHaveBeenCalledWith({ id: userId });

      // Vérifier que le tempToken a été supprimé
      const userIdFromToken = await authUsecaseTempToken.getUserIdFromTempToken(tempToken);
      expect(userIdFromToken).toBeNull();
    });

    it("devrait échouer si le tempToken est invalide", async () => {
      const invalidToken = "tmp_invalid_token_12345";
      const code = "12345678";

      await expect(authUsecaseValidate2FA.validate(invalidToken, code)).rejects.toThrow(UnauthorizedException);
      await expect(authUsecaseValidate2FA.validate(invalidToken, code)).rejects.toThrow(
        "Token temporaire invalide ou expiré",
      );
    });

    it("devrait échouer si le tempToken est expiré", async () => {
      // Ce test est difficile à simuler sans manipuler le temps
      // On peut le simuler en supprimant manuellement le token
      const tempToken = await authUsecaseTempToken.generateAndStoreTempToken(userId);
      await authUsecaseTempToken.deleteTempToken(tempToken);

      const code = "12345678";

      await expect(authUsecaseValidate2FA.validate(tempToken, code)).rejects.toThrow(UnauthorizedException);
      await expect(authUsecaseValidate2FA.validate(tempToken, code)).rejects.toThrow(
        "Token temporaire invalide ou expiré",
      );
    });

    it("devrait échouer si le code 2FA est invalide", async () => {
      const tempToken = await authUsecaseTempToken.generateAndStoreTempToken(userId);
      await authUsecase2FA.generateAndStore2FACode(userId);
      const invalidCode = "00000000";

      // Mock findOne pour retourner l'utilisateur
      mockUserUsecaseFind.findOne.mockResolvedValue(mockUser);

      await expect(authUsecaseValidate2FA.validate(tempToken, invalidCode)).rejects.toThrow(UnauthorizedException);
      await expect(authUsecaseValidate2FA.validate(tempToken, invalidCode)).rejects.toThrow(
        "Code de vérification invalide ou expiré",
      );
    });

    it("devrait échouer si l'utilisateur n'existe pas en base de données", async () => {
      const tempToken = await authUsecaseTempToken.generateAndStoreTempToken(userId);
      const code = await authUsecase2FA.generateAndStore2FACode(userId);

      // Mock findOne pour retourner null (utilisateur supprimé entre-temps)
      // Ce scénario représente une corruption de données où le userId existe dans Redis mais pas en BDD
      mockUserUsecaseFind.findOne.mockResolvedValue(null);

      // La vérification du code 2FA devrait passer, mais l'utilisateur introuvable
      const promise = authUsecaseValidate2FA.validate(tempToken, code);

      await expect(promise).rejects.toThrow(UnauthorizedException);
      await expect(promise).rejects.toThrow("Utilisateur non trouvé");
    });

    it("ne devrait pas permettre la réutilisation d'un tempToken", async () => {
      const tempToken = await authUsecaseTempToken.generateAndStoreTempToken(userId);
      const code = await authUsecase2FA.generateAndStore2FACode(userId);

      // Mock findOne pour retourner l'utilisateur
      mockUserUsecaseFind.findOne.mockResolvedValue(mockUser);

      // Première validation réussie
      await authUsecaseValidate2FA.validate(tempToken, code);

      // Essayer de réutiliser le même tempToken
      await expect(authUsecaseValidate2FA.validate(tempToken, code)).rejects.toThrow(UnauthorizedException);
      await expect(authUsecaseValidate2FA.validate(tempToken, code)).rejects.toThrow(
        "Token temporaire invalide ou expiré",
      );
    });
  });
});
