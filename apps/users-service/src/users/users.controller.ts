import { Body, Controller, Post } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { ZodSerializerDto } from "nestjs-zod";

import { CreateUserDto } from "./dto/create-user.dto";
import { UsersUsecaseRegister } from "./usecases/users.usecase.register";

@Controller("users")
export class UsersController {
  constructor(private readonly usersUsecaseRegister: UsersUsecaseRegister) {}

  @Post("/api/register")
  @ZodSerializerDto(CreateUserDto)
  @ApiResponse({ status: 201, description: "The user has been successfully registered." })
  @ApiResponse({ status: 204, description: "The user has been successfully registered." })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @ApiResponse({ status: 503, description: "Internal Server Error." })
  register(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.usersUsecaseRegister.register(createUserDto);
  }
}
