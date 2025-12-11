import { Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { MailerUsecaseConfirmEmail } from "src/mailer/usecase/mailer.usecase.confirm-email";
import { UserUsecaseFind } from "src/users/usecases/user.usecase.find-by";

@Injectable()
export class AuthUsecaseLogin {
  constructor(
    private readonly userUsecaseFind: UserUsecaseFind,
    private readonly mailerUsecaseConfirmEmail: MailerUsecaseConfirmEmail,
  ) {}

  async validateCredentials(email: string, password: string): Promise<{ userId: string }> {
    const user = await this.userUsecaseFind.findByEmailWithPassword(email);

    if (!user) {
      throw new UnauthorizedException("Email ou mot de passe incorrect");
    }

    if (!user.confirmedAt) {
      await this.mailerUsecaseConfirmEmail.registerEmail(email);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Email ou mot de passe incorrect");
    }

    return { userId: user.id };
  }
}
