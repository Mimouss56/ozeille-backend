import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { MailerService } from "src/mailer/services/mailer.service";

import { CreateUserDto } from "../../../src/users/dto/create-user.dto";
import { UserPasswordDoesntMatchException } from "../../../src/users/exceptions/user.password-doesnt-match.exception";
import { UsersRepository } from "../../../src/users/repository/users.repository";
import { UsersService } from "../../../src/users/services/users.service";

jest.mock("bcrypt");

describe("UsersService - register (TI)", () => {
  let service: UsersService;
  let mockRepository: jest.Mocked<UsersRepository>;
  let mockMailerService: jest.Mocked<MailerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: MailerService,
          useValue: {
            sendAlreadyExistsEmail: jest.fn(),
            registerEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    mockRepository = module.get(UsersRepository);
    mockMailerService = module.get(MailerService);

    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword123");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    const validDto: CreateUserDto = {
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

      await expect(service.register(dto)).rejects.toThrow(UserPasswordDoesntMatchException);

      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("devrait envoyer un email 'already exists' si l'utilisateur existe déjà", async () => {
      mockRepository.findByEmail.mockResolvedValue({
        id: "existing-user-id",
        email: validDto.email,
        password: "hashedPassword",
        firstName: "Existing",
        lastName: "User",
        confirmedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.register(validDto);

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(validDto.email);
      expect(mockMailerService.sendAlreadyExistsEmail).toHaveBeenCalledWith(validDto.email);
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockMailerService.registerEmail).not.toHaveBeenCalled();
    });

    it("devrait créer un utilisateur et envoyer un email de confirmation si l'utilisateur n'existe pas", async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      const createdUser = {
        id: "new-user-id",
        email: validDto.email,
        password: "hashedPassword123",
        firstName: validDto.firstName,
        lastName: validDto.lastName,
        confirmedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.create.mockResolvedValue(createdUser);
      mockMailerService.registerEmail.mockResolvedValue();

      await service.register(validDto);

      expect(mockRepository.findByEmail).toHaveBeenCalledWith(validDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(validDto.password, 10);
      expect(mockRepository.create).toHaveBeenCalledWith({
        email: validDto.email,
        password: "hashedPassword123",
        firstName: validDto.firstName,
        lastName: validDto.lastName,
      });
      expect(mockMailerService.registerEmail).toHaveBeenCalledWith(validDto.email, validDto.firstName);
      expect(mockMailerService.sendAlreadyExistsEmail).not.toHaveBeenCalled();
    });

    it("devrait hasher le mot de passe avec bcrypt", async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({
        id: "new-user-id",
        email: validDto.email,
        password: "hashedPassword123",
        firstName: validDto.firstName,
        lastName: validDto.lastName,
        confirmedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.register(validDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(validDto.password, 10);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: "hashedPassword123",
        }),
      );
    });
  });
});
