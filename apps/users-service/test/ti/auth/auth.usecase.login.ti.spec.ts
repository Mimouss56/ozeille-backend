import { UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { MailerUsecaseConfirmEmail } from "src/mailer/usecase/mailer.usecase.confirm-email";
import { MailerUsecaseSendMail } from "src/mailer/usecase/mailer.usecase.send-mail";
import { UserUsecaseFind } from "src/users/usecases/user.usecase.find-by";

import { AuthUsecaseLogin } from "../../../src/auth/usecases/auth.usecase.login";

jest.mock("bcrypt");

describe("AuthUsecaseLogin TI", () => {
  let usecase: AuthUsecaseLogin;
  let mockUserUsecaseFind: jest.Mocked<UserUsecaseFind>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthUsecaseLogin,
        MailerUsecaseSendMail,
        {
          provide: UserUsecaseFind,
          useValue: {
            findByEmail: jest.fn(),
            findByEmailWithPassword: jest.fn(),
          },
        },
        MailerUsecaseConfirmEmail,
      ],
    }).compile();

    usecase = module.get<AuthUsecaseLogin>(AuthUsecaseLogin);
    mockUserUsecaseFind = module.get(UserUsecaseFind);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("validateCredentials", () => {
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

      mockUserUsecaseFind.findByEmailWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await usecase.validateCredentials(validEmail, validPassword);

      expect(result).toEqual({ userId: "user-id-123" });
      expect(mockUserUsecaseFind.findByEmailWithPassword).toHaveBeenCalledWith(validEmail);
      expect(bcrypt.compare).toHaveBeenCalledWith(validPassword, hashedPassword);
    });

    it("devrait lever une UnauthorizedException si l'utilisateur n'existe pas", async () => {
      mockUserUsecaseFind.findByEmailWithPassword.mockResolvedValue(null);

      await expect(usecase.validateCredentials(validEmail, validPassword)).rejects.toThrow(
        new UnauthorizedException("Email ou mot de passe incorrect"),
      );

      expect(mockUserUsecaseFind.findByEmailWithPassword).toHaveBeenCalledWith(validEmail);
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

      mockUserUsecaseFind.findByEmailWithPassword.mockResolvedValue(mockUser);

      await expect(usecase.validateCredentials(validEmail, validPassword)).rejects.toThrow(
        new UnauthorizedException("Email non confirmé"),
      );

      expect(mockUserUsecaseFind.findByEmailWithPassword).toHaveBeenCalledWith(validEmail);
      expect(bcrypt.compare).not.toHaveBeenCalled();
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

      mockUserUsecaseFind.findByEmailWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(usecase.validateCredentials(validEmail, validPassword)).rejects.toThrow(
        new UnauthorizedException("Email ou mot de passe incorrect"),
      );

      expect(mockUserUsecaseFind.findByEmailWithPassword).toHaveBeenCalledWith(validEmail);
      expect(bcrypt.compare).toHaveBeenCalledWith(validPassword, hashedPassword);
    });
  });
});
