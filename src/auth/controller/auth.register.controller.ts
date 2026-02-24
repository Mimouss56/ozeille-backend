import { BadRequestException, Body, Controller, HttpCode, Post, Query } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse, ApiResponse } from "@nestjs/swagger";
import { ValidationErrorResponse } from "src/common/dto/validation-error.dto";
import { MailerService } from "src/mailer/services/mailer.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { UsersService } from "src/users/services/users.service";

import { EmailDto } from "../dto/email.dto";
import { AuthService } from "../services/auth.service";

@Controller("api/auth/register")
export class AuthRegisterController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
  ) {}

  @Post("confirm")
  @HttpCode(204)
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
  async confirm(@Query("token") token?: string): Promise<void> {
    if (!token) throw new BadRequestException("token is required");
    const status = await this.authService.verifyConfirmation(token);
    if (!status) throw new BadRequestException("Invalid or expired token");
  }

  @Post("send-confirmation-email")
  @ApiOkResponse({
    description: "Envoie un email de confirmation à l'adresse fournie",
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationErrorResponse,
  })
  @ApiResponse({ status: 503, description: "Internal Server Error." })
  async sendConfirmationEmail(@Body() emailDto: EmailDto): Promise<void> {
    await this.mailerService.sendConfirmationEmail(emailDto.email);
  }

  @Post("/")
  @ApiResponse({ status: 201, description: "The user has been successfully registered." })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationErrorResponse,
  })
  @ApiResponse({ status: 503, description: "Internal Server Error." })
  register(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.usersService.register(createUserDto);
  }
}
