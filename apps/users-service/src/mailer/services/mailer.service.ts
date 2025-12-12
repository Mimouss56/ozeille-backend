import { Injectable, Logger } from "@nestjs/common";
import { Transporter, createTransport } from "nodemailer";

import { MailerRepository } from "../repository/mailer.repository";

@Injectable()
export class MailerService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly repository: MailerRepository) {
    this.transporter = createTransport({
      host: "localhost", // e.g., smtp.gmail.com
      port: 1025,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "ozeille",
        pass: "ozeille",
      },
      from: "no-reply@example.com",
    });
  }

  /**
   * Send a generic email
   */
  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to} messageId=${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send mail to ${to}: ${error}`);
      throw error;
    }
  }

  /**
   * Send confirmation email with token
   */
  async sendConfirmationEmail(email: string, firstName?: string): Promise<void> {
    const token = await this.repository.generateAndStoreConfirmToken(email);

    try {
      const subject = "Confirmez votre compte";
      const path = "/confirm-email";
      const baseUrl = process.env.FRONTEND_URL ?? process.env.API_URL ?? "";
      const href = baseUrl ? `${baseUrl.replace(/\/$/, "")}${path}?token=${token}` : `${path}?token=${token}`;

      const html = `
        <p>Bonjour ${firstName ?? ""},</p>
        <p>Merci pour votre inscription. Veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :</p>
        <p><a href="${href}">Confirmer mon compte</a></p>
        <p>Si le lien ne fonctionne pas, copiez-collez l'URL suivante dans votre navigateur :</p>
        <p><code>${href}</code></p>
        <p>Ce lien expirera dans 10 minutes.</p>
      `;

      await this.sendMail(email, subject, html);
    } catch (error) {
      this.logger.error(`Failed to send confirmation email to ${email}: ${error}`);
      await this.repository.deleteConfirmToken(token);
      throw new Error(`Failed to send confirmation email: ${error}`);
    }
  }

  /**
   * Generate and store token (for external use)
   */
  async generateAndStoreToken(email: string): Promise<string> {
    return this.repository.generateAndStoreConfirmToken(email);
  }

  /**
   * Send "account already exists" email
   */
  async sendAlreadyExistsEmail(email: string): Promise<void> {
    const subject = "Compte déjà existant";
    const html = `
      <p>Bonjour,</p>
      <p>Un compte avec cette adresse email existe déjà. Si vous avez oublié votre mot de passe, utilisez la fonction de récupération.</p>
    `;
    try {
      await this.sendMail(email, subject, html);
    } catch (err) {
      this.logger.error(`Failed to send "already exists" email to ${email}: ${err}`);
      throw err;
    }
  }

  /**
   * Send 2FA code email
   */
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

    await this.sendMail(email, subject, html);
  }

  /**
   * Register email - send confirmation with user lookup
   */
  async registerEmail(email: string, firstName?: string): Promise<void> {
    await this.sendConfirmationEmail(email, firstName);
  }
}
