import { Injectable } from "@nestjs/common";

import { MailerUsecaseSendMail } from "./mailer.usecase.send-mail";

@Injectable()
export class MailerUsecaseSend2FACode {
  constructor(private readonly mailerUsecaseSendMail: MailerUsecaseSendMail) {}

  async send2FACode(email: string, code: string): Promise<void> {
    const subject = "Code de vérification 2FA";
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Code de vérification</h2>
        <p>Votre code de vérification à deux facteurs est :</p>
        <h1 style="color: #4CAF50; font-size: 48px; letter-spacing: 5px;">${code}</h1>
        <p>Ce code expire dans 10 minutes.</p>
        <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
      </div>
    `;

    await this.mailerUsecaseSendMail.sendMail(email, subject, html);
  }
}
