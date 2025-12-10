import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { createHash, randomBytes } from "crypto";
import Redis from "ioredis";
import { UserEntity } from "src/users/entities/user.entity";
import { UserUsecaseFind } from "src/users/usecases/user.usecase.find-by";

import { MailerUsecaseSendMail } from "./mailer.usecase.send-mail";

@Injectable()
export class MailerUsecaseConfirmEmail {
  private readonly logger = new Logger(MailerUsecaseConfirmEmail.name);

  constructor(
    private readonly mailerUsecaseSendMail: MailerUsecaseSendMail,
    private readonly userUsecaseFind: UserUsecaseFind,
    private readonly redis: Redis,
  ) {}

  /**
   * Envoie un email de confirmation contenant un lien du type
   * /api/confirm?token=<token>
   * Le token envoyé par email est une valeur aléatoire (non prévisible).
   * Seul son hash est stocké en base (ici Redis) pour éviter d'exposer
   * directement la valeur si Redis est compromis.
   */
  async registerEmail(email: UserEntity["email"]): Promise<void> {
    const redisKey = await this.generateAndStoreToken(email);

    try {
      await this.sendConfirmationEmail(email, redisKey);
    } catch (err) {
      this.logger.error(`Failed to send confirmation email to ${email}: ${err}`);
      // si l'envoi échoue, supprimer le token stocké
      await this.redis.del(redisKey);
      throw err;
    }
  }

  async sendConfirmationEmail(email: UserEntity["email"], token: string): Promise<void> {
    const user = await this.userUsecaseFind.findByEmail(email);
    if (!user) {
      throw new NotFoundException();
    }
    const subject = "Confirmez votre compte";
    const path = "/confirm-email";

    const baseUrl = process.env.FRONTEND_URL ?? process.env.API_URL ?? "";

    const href = baseUrl ? `${baseUrl.replace(/\/$/, "")}${path}?token=${token}` : `${path}?token=${token}`;

    const html = `
      <p>Bonjour ${user.firstName ?? ""},</p>
      <p>Merci pour votre inscription. Veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous :</p>
      <p><a href="${href}">Confirmer mon compte</a></p>
      <p>Si le lien ne fonctionne pas, copiez-collez l'URL suivante dans votre navigateur :</p>
      <p><code>${href}</code></p>
      <p>Ce lien expirera dans 10 minutes.</p>
    `;

    try {
      await this.mailerUsecaseSendMail.sendMail(email, subject, html);
    } catch (error) {
      throw new Error(`Failed to send confirmation email: ${error}`);
    }
  }

  /**
   * Génère un token aléatoire, stocke son hash en Redis avec une expiration,
   */
  async generateAndStoreToken(email: string): Promise<string> {
    // generate a random token (32 bytes -> 64 hex chars)
    const token = randomBytes(32).toString("hex");

    // hash the token before storing to Redis
    const tokenHash = createHash("sha256").update(token).digest("hex");

    // store hash with expiration (e.g., 10 minutes)
    const redisKey = `confirm-email-token:${tokenHash}`;
    await this.redis.set(redisKey, email, "EX", 10 * 60);
    return tokenHash;
  }
}
