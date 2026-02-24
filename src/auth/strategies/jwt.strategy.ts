import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
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
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET", "test-secret-key"),
    });
  }

  // Cette méthode est appelée automatiquement si le token est valide
  async validate(payload: JwtPayload): Promise<ValidatedUser> {
    // payload.sub contient l'ID utilisateur (standard JWT)
    // Ce que l'on retourne ici est injecté DIRECTEMENT dans request.user
    return { userId: payload.sub };
  }
}
