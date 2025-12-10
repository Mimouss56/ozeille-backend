import { BadRequestException, Body, Controller, Post, Query } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse, ApiResponse } from "@nestjs/swagger";
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
  @ApiResponse({ status: 201, description: "The user has been successfully registered." })
  // @ApiResponse({ status: 204, description: "The user has been successfully registered." })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationErrorResponse,
  })
  @ApiResponse({ status: 503, description: "Internal Server Error." })
  register(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.usersUsecaseRegister.execute(createUserDto);
  }

  @Post("confirm")
  @ApiOkResponse({
    description: "Retourne true si le token est valide et l'email confirmé, false sinon",
    schema: {
      type: "boolean",
      example: true,
    },
  })
  @ApiBadRequestResponse({
    description: "Le token est manquant dans la requête",
  })
  async confirm(@Query("token") token?: string): Promise<boolean> {
    if (!token) throw new BadRequestException("token is required");
    return await this.verifyUsecase.verify(token);
  }
}
