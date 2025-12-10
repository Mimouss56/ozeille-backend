import { BadRequestException, Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiBadRequestResponse, ApiResponse } from "@nestjs/swagger";
import { ZodSerializerDto } from "nestjs-zod";
import { AuthUsecaseVerifyConfirmation } from "src/auth/usecases/auth.usecase.verify-confirmation";
import { ValidationErrorResponse } from "src/common/dto/validation-error.dto";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { UsersUsecaseRegister } from "src/users/usecases/users.usecase.register";

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly verifyUsecase: AuthUsecaseVerifyConfirmation,
    private readonly usersUsecaseRegister: UsersUsecaseRegister,
  ) {}

  @Post("register")
  @ZodSerializerDto(CreateUserDto)
  // @ApiResponse({ status: 201, description: "The user has been successfully registered." })
  @ApiResponse({ status: 204, description: "The user has been successfully registered." })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationErrorResponse,
  })
  @ApiResponse({ status: 503, description: "Internal Server Error." })
  register(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.usersUsecaseRegister.execute(createUserDto);
  }

  @Get("confirm")
  async confirm(@Query("token") token?: string): Promise<{ ok: boolean; message?: string }> {
    if (!token) throw new BadRequestException("token is required");
    const result = await this.verifyUsecase.verify(token);
    if (!result) return { ok: false, message: "Invalid or expired token" };
    return { ok: true };
  }
}
