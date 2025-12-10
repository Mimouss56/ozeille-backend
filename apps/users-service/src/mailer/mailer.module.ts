import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { PrismaService } from "src/prisma/prisma.service";

import { AuthUsecaseVerifyConfirmation } from "../auth/usecases/auth.usecase.verify-confirmation";
import { MailerAlreadyExistUsecase } from "./usecase/mailer.usecase.already-exist";
import { MailerUsecaseConfirmEmail } from "./usecase/mailer.usecase.confirm-email";
import { MailerUsecaseSendMail } from "./usecase/mailer.usecase.send-mail";

@Module({
  imports: [ConfigModule],
  providers: [
    MailerAlreadyExistUsecase,
    MailerUsecaseSendMail,
    MailerUsecaseConfirmEmail,
    AuthUsecaseVerifyConfirmation,
    PrismaService,
    ConfigService,
    Redis,
  ],
  controllers: [],
  exports: [MailerAlreadyExistUsecase, MailerUsecaseConfirmEmail, AuthUsecaseVerifyConfirmation],
})
export class MailerModule {}
