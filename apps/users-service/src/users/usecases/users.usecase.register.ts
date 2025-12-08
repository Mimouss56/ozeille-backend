import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";

import { CreateUserDto } from "../dto/create-user.dto";
import { UserUsecaseCreate } from "./user.usecase.create";
import { UserUsecaseFind } from "./user.usecase.find-by";

@Injectable()
export class UsersUsecaseRegister {
  constructor(
    private readonly userUsecaseFind: UserUsecaseFind,
    private readonly userUsecaseCreate: UserUsecaseCreate,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<void> {
    if (createUserDto.password !== createUserDto.confirmedPassword) {
      throw new Error("Passwords do not match");
    }

    const user = await this.userUsecaseFind.findByEmail(createUserDto.email);
    if (user) {
      // service mailer envois email de compte déja existant
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
  }
}
