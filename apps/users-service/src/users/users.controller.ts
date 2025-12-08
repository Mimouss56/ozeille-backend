import { Body, Controller, Post, UsePipes } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { ZodValidationPipe } from "src/zod-validation/zod-validation.pipe";

import { CreateUserDto } from "./dto/create-user.dto";
import { UsersUsecaseRegister } from "./usecases/users.usecase.register";

@Controller("users")
export class UsersController {
  constructor(private readonly usersUsecaseRegister: UsersUsecaseRegister) {}

  @Post("/api/register")
  @UsePipes(ZodValidationPipe)
  @ApiResponse({ status: 201, description: "The user has been successfully registered." })
  @ApiResponse({ status: 204, description: "The user has been successfully registered." })
  @ApiResponse({ status: 400, description: "Bad Request." })
  @ApiResponse({ status: 503, description: "Internal Server Error." })
  register(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.usersUsecaseRegister.register(createUserDto);
  }
}
