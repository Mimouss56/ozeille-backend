import { Injectable, Logger } from "@nestjs/common";

import { MailerUsecaseSendMail } from "./mailer.usecase.send-mail";

@Injectable()
export class MailerAlreadyExistUsecase {
  private readonly logger = new Logger(MailerAlreadyExistUsecase.name);

  constructor(private readonly mailerUsecaseSendMail: MailerUsecaseSendMail) {}

  async sendAlreadyExistsEmail(email: string): Promise<void> {
    const subject = "Compte déjà existant";
    const html = `
    <p>Bonjour,</p>
    <p>Un compte avec cette adresse email existe déjà. Si vous avez oublié votre mot de passe, utilisez la fonction de récupération.</p>
    `;
    try {
      await this.mailerUsecaseSendMail.sendMail(email, subject, html);
    } catch (err) {
      this.logger.error(`Failed to send sendAlreadyExistsEmail to ${email}: ${err}`);
      throw err;
    }
  }
}
