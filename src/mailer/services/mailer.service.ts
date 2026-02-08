import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { Transporter, createTransport } from "nodemailer";
import { REDIS_TTL } from "src/auth/constants/redis.constants";
import { RedisKey, RedisService } from "src/redis/redis.module";

@Injectable()
export class MailerService {
  private readonly transporter: Transporter;
  private readonly logger = new Logger(MailerService.name);

  constructor(private readonly redisService: RedisService) {
    this.transporter = createTransport({
      host: process.env.MAILER_HOST ?? "localhost",
      port: Number.parseInt(process.env.MAILER_PORT ?? "1025", 10),
      secure: process.env.MAILER_PORT === "465",
      auth:
        process.env.MAILER_USER && process.env.MAILER_PASSWORD
          ? {
              user: process.env.MAILER_USER,
              pass: process.env.MAILER_PASSWORD,
            }
          : undefined,
      from: process.env.MAILER_FROM ?? "no-reply@lapince.com",
    });
  }

  /**
   * Send a generic email
   */
  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        to,
        from: process.env.MAILER_FROM ?? "not send",
        subject,
        html,
      });
    } catch (error) {
      this.logger.error(`Failed to send mail to ${to}: ${error}`);
      throw error;
    }
  }

  /**
   * Send confirmation email with token
   */
  async sendConfirmationEmail(email: string, firstName?: string): Promise<void> {
    const token = randomUUID();

    // Store hash with expiration
    await this.redisService.setWithPrefix(RedisKey.CONFIRM_EMAIL_TOKEN, token, email, REDIS_TTL.CONFIRM_EMAIL_TOKEN);

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
      await this.redisService.delWithPrefix(RedisKey.CONFIRM_EMAIL_TOKEN, token);
      throw new Error(`Failed to send confirmation email: ${error}`);
    }
  }

  /**
   * Generate and store token (for external use)
   */
  async generateAndStoreToken(email: string): Promise<string> {
    const token = randomUUID();

    // Store hash with expiration
    await this.redisService.setWithPrefix(RedisKey.CONFIRM_EMAIL_TOKEN, token, email, REDIS_TTL.CONFIRM_EMAIL_TOKEN);

    return token;
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

  /**
   * Send reset password email with token
   */
  async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    const subject = "Réinitialisation de votre mot de passe";
    const baseUrl = process.env.FRONTEND_URL ?? process.env.API_URL ?? "";
    const path = "/reset-password";
    const href = baseUrl ? `${baseUrl.replace(/\/$/, "")}${path}?token=${token}` : `${path}?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Réinitialisation de votre mot de passe</h2>
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
        <p><a href="${href}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a></p>
        <p>Si le lien ne fonctionne pas, copiez-collez l'URL suivante dans votre navigateur :</p>
        <p><code>${href}</code></p>
        <p><strong>Ce lien expirera dans 15 minutes.</strong></p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe actuel reste inchangé.</p>
      </div>
    `;

    await this.sendMail(email, subject, html);
  }
}
