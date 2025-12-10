import { Injectable, Logger } from "@nestjs/common";
import { createHash, randomBytes } from "crypto";
import Redis from "ioredis";
import { UserEntity } from "src/users/entities/user.entity";

import { MailerUsecaseSendMail } from "./mailer.usecase.send-mail";

@Injectable()
export class MailerUsecaseConfirmEmail {
  private readonly logger = new Logger(MailerUsecaseConfirmEmail.name);

  constructor(
    private readonly mailerUsecaseSendMail: MailerUsecaseSendMail,
    private readonly redis: Redis,
  ) {}

  /**
   * Envoie un email de confirmation contenant un lien du type
   * /api/confirm?token=<token>
   * Le token envoyé par email est une valeur aléatoire (non prévisible).
   * Seul son hash est stocké en base (ici Redis) pour éviter d'exposer
   * directement la valeur si Redis est compromis.
   */
  async sendConfirmationEmail(user: UserEntity): Promise<void> {
    // generate a random token (32 bytes -> 64 hex chars)
    const token = randomBytes(32).toString("hex");

    // hash the token before storing to Redis
    const tokenHash = createHash("sha256").update(token).digest("hex");

    // store hash with expiration (e.g., 10 minutes)
    const redisKey = `confirm-email-token:${tokenHash}`;
    await this.redis.set(redisKey, user.email, "EX", 10 * 60);

    const subject = "Confirmez votre compte";

    // build confirmation link — assume FRONTEND or API_URL env var, fallback to relative path
    const baseUrl = process.env.FRONTEND_URL ?? process.env.API_URL ?? "";
    console.log("baseUrl", baseUrl);

    const path = "/api/auth/confirm";
    const href = baseUrl ? `${baseUrl.replace(/\/$/, "")}${path}?token=${tokenHash}` : `${path}?token=${tokenHash}`;

    const html = `
      <p>Bonjour ${user.firstName ?? ""},</p>
      <p>Merci pour votre inscription. Veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :</p>
      <p><a href="${href}">Confirmer mon compte</a></p>
      <p>Si le lien ne fonctionne pas, copiez-collez l'URL suivante dans votre navigateur :</p>
      <p><code>${href}</code></p>
      <p>Ce lien expirera dans 10 minutes.</p>
    `;

    try {
      await this.mailerUsecaseSendMail.sendMail(user.email, subject, html);
    } catch (err) {
      this.logger.error(`Failed to send confirmation email to ${user.email}: ${err}`);
      // si l'envoi échoue, supprimer le token stocké
      await this.redis.del(redisKey);
      throw err;
    }
  }
}
