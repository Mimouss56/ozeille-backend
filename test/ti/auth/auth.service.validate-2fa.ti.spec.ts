import { UnauthorizedException } from "@nestjs/common";
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
    };

    // Mock pour getTempToken
    mockRedisService.getWithPrefix.mockResolvedValueOnce(userId);
    // Mock pour get2FACode
    mockRedisService.getWithPrefix.mockResolvedValueOnce("12345678");
    mockUsersService.findById.mockResolvedValue(mockUser);

    const result = await service.validate2FA(mockDto);

    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
    expect(mockRedisService.delWithPrefix).toHaveBeenCalledTimes(2);
  });

  it("devrait échouer si le tempToken est invalide", async () => {
    const mockDto = { tempToken: "invalid-token", code: "12345678" };

    mockRedisService.getWithPrefix.mockResolvedValue(null);

    await expect(service.validate2FA(mockDto)).rejects.toThrow(UnauthorizedException);
    await expect(service.validate2FA(mockDto)).rejects.toThrow("Token temporaire invalide ou expiré");
  });

  it("devrait échouer si le code 2FA est incorrect", async () => {
    const mockDto = { tempToken: "temp-token", code: "99999999" };
    const userId = "user-id-123";

    // Mock pour getTempToken - doit réussir cette fois
    mockRedisService.getWithPrefix.mockResolvedValueOnce(userId).mockResolvedValueOnce("12345678");

    await expect(service.validate2FA(mockDto)).rejects.toThrow(UnauthorizedException);
  });

  it("devrait échouer si le code 2FA est expiré", async () => {
    const mockDto = { tempToken: "temp-token", code: "12345678" };
    const userId = "user-id-123";

    // Mock pour getTempToken - doit réussir
    mockRedisService.getWithPrefix.mockResolvedValueOnce(userId).mockResolvedValueOnce(null);

    await expect(service.validate2FA(mockDto)).rejects.toThrow(UnauthorizedException);
  });
});
