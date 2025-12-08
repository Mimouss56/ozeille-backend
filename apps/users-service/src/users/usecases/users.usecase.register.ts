import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { MailerAlreadyExistUsecase } from "src/mailer/usecase/mailer.usecase.already-exist";
import { MailerUsecaseConfirmEmail } from "src/mailer/usecase/mailer.usecase.confirm-email";

import { CreateUserDto } from "../dto/create-user.dto";
import { UserPasswordDoesntMatchException } from "../exceptions/user.password-doesnt-match.exception";
import { UserUsecaseCreate } from "./user.usecase.create";
import { UserUsecaseFind } from "./user.usecase.find-by";

@Injectable()
export class UsersUsecaseRegister {
  constructor(
    private readonly userUsecaseFind: UserUsecaseFind,
    private readonly userUsecaseCreate: UserUsecaseCreate,
    private readonly mailerAlreadyExistUsecase: MailerAlreadyExistUsecase,
    private readonly mailerUsecaseConfirmEmail: MailerUsecaseConfirmEmail,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<void> {
    if (createUserDto.password !== createUserDto.confirmedPassword) {
      throw new UserPasswordDoesntMatchException();
    }

    const user = await this.userUsecaseFind.findByEmail(createUserDto.email);
    if (user) {
      // TODO: Generation token dans redis
      await this.mailerAlreadyExistUsecase.sendAlreadyExistsEmail(createUserDto.email);
      return;
    }

    // service de hash password avec bcrypt
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // creer le user en base
    const userCreated = await this.userUsecaseCreate.create({
      email: createUserDto.email,
      password: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
    });
    if (userCreated instanceof Error) {
      throw new Error("Error creating user");
    }

    // service mailer envois email de confirmation
    await this.mailerUsecaseConfirmEmail.sendConfirmationEmail(userCreated.email, userCreated.firstName ?? undefined);
  }
}
