import { UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthRepository } from "src/auth/repository/auth.repository";
import { AuthService } from "src/auth/services/auth.service";
import { MailerService } from "src/mailer/services/mailer.service";
import { UsersService } from "src/users/services/users.service";

describe("AuthService - validate2FA (TI)", () => {
  let service: AuthService;
  let mockAuthRepository: jest.Mocked<AuthRepository>;
  let mockUsersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: {
            getUserIdFromTempToken: jest.fn(),
            get2FACode: jest.fn(),
            delete2FACode: jest.fn(),
            deleteTempToken: jest.fn(),
          },
        },
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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockAuthRepository = module.get(AuthRepository);
    mockUsersService = module.get(UsersService);
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

    mockAuthRepository.getUserIdFromTempToken.mockResolvedValue(userId);
    mockAuthRepository.get2FACode.mockResolvedValue("12345678");
    mockUsersService.findById.mockResolvedValue(mockUser);

    const result = await service.validate2FA(mockDto);

    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
    expect(mockAuthRepository.delete2FACode).toHaveBeenCalledWith(userId);
    expect(mockAuthRepository.deleteTempToken).toHaveBeenCalledWith(mockDto.tempToken);
  });

  it("devrait échouer si le tempToken est invalide", async () => {
    const mockDto = { tempToken: "invalid-token", code: "12345678" };

    mockAuthRepository.getUserIdFromTempToken.mockResolvedValue(null);

    await expect(service.validate2FA(mockDto)).rejects.toThrow(UnauthorizedException);
    await expect(service.validate2FA(mockDto)).rejects.toThrow("Token temporaire invalide ou expiré");
  });

  it("devrait échouer si le code 2FA est incorrect", async () => {
    const mockDto = { tempToken: "temp-token", code: "99999999" };
    const userId = "user-id-123";

    mockAuthRepository.getUserIdFromTempToken.mockResolvedValue(userId);
    mockAuthRepository.get2FACode.mockResolvedValue("12345678");

    await expect(service.validate2FA(mockDto)).rejects.toThrow(UnauthorizedException);
    await expect(service.validate2FA(mockDto)).rejects.toThrow("Code de vérification invalide ou expiré");
  });

  it("devrait échouer si le code 2FA est expiré", async () => {
    const mockDto = { tempToken: "temp-token", code: "12345678" };
    const userId = "user-id-123";

    mockAuthRepository.getUserIdFromTempToken.mockResolvedValue(userId);
    mockAuthRepository.get2FACode.mockResolvedValue(null);

    await expect(service.validate2FA(mockDto)).rejects.toThrow(UnauthorizedException);
    await expect(service.validate2FA(mockDto)).rejects.toThrow("Code de vérification invalide ou expiré");
  });
});
