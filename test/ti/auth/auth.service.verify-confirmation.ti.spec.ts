import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { MailerService } from "src/mailer/services/mailer.service";
import { RedisService } from "src/redis/redis.module";
import { UsersService } from "src/users/services/users.service";

import { AuthService } from "../../../src/auth/services/auth.service";

describe("AuthService - verifyConfirmation (TI)", () => {
  let service: AuthService;
  let mockRedisService: jest.Mocked<RedisService>;
  let mockUsersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            confirmUserEmail: jest.fn(),
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
    mockRedisService = module.get(RedisService);
    mockUsersService = module.get(UsersService);
  });

  it("retourne true quand le token existe et la mise à jour réussit", async () => {
    const email = "user@example.com";
    const userId = "user-id-123";
    const mockUser = {
      id: userId,
      email,
      firstName: "Test",
      lastName: "User",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRedisService.getWithPrefix.mockResolvedValue(email);
    mockUsersService.findByEmail.mockResolvedValue(mockUser);
    mockUsersService.confirmUserEmail.mockResolvedValue();

    const result = await service.verifyConfirmation("token123");

    expect(result).toBe(true);
    expect(mockRedisService.getWithPrefix).toHaveBeenCalled();
    expect(mockUsersService.findByEmail).toHaveBeenCalledWith(email);
    expect(mockUsersService.confirmUserEmail).toHaveBeenCalledWith(userId);
    expect(mockRedisService.delWithPrefix).toHaveBeenCalled();
  });

  it("retourne false quand le token est introuvable", async () => {
    mockRedisService.getWithPrefix.mockResolvedValue(null);

    const result = await service.verifyConfirmation("missing");

    expect(result).toBe(false);
    expect(mockUsersService.findByEmail).not.toHaveBeenCalled();
    expect(mockUsersService.confirmUserEmail).not.toHaveBeenCalled();
    expect(mockRedisService.delWithPrefix).not.toHaveBeenCalled();
  });

  it("retourne false quand l'utilisateur n'existe pas", async () => {
    const email = "nonexistent@example.com";
    mockRedisService.getWithPrefix.mockResolvedValue(email);
    mockUsersService.findByEmail.mockResolvedValue(null);

    const result = await service.verifyConfirmation("token-no-user");

    expect(result).toBe(false);
    expect(mockUsersService.confirmUserEmail).not.toHaveBeenCalled();
    expect(mockRedisService.delWithPrefix).not.toHaveBeenCalled();
  });

  it("retourne false quand la mise à jour utilisateur lève une erreur", async () => {
    const email = "user@example.com";
    const userId = "user-id-123";
    const mockUser = {
      id: userId,
      email,
      firstName: "Test",
      lastName: "User",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRedisService.getWithPrefix.mockResolvedValue(email);
    mockUsersService.findByEmail.mockResolvedValue(mockUser);
    mockUsersService.confirmUserEmail.mockRejectedValue(new Error("DB error"));

    const result = await service.verifyConfirmation("token-error");

    expect(result).toBe(false);
    expect(mockRedisService.delWithPrefix).not.toHaveBeenCalled();
  });
});
