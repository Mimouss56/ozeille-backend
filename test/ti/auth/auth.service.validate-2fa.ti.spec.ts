import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
// 👈 Ajout de l'import
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "src/auth/services/auth.service";
import { MailerService } from "src/mailer/services/mailer.service";
import { RedisService } from "src/redis/redis.module";
import { UsersService } from "src/users/services/users.service";

describe("AuthService - validate2FA (TI)", () => {
  let service: AuthService;
  let mockUsersService: jest.Mocked<UsersService>;
  let mockRedisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {},
        },
        {
          provide: RedisService,
          useValue: {
            getWithPrefix: jest.fn(),
            delWithPrefix: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue("mocked_token_string"),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockUsersService = module.get(UsersService);
    mockRedisService = module.get(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("devrait être défini", () => {
    expect(service).toBeDefined();
  });

  it("devrait valider le 2FA avec succès", async () => {
    const mockDto = { tempToken: "temp-token", code: "12345678" };
    const userId = "user-id-123";
    const mockUser = {
      id: userId,
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      createdAt: new Date(),
      updatedAt: new Date(),
      // Ajout de propriétés si votre User entity en a d'autres obligatoires
      password: "hashed_password",
      confirmedAt: new Date(),
    };

    // 1. Mock pour récupérer l'ID user via le tempToken
    mockRedisService.getWithPrefix.mockResolvedValueOnce(userId);
    // 2. Mock pour récupérer le code 2FA stocké
    mockRedisService.getWithPrefix.mockResolvedValueOnce("12345678");

    // 3. Mock pour trouver l'utilisateur
    mockUsersService.findById.mockResolvedValue(mockUser);

    const result = await service.validate2FA(mockDto);

    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
    // On s'attend à ce que les clés Redis (code + tempToken) soient supprimées
    expect(mockRedisService.delWithPrefix).toHaveBeenCalledTimes(2);
  });

  it("devrait échouer si le tempToken est invalide", async () => {
    const mockDto = { tempToken: "invalid-token", code: "12345678" };

    // Le tempToken n'est pas trouvé dans Redis
    mockRedisService.getWithPrefix.mockResolvedValue(null);

    await expect(service.validate2FA(mockDto)).rejects.toThrow(UnauthorizedException);
    await expect(service.validate2FA(mockDto)).rejects.toThrow("Token temporaire invalide ou expiré");
  });

  it("devrait échouer si le code 2FA est incorrect", async () => {
    const mockDto = { tempToken: "temp-token", code: "99999999" }; // Mauvais code
    const userId = "user-id-123";

    // 1. TempToken valide
    mockRedisService.getWithPrefix.mockResolvedValueOnce(userId);
    // 2. Code stocké différent du code envoyé
    mockRedisService.getWithPrefix.mockResolvedValueOnce("12345678");

    await expect(service.validate2FA(mockDto)).rejects.toThrow(UnauthorizedException);
  });

  it("devrait échouer si le code 2FA est expiré", async () => {
    const mockDto = { tempToken: "temp-token", code: "12345678" };
    const userId = "user-id-123";

    // 1. TempToken valide
    mockRedisService.getWithPrefix.mockResolvedValueOnce(userId);
    // 2. Code introuvable (expiré)
    mockRedisService.getWithPrefix.mockResolvedValueOnce(null);

    await expect(service.validate2FA(mockDto)).rejects.toThrow(UnauthorizedException);
  });
});
