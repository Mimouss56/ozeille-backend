import { UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { MailerService } from "src/mailer/services/mailer.service";
import { UsersService } from "src/users/services/users.service";

import { AuthRepository } from "../../../src/auth/repository/auth.repository";
import { AuthService } from "../../../src/auth/services/auth.service";

jest.mock("bcrypt");

describe("AuthService - validateCredentials (TI)", () => {
  let service: AuthService;
  let mockUsersService: jest.Mocked<UsersService>;
  let mockMailerService: jest.Mocked<MailerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: {
            store2FACode: jest.fn(),
            storeTempToken: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmailWithPassword: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            registerEmail: jest.fn(),
            send2FACode: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockUsersService = module.get(UsersService);
    mockMailerService = module.get(MailerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const validEmail = "test@example.com";
  const validPassword = "Password123!";
  const hashedPassword = "hashedPassword123";

  it("devrait valider les credentials et retourner le userId", async () => {
    const mockUser = {
      id: "user-id-123",
      email: validEmail,
      password: hashedPassword,
      firstName: "John",
      lastName: "Doe",
      confirmedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    // Call private method through login (which uses validateCredentials internally)
    // Or we can test the login method directly
    await expect(service["validateCredentials"](validEmail, validPassword)).resolves.toEqual({ userId: "user-id-123" });

    expect(mockUsersService.findByEmailWithPassword).toHaveBeenCalledWith(validEmail);
    expect(bcrypt.compare).toHaveBeenCalledWith(validPassword, hashedPassword);
  });

  it("devrait lever une UnauthorizedException si l'utilisateur n'existe pas", async () => {
    mockUsersService.findByEmailWithPassword.mockResolvedValue(null);

    await expect(service["validateCredentials"](validEmail, validPassword)).rejects.toThrow(
      new UnauthorizedException("Email ou mot de passe incorrect"),
    );

    expect(mockUsersService.findByEmailWithPassword).toHaveBeenCalledWith(validEmail);
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it("devrait lever une UnauthorizedException si l'email n'est pas confirmé", async () => {
    const mockUser = {
      id: "user-id-123",
      email: validEmail,
      password: hashedPassword,
      firstName: "John",
      lastName: "Doe",
      confirmedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);

    await expect(service["validateCredentials"](validEmail, validPassword)).rejects.toThrow(UnauthorizedException);

    expect(mockUsersService.findByEmailWithPassword).toHaveBeenCalledWith(validEmail);
    expect(mockMailerService.registerEmail).toHaveBeenCalledWith(validEmail);
  });

  it("devrait lever une UnauthorizedException si le mot de passe est incorrect", async () => {
    const mockUser = {
      id: "user-id-123",
      email: validEmail,
      password: hashedPassword,
      firstName: "John",
      lastName: "Doe",
      confirmedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service["validateCredentials"](validEmail, validPassword)).rejects.toThrow(
      new UnauthorizedException("Email ou mot de passe incorrect"),
    );

    expect(mockUsersService.findByEmailWithPassword).toHaveBeenCalledWith(validEmail);
    expect(bcrypt.compare).toHaveBeenCalledWith(validPassword, hashedPassword);
  });
});
