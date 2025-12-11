import { BadRequestException, Body, Controller, Post, Query } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse, ApiResponse } from "@nestjs/swagger";
import { ZodSerializerDto } from "nestjs-zod";
import { AuthUsecaseVerifyConfirmation } from "src/auth/usecases/auth.usecase.verify-confirmation";
import { ValidationErrorResponse } from "src/common/dto/validation-error.dto";
import { MailerUsecaseConfirmEmail } from "src/mailer/usecase/mailer.usecase.confirm-email";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { UsersUsecaseRegister } from "src/users/usecases/users.usecase.register";

import { EmailDto } from "./dto/email.dto";

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly authUsecaseVerifyConfirmation: AuthUsecaseVerifyConfirmation,
    private readonly usersUsecaseRegister: UsersUsecaseRegister,
    private readonly mailerUsecaseConfirmEmail: MailerUsecaseConfirmEmail,
  ) {}

  @Post("register/confirm")
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
    const result = await this.authUsecaseVerifyConfirmation.verify(token);
    return result;
  }

  @Post("register/send-confirmation-email")
  @ApiOkResponse({
    description: "Envoie un email de confirmation à l'adresse fournie",
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationErrorResponse,
  })
  @ApiResponse({ status: 503, description: "Internal Server Error." })
  async sendConfirmationEmail(@Body() emailDto: EmailDto): Promise<void> {
    const token = await this.mailerUsecaseConfirmEmail.generateAndStoreToken(emailDto.email);
    await this.mailerUsecaseConfirmEmail.sendConfirmationEmail(emailDto.email, token);
  }

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
}
