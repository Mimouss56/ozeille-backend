import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthUsecase2FA } from "src/auth/usecases/auth.usecase.2fa";
import { AuthUsecaseJWT } from "src/auth/usecases/auth.usecase.jwt";
import { AuthUsecaseTempToken } from "src/auth/usecases/auth.usecase.temp-token";
import { UserUsecaseFind } from "src/users/usecases/user.usecase.find-by";

@Injectable()
export class AuthUsecaseValidate2FA {
  constructor(
    private readonly authUsecase2FA: AuthUsecase2FA,
    private readonly authUsecaseTempToken: AuthUsecaseTempToken,
    private readonly authUsecaseJWT: AuthUsecaseJWT,
    private readonly userUsecaseFind: UserUsecaseFind,
  ) {}

  async validate(tempToken: string, code: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Récupérer le userId depuis le tempToken
    const userId = await this.authUsecaseTempToken.getUserIdFromTempToken(tempToken);

    if (!userId) {
      throw new UnauthorizedException("Token temporaire invalide ou expiré");
    }

    // Vérifier le code 2FA
    const isValid = await this.authUsecase2FA.verify2FACode(userId, code);

    if (!isValid) {
      throw new UnauthorizedException("Code de vérification invalide ou expiré");
    }

    // Récupérer l'utilisateur pour obtenir l'email
    const user = await this.userUsecaseFind.findOne({ id: userId });

    if (!user) {
      throw new UnauthorizedException("Utilisateur non trouvé");
    }

    // Supprimer le tempToken (usage unique)
    await this.authUsecaseTempToken.deleteTempToken(tempToken);

    // Générer les JWT
    const tokens = await this.authUsecaseJWT.generateTokens(userId, user.email);

    return tokens;
  }
}
