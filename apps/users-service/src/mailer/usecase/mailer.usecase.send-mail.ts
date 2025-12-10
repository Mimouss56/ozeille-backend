import { Injectable, Logger } from "@nestjs/common";
import { Transporter, createTransport } from "nodemailer";

@Injectable()
export class MailerUsecaseSendMail {
  private transporter: Transporter;

  private readonly logger = new Logger(MailerUsecaseSendMail.name);
  constructor() {
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
  // Implementation of the use case to send mail
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
    }
  }
}
