import { Injectable } from "@nestjs/common";
import { User } from "src/generated/prisma/client";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersRepository } from "./repository/users.repository";

@Injectable()
export class UsersService {
  constructor(private readonly repository: UsersRepository) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    return this.repository.create(createUserDto);
  }

  findAll(): string {
    return `This action returns all users`;
  }

  findOne(id: number): string {
    return `This action returns a #${id} user`;
  }

  update(id: number, _updateUserDto: UpdateUserDto): string {
    return `This action updates a #${id} user`;
  }

  remove(id: number): string {
    return `This action removes a #${id} user`;
  }
}
