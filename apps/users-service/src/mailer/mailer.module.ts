import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { MailerAlreadyExistUsecase } from "./usecase/mailer.usecase.already-exist";
import { MailerUsecaseConfirmEmail } from "./usecase/mailer.usecase.confirm-email";
import { MailerUsecaseSendMail } from "./usecase/mailer.usecase.send-mail";

@Module({
  imports: [ConfigModule],
  providers: [MailerAlreadyExistUsecase, MailerUsecaseSendMail, MailerUsecaseConfirmEmail],
  exports: [MailerAlreadyExistUsecase, MailerUsecaseConfirmEmail],
})
export class MailerModule {}
