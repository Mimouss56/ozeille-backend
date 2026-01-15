import { BadRequestException, Body, Controller, Get, HttpCode, Post, Query, UseGuards } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Ctx } from "src/common/decorators/ctx.decorator";
import { ValidationErrorResponse } from "src/common/dto/validation-error.dto";
import { RequestContext } from "src/common/interfaces/request-context.interface";
import { MailerService } from "src/mailer/services/mailer.service";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { UsersService } from "src/users/services/users.service";

import { ResetPasswordDto } from "../../users/dto/reset-password.dto";
import { EmailDto } from "../dto/email.dto";
import { ForgotPasswordDto } from "../dto/forgot-password.dto";
import { ForgotPasswordResponseDto } from "../dto/forgot-password.response.dto";
import { LoginResponseDto } from "../dto/login-response.dto";
import { LoginDto } from "../dto/login.dto";
import { Validate2FAResponseDto } from "../dto/validate-2fa-response.dto";
import { Validate2FADto } from "../dto/validate-2fa.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { AuthService } from "../services/auth.service";

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
  ) {}

  @Post("register/confirm")
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

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Retourne les infos de l'utilisateur courant via le Token" })
  getProfile(@Ctx() ctx: RequestContext<unknown>): { message: string; userId: string; method: string } {
    return {
      message: "Vous êtes authentifié avec succès",
      userId: ctx.userId,
      method: ctx.method,
    };
  }

  @Post("forgot-password")
  @ApiOkResponse({
    description: "Si le compte existe, un email de réinitialisation a été envoyé",
    type: ForgotPasswordResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationErrorResponse,
  })
  @ApiResponse({ status: 503, description: "Internal Server Error." })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return { message: "Si ce compte existe, un email a été envoyé" };
  }

  @Post("reset-password")
  @ApiOkResponse({
    description: "Mot de passe réinitialisé avec succès",
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationErrorResponse,
  })
  @ApiUnauthorizedResponse({
    description: "Token de réinitialisation invalide ou expiré",
  })
  @ApiResponse({ status: 503, description: "Internal Server Error." })
  async resetPassword(@Query("token") token: string, @Body() resetPassword: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(token, resetPassword);
  }
}
