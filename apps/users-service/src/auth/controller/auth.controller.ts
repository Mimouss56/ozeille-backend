import { BadRequestException, Body, Controller, Post, Query } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse, ApiResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { ValidationErrorResponse } from "src/common/dto/validation-error.dto";
import { MailerService } from "src/mailer/services/mailer.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { UsersService } from "src/users/services/users.service";

import { EmailDto } from "../dto/email.dto";
import { LoginResponseDto } from "../dto/login-response.dto";
import { LoginDto } from "../dto/login.dto";
import { Validate2FAResponseDto } from "../dto/validate-2fa-response.dto";
import { Validate2FADto } from "../dto/validate-2fa.dto";
import { AuthService } from "../services/auth.service";

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
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
    return this.authService.verifyConfirmation(token);
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
    await this.mailerService.sendConfirmationEmail(emailDto.email);
  }

  @Post("register")
  @ApiResponse({ status: 201, description: "The user has been successfully registered." })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationErrorResponse,
  })
  @ApiResponse({ status: 503, description: "Internal Server Error." })
  register(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.usersService.register(createUserDto);
  }

  @Post("login")
  @ApiOkResponse({
    description: "Connexion réussie. Un code 2FA a été envoyé par email et un token temporaire a été généré",
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationErrorResponse,
  })
  @ApiUnauthorizedResponse({
    description: "Email ou mot de passe incorrect, ou email non confirmé",
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post("2fa/validate")
  @ApiOkResponse({
    description: "Code 2FA vérifié avec succès. L'utilisateur est maintenant authentifié et reçoit ses tokens JWT.",
    type: Validate2FAResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationErrorResponse,
  })
  @ApiUnauthorizedResponse({
    description: "Token temporaire ou code de vérification invalide/expiré",
  })
  async validate2FA(@Body() validate2FADto: Validate2FADto): Promise<Validate2FAResponseDto> {
    return this.authService.validate2FA(validate2FADto);
  }
}
