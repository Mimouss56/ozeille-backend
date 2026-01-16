import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

export interface ValidatedUser {
  userId: string;
}
export interface JwtPayload {
  sub: string; // L'ID de l'utilisateur (standard JWT)
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // On dit à Passport : "Cherche le token dans le Header 'Authorization' en tant que Bearer Token"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // TODO: Mettre la clé secrète dans une variable d'environnement
      secretOrKey: "test-secret-key",
    });
  }

  // Cette méthode est appelée automatiquement si le token est valide
  async validate(payload: JwtPayload): Promise<ValidatedUser> {
    // payload.sub contient l'ID utilisateur (standard JWT)
    // Ce que l'on retourne ici est injecté DIRECTEMENT dans request.user
    return { userId: payload.sub };
  }
}
