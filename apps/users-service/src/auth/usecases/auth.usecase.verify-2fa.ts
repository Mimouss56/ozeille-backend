import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthUsecase2FA } from "src/auth/usecases/auth.usecase.2fa";
import { UserUsecaseFind } from "src/users/usecases/user.usecase.find-by";

@Injectable()
export class AuthUsecaseVerify2FA {
  constructor(
    private readonly authUsecase2FA: AuthUsecase2FA,
    private readonly userUsecaseFind: UserUsecaseFind,
  ) {}

  async verify(email: string, code: string): Promise<{ userId: string; email: string }> {
    // Récupérer l'utilisateur par email
    const user = await this.userUsecaseFind.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Email ou code incorrect");
    }

    // Vérifier le code 2FA
    const isValid = await this.authUsecase2FA.verify2FACode(user.id, code);

    if (!isValid) {
      throw new UnauthorizedException("Code de vérification invalide ou expiré");
    }

    return {
      userId: user.id,
      email: user.email,
    };
  }
}
