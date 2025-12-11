import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";

import { MailerAlreadyExistUsecase } from "../../../src/mailer/usecase/mailer.usecase.already-exist";
import { MailerUsecaseConfirmEmail } from "../../../src/mailer/usecase/mailer.usecase.confirm-email";
import { UserEntity } from "../../../src/users/entities/user.entity";
import { UserPasswordDoesntMatchException } from "../../../src/users/exceptions/user.password-doesnt-match.exception";
import { UserUsecaseCreate } from "../../../src/users/usecases/user.usecase.create";
import { UserUsecaseFind } from "../../../src/users/usecases/user.usecase.find-by";
import { UsersUsecaseRegister } from "../../../src/users/usecases/users.usecase.register";

jest.mock("bcrypt");

describe("UsersUsecaseRegister TI", () => {
  let usecase: UsersUsecaseRegister;
  let mockUserUsecaseFind: jest.Mocked<UserUsecaseFind>;
  let mockUserUsecaseCreate: jest.Mocked<UserUsecaseCreate>;
  let mockMailerAlreadyExist: jest.Mocked<MailerAlreadyExistUsecase>;
  let mockMailerConfirm: jest.Mocked<MailerUsecaseConfirmEmail>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersUsecaseRegister,
        {
          provide: UserUsecaseFind,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: UserUsecaseCreate,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: MailerAlreadyExistUsecase,
          useValue: {
            sendAlreadyExistsEmail: jest.fn(),
          },
        },
        {
          provide: MailerUsecaseConfirmEmail,
          useValue: {
            registerEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    usecase = module.get<UsersUsecaseRegister>(UsersUsecaseRegister);
    mockUserUsecaseFind = module.get(UserUsecaseFind);
    mockUserUsecaseCreate = module.get(UserUsecaseCreate);
    mockMailerAlreadyExist = module.get(MailerAlreadyExistUsecase);
    mockMailerConfirm = module.get(MailerUsecaseConfirmEmail);

    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("execute", () => {
    const validDto = {
      email: "test@example.com",
      password: "Password123!",
      confirmedPassword: "Password123!",
      firstName: "John",
      lastName: "Doe",
    };

    it("devrait lever une exception si les mots de passe ne correspondent pas", async () => {
      const dto = {
        ...validDto,
        confirmedPassword: "DifferentPassword123!",
      };

      await expect(usecase.execute(dto)).rejects.toThrow(UserPasswordDoesntMatchException);

      expect(mockUserUsecaseFind.findByEmail).not.toHaveBeenCalled();
      expect(mockUserUsecaseCreate.create).not.toHaveBeenCalled();
    });

    it("devrait envoyer un email 'already exists' si l'utilisateur existe déjà", async () => {
      mockUserUsecaseFind.findByEmail.mockResolvedValue({
        id: "existing-user-id",
        email: validDto.email,
        firstName: "Existing",
        lastName: "User",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await usecase.execute(validDto);

      expect(mockUserUsecaseFind.findByEmail).toHaveBeenCalledWith(validDto.email);
      expect(mockMailerAlreadyExist.sendAlreadyExistsEmail).toHaveBeenCalledWith(validDto.email);
      expect(mockUserUsecaseCreate.create).not.toHaveBeenCalled();
      expect(mockMailerConfirm.registerEmail).not.toHaveBeenCalled();
    });

    it("devrait créer un utilisateur et envoyer un email de confirmation si l'utilisateur n'existe pas", async () => {
      mockUserUsecaseFind.findByEmail.mockResolvedValue(null);
      const createdUser = {
        id: "new-user-id",
        email: validDto.email,
        firstName: validDto.firstName,
        lastName: validDto.lastName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUserUsecaseCreate.create.mockResolvedValue(createdUser);
      mockMailerConfirm.registerEmail.mockResolvedValue();

      await usecase.execute(validDto);

      expect(mockUserUsecaseFind.findByEmail).toHaveBeenCalledWith(validDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(validDto.password, 10);
      expect(mockUserUsecaseCreate.create).toHaveBeenCalledWith({
        email: validDto.email,
        password: "hashedPassword123",
        firstName: validDto.firstName,
        lastName: validDto.lastName,
      });
      expect(mockMailerConfirm.registerEmail).toHaveBeenCalledWith(validDto.email);
      expect(mockMailerAlreadyExist.sendAlreadyExistsEmail).not.toHaveBeenCalled();
    });

    it("devrait lever une erreur si la création de l'utilisateur échoue", async () => {
      mockUserUsecaseFind.findByEmail.mockResolvedValue(null);
      const error = new Error("Database error");
      mockUserUsecaseCreate.create.mockResolvedValue(error as unknown as UserEntity);

      await expect(usecase.execute(validDto)).rejects.toThrow("Error creating user");

      expect(mockMailerConfirm.registerEmail).not.toHaveBeenCalled();
    });

    it("devrait hasher le mot de passe avec bcrypt", async () => {
      mockUserUsecaseFind.findByEmail.mockResolvedValue(null);
      mockUserUsecaseCreate.create.mockResolvedValue({
        id: "new-user-id",
        email: validDto.email,
        firstName: validDto.firstName,
        lastName: validDto.lastName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await usecase.execute(validDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(validDto.password, 10);
      expect(mockUserUsecaseCreate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: "hashedPassword123",
        }),
      );
    });
  });
});
