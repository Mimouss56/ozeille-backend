import { Test, TestingModule } from "@nestjs/testing";
import { MailerAlreadyExistUsecase } from "src/mailer/usecase/mailer.usecase.already-exist";
import { MailerUsecaseConfirmEmail } from "src/mailer/usecase/mailer.usecase.confirm-email";
import { UserPasswordDoesntMatchException } from "src/users/exceptions/user.password-doesnt-match.exception";
import { UserUsecaseCreate } from "src/users/usecases/user.usecase.create";
import { UserUsecaseFind } from "src/users/usecases/user.usecase.find-by";
import { UsersUsecaseRegister } from "src/users/usecases/users.usecase.register";

jest.mock("bcrypt", () => ({ hash: jest.fn(() => Promise.resolve("hashed")) }));

describe("UsersUsecaseRegister (TI)", () => {
  let module: TestingModule;
  let usecase: UsersUsecaseRegister;
  const mockFind = { findByEmail: jest.fn() };
  const mockCreate = { create: jest.fn() };
  const mockMailerAlready = { sendAlreadyExistsEmail: jest.fn() };
  const mockMailerConfirm = { sendConfirmationEmail: jest.fn() };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        UsersUsecaseRegister,
        { provide: UserUsecaseFind, useValue: mockFind },
        { provide: UserUsecaseCreate, useValue: mockCreate },
        { provide: MailerAlreadyExistUsecase, useValue: mockMailerAlready },
        { provide: MailerUsecaseConfirmEmail, useValue: mockMailerConfirm },
      ],
    }).compile();

    // get the usecase (Nest will resolve by token; direct class retrieval works because we provided it)
    usecase = module.get<UsersUsecaseRegister>(UsersUsecaseRegister);
  });

  beforeEach(() => jest.clearAllMocks());

  it("should throw when passwords do not match", async () => {
    const dto = {
      email: "a@b.com",
      password: "p1",
      confirmedPassword: "p2",
      firstName: "F",
      lastName: "L",
    };

    await expect(usecase.execute(dto)).rejects.toBeInstanceOf(UserPasswordDoesntMatchException);
  });

  it("should send already exists email when user found", async () => {
    mockFind.findByEmail.mockResolvedValue({ id: "u1", email: "a@b.com" });

    const dto1 = {
      email: "a@b.com",
      password: "p",
      confirmedPassword: "p",
      firstName: "F",
      lastName: "L",
    };

    await usecase.execute(dto1);

    expect(mockFind.findByEmail).toHaveBeenCalledWith("a@b.com");
    expect(mockMailerAlready.sendAlreadyExistsEmail).toHaveBeenCalledWith("a@b.com");
    expect(mockCreate.create).not.toHaveBeenCalled();
  });

  it("should hash, create and send confirmation when user does not exist", async () => {
    mockFind.findByEmail.mockResolvedValue(null);
    mockCreate.create.mockResolvedValue({ id: "u2", email: "new@u.com" });

    const dto2 = {
      email: "new@u.com",
      password: "p",
      confirmedPassword: "p",
      firstName: "F",
      lastName: "L",
    };

    await usecase.execute(dto2);

    expect(mockFind.findByEmail).toHaveBeenCalledWith("new@u.com");
    expect(mockCreate.create).toHaveBeenCalledWith(expect.objectContaining({ email: "new@u.com" }));
    expect(mockMailerConfirm.sendConfirmationEmail).toHaveBeenCalledWith(expect.objectContaining({ id: "u2" }));
  });
});
