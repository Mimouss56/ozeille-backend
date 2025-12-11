import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthUsecaseJWT {
  // Dans un vrai projet, ces secrets devraient venir de variables d'environnement
  private readonly JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
  private readonly REFRESH_SECRET = process.env.REFRESH_SECRET || "your-refresh-secret";

  async generateTokens(userId: string, email: string): Promise<{ accessToken: string; refreshToken: string }> {
    // Pour l'instant, génération de tokens simples
    // Dans un vrai projet, utiliser @nestjs/jwt avec des payload signés
    const accessToken = this.createSimpleToken(userId, email, "access");
    const refreshToken = this.createSimpleToken(userId, email, "refresh");

    return {
      accessToken,
      refreshToken,
    };
  }

  private createSimpleToken(userId: string, email: string, type: "access" | "refresh"): string {
    // Token simplifié pour l'instant (à remplacer par de vrais JWT signés)
    const payload = {
      sub: userId,
      email,
      type,
      iat: Date.now(),
      exp: Date.now() + (type === "access" ? 3600000 : 604800000), // 1h pour access, 7j pour refresh
    };

    // Encode en base64 (NON SÉCURISÉ - juste pour les tests)
    return Buffer.from(JSON.stringify(payload)).toString("base64");
  }
}
