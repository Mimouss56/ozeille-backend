import { Logger, NotImplementedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

export class MailerUsecaseSendMail {
  private readonly logger = new Logger(MailerUsecaseSendMail.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly transporter: nodemailer.Transporter,
  ) {}
  // Implementation of the use case to send mail
  async sendMail(to: string, _subject: string, _html: string): Promise<void> {
    // TODO: implémenter l'envoi d'email
    this.logger.warn(`MailerUsecaseSendMail.sendMail not implemented - attempted to send to ${to}`);
    throw new NotImplementedException(`MailerUsecaseSendMail.sendMailattempted to send to ${to}`);
    /*
    try {
      const from = this.configService.get<string>("MAIL_FROM") || "no-reply@example.com";
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to} messageId=${info.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send mail to ${to}: ${error}`);
    }
    */
  }
}
