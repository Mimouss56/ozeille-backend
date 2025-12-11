import { BadRequestException, Body, Controller, Post, Query } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOkResponse, ApiResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { ZodSerializerDto } from "nestjs-zod";
import { AuthUsecase2FA } from "src/auth/usecases/auth.usecase.2fa";
import { AuthUsecaseLogin } from "src/auth/usecases/auth.usecase.login";
import { AuthUsecaseTempToken } from "src/auth/usecases/auth.usecase.temp-token";
import { AuthUsecaseValidate2FA } from "src/auth/usecases/auth.usecase.validate-2fa";
import { AuthUsecaseVerifyConfirmation } from "src/auth/usecases/auth.usecase.verify-confirmation";
import { ValidationErrorResponse } from "src/common/dto/validation-error.dto";
import { MailerUsecaseConfirmEmail } from "src/mailer/usecase/mailer.usecase.confirm-email";
import { MailerUsecaseSend2FACode } from "src/mailer/usecase/mailer.usecase.send-2fa-code";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { UsersUsecaseRegister } from "src/users/usecases/users.usecase.register";

import { EmailDto } from "./dto/email.dto";
import { LoginResponseDto } from "./dto/login-response.dto";
import { LoginDto } from "./dto/login.dto";
import { Validate2FAResponseDto } from "./dto/validate-2fa-response.dto";
import { Validate2FADto } from "./dto/validate-2fa.dto";

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly authUsecaseVerifyConfirmation: AuthUsecaseVerifyConfirmation,
    private readonly usersUsecaseRegister: UsersUsecaseRegister,
    private readonly mailerUsecaseConfirmEmail: MailerUsecaseConfirmEmail,
    private readonly authUsecaseLogin: AuthUsecaseLogin,
    private readonly authUsecase2FA: AuthUsecase2FA,
    private readonly authUsecaseTempToken: AuthUsecaseTempToken,
    private readonly authUsecaseValidate2FA: AuthUsecaseValidate2FA,
    private readonly mailerUsecaseSend2FACode: MailerUsecaseSend2FACode,
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

  @Post("login")
  @ZodSerializerDto(LoginDto)
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
    // Valider les credentials
    const { userId } = await this.authUsecaseLogin.validateCredentials(loginDto.email, loginDto.password);

    // Générer et stocker le code 2FA
    const code2FA = await this.authUsecase2FA.generateAndStore2FACode(userId);

    // Générer et stocker le token temporaire
    const tempToken = await this.authUsecaseTempToken.generateAndStoreTempToken(userId);

    // Envoyer le code par email (ne pas bloquer si l'envoi échoue)
    await this.mailerUsecaseSend2FACode.send2FACode(loginDto.email, code2FA);

    return {
      message: "Un code de vérification a été envoyé à votre adresse email",
      tempToken,
    };
  }

  @Post("2fa/validate")
  @ZodSerializerDto(Validate2FADto)
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
    const { accessToken, refreshToken } = await this.authUsecaseValidate2FA.validate(
      validate2FADto.tempToken,
      validate2FADto.code,
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
