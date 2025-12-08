import { Logger } from "@nestjs/common";

import { MailerUsecaseSendMail } from "./mailer.usecase.send-mail";

export class MailerUsecaseConfirmEmail {
  constructor(
    private readonly logger: Logger,
    private readonly mailerUsecaseSendMail: MailerUsecaseSendMail,
  ) {}
  async sendConfirmationEmail(email: string, _firstName?: string): Promise<void> {
    /*
    const subject = "Confirmez votre compte";
    const html = `<p>Bonjour ${firstName ?? ""},</p><p>Merci pour votre inscription. Veuillez confirmer votre adresse email.</p>`;
    await this.mailerUsecaseSendMail.sendMail(email, subject, html);
    */
    //TODO: implémenter l'envoi d'email de confirmation
    this.logger.warn(`MailerUsecaseConfirmEmail.sendConfirmationEmail not implemented - attempted to send to ${email}`);
    throw new Error("MailerUsecaseConfirmEmail.sendConfirmationEmail not implemented");
  }
}
