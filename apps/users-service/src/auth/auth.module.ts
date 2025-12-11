import { Module } from "@nestjs/common";
import { AuthUsecase2FA } from "src/auth/usecases/auth.usecase.2fa";
import { AuthUsecaseJWT } from "src/auth/usecases/auth.usecase.jwt";
import { AuthUsecaseLogin } from "src/auth/usecases/auth.usecase.login";
import { AuthUsecaseTempToken } from "src/auth/usecases/auth.usecase.temp-token";
import { AuthUsecaseValidate2FA } from "src/auth/usecases/auth.usecase.validate-2fa";
import { AuthUsecaseVerify2FA } from "src/auth/usecases/auth.usecase.verify-2fa";
import { AuthUsecaseVerifyConfirmation } from "src/auth/usecases/auth.usecase.verify-confirmation";
import { MailerAlreadyExistUsecase } from "src/mailer/usecase/mailer.usecase.already-exist";
import { MailerUsecaseConfirmEmail } from "src/mailer/usecase/mailer.usecase.confirm-email";
import { MailerUsecaseSend2FACode } from "src/mailer/usecase/mailer.usecase.send-2fa-code";
import { MailerUsecaseSendMail } from "src/mailer/usecase/mailer.usecase.send-mail";
import { UserUsecaseCreate } from "src/users/usecases/user.usecase.create";
import { UserUsecaseFind } from "src/users/usecases/user.usecase.find-by";
import { UsersUsecaseRegister } from "src/users/usecases/users.usecase.register";

import { AuthController } from "./auth.controller";

@Module({
  controllers: [AuthController],
  providers: [
    AuthUsecaseVerifyConfirmation,
    AuthUsecaseLogin,
    AuthUsecase2FA,
    AuthUsecaseTempToken,
    AuthUsecaseJWT,
    AuthUsecaseValidate2FA,
    AuthUsecaseVerify2FA,
    UsersUsecaseRegister,
    UserUsecaseFind,
    UserUsecaseCreate,
    MailerAlreadyExistUsecase,
    MailerUsecaseConfirmEmail,
    MailerUsecaseSend2FACode,
    MailerUsecaseSendMail,
  ],
})
export class AuthModule {}
