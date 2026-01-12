import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { MailerService } from "src/mailer/services/mailer.service";

import { CreateUserDto } from "../dto/create-user.dto";
import { UserEntity } from "../entities/user.entity";
import { UserPasswordDoesntMatchException } from "../exceptions/user.password-doesnt-match.exception";
import { UsersRepository } from "../repository/users.repository";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly repository: UsersRepository,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * Register a new user with email confirmation
   */
  async register(createUserDto: CreateUserDto): Promise<void> {
    if (createUserDto.password !== createUserDto.confirmedPassword) {
      throw new UserPasswordDoesntMatchException();
    }
    const existingUser = await this.repository.findByEmail(createUserDto.email);
    if (existingUser) {
      await this.mailerService.sendAlreadyExistsEmail(createUserDto.email);
      return;
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user in database
    const userCreated = await this.repository.create({
      email: createUserDto.email,
      password: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
    });

    // Send confirmation email
    await this.mailerService.registerEmail(userCreated.email, userCreated.firstName);
  }

  /**
   * Find a user by email without password
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.repository.findByEmail(email);
    if (!user) {
      return null;
    }
    return this.mapToUserEntity(user);
  }

  /**
   * Find a user by email with password (for authentication)
   */
  async findByEmailWithPassword(email: string): Promise<(UserEntity & { password: string }) | null> {
    return this.repository.findByEmail(email);
  }

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<UserEntity> {
    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException("The user with the given ID was not found.");
    }
    return this.mapToUserEntity(user);
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await this.repository.update(userId, { password: hashedPassword });
  }

  async confirmUserEmail(userId: string): Promise<void> {
    await this.repository.update(userId, { confirmedAt: new Date() });
  }

  /**
   * Map User to UserEntity (without password)
   */
  private mapToUserEntity(user: UserEntity & { password?: string }): UserEntity {
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
