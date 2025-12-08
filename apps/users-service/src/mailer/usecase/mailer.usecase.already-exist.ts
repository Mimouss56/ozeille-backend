import { Logger, NotImplementedException } from "@nestjs/common";

import { MailerUsecaseSendMail } from "./mailer.usecase.send-mail";

export class MailerAlreadyExistUsecase {
  private readonly logger = new Logger(MailerAlreadyExistUsecase.name);

  constructor(private readonly mailerUsecaseSendMail: MailerUsecaseSendMail) {}

  async sendAlreadyExistsEmail(email: string): Promise<void> {
    /*
    const subject = "Compte déjà existant";
    const html = `<p>Bonjour,</p><p>Un compte avec cette adresse email existe déjà. Si vous avez oublié votre mot de passe, utilisez la fonction de récupération.</p>`;
*/
    //TODO: implémenter l'envoi d'email de compte déjà existant
    this.logger.warn(
      `MailerAlreadyExistUsecase.sendAlreadyExistsEmail not implemented - attempted to send to ${email}`,
    );
    throw new NotImplementedException("MailerAlreadyExistUsecase.sendAlreadyExistsEmail");

    //await this.mailerUsecaseSendMail.sendMail(email, subject, html);
  }
}
