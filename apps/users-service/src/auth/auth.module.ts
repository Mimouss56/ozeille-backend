import { Module } from "@nestjs/common";
import Redis from "ioredis";
import { AuthUsecaseVerifyConfirmation } from "src/auth/usecases/auth.usecase.verify-confirmation";
import { MailerAlreadyExistUsecase } from "src/mailer/usecase/mailer.usecase.already-exist";
import { MailerUsecaseConfirmEmail } from "src/mailer/usecase/mailer.usecase.confirm-email";
import { MailerUsecaseSendMail } from "src/mailer/usecase/mailer.usecase.send-mail";
import { PrismaService } from "src/prisma/prisma.service";
import { UserUsecaseCreate } from "src/users/usecases/user.usecase.create";
import { UserUsecaseFind } from "src/users/usecases/user.usecase.find-by";
import { UsersUsecaseRegister } from "src/users/usecases/users.usecase.register";

import { AuthController } from "./auth.controller";

@Module({
  controllers: [AuthController],
  providers: [
    AuthUsecaseVerifyConfirmation,
    PrismaService,
    UsersUsecaseRegister,
    UserUsecaseFind,
    UserUsecaseCreate,
    MailerAlreadyExistUsecase,
    MailerUsecaseConfirmEmail,
    MailerUsecaseSendMail,
    Redis,
  ],
})
export class AuthModule {}
