import { Body, Controller, Post } from "@nestjs/common";
import { ZodSerializerDto } from "nestjs-zod";

import { CreateUserDto } from "./dto/create-user.dto";
import { UsersUsecaseRegister } from "./usecases/users.usecase.register";

@Controller("users")
export class UsersController {
  constructor(private readonly usersUsecaseRegister: UsersUsecaseRegister) {}

  @Post("/api/register")
  @ZodSerializerDto(CreateUserDto)
  register(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.usersUsecaseRegister.register(createUserDto);
  }
}
