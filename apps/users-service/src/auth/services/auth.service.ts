import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { MailerService } from "src/mailer/services/mailer.service";
import { UsersService } from "src/users/services/users.service";

import { LoginDto } from "../dto/login.dto";
import { Validate2FADto } from "../dto/validate-2fa.dto";
import { AuthRepository } from "../repository/auth.repository";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
  private readonly REFRESH_SECRET = process.env.REFRESH_SECRET || "your-refresh-secret";

  constructor(
    private readonly repository: AuthRepository,
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
  ) {}

  /**
   * Login: Validate credentials and generate 2FA code
   */
  async login(loginDto: LoginDto): Promise<{ message: string; tempToken: string }> {
    // Validate credentials
    const { userId } = await this.validateCredentials(loginDto.email, loginDto.password);

    // Generate and store 2FA code
    const code2FA = this.generate2FACode();
    await this.repository.store2FACode(userId, code2FA);

    // Generate and store temp token
    const tempToken = await this.repository.storeTempToken(userId);

    // Send 2FA code by email
    await this.mailerService.send2FACode(loginDto.email, code2FA);

    return {
      message: "Un code de vérification a été envoyé à votre adresse email",
      tempToken,
    };
  }

  /**
   * Validate 2FA code and generate JWT tokens
   */
  async validate2FA(validate2FADto: Validate2FADto): Promise<{ accessToken: string; refreshToken: string }> {
    // Get userId from temp token
    const userId = await this.repository.getUserIdFromTempToken(validate2FADto.tempToken);

    if (!userId) {
      throw new UnauthorizedException("Token temporaire invalide ou expiré");
    }

    // Verify 2FA code
    const storedCode = await this.repository.get2FACode(userId);
    if (!storedCode || storedCode !== validate2FADto.code) {
      throw new UnauthorizedException("Code de vérification invalide ou expiré");
    }

    // Delete used codes
    await this.repository.delete2FACode(userId);
    await this.repository.deleteTempToken(validate2FADto.tempToken);

    // Get user for email
    const user = await this.usersService.findById(userId);

    // Generate JWT tokens
    return this.generateTokens(userId, user.email);
  }

  /**
   * Verify email confirmation token
   */
  async verifyConfirmation(token: string): Promise<boolean> {
    const email = await this.repository.getEmailFromConfirmToken(token);

    if (!email) {
      this.logger.warn(`Token not found or expired: ${token}`);
      return false;
    }

    try {
      await this.repository.confirmUserEmail(email);
      await this.repository.deleteConfirmToken(token);
      this.logger.log(`Email confirmed successfully for: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to confirm email for ${email}:`, error);
      return false;
    }
  }

  // ========== Private Methods ==========

  private async validateCredentials(email: string, password: string): Promise<{ userId: string }> {
    const user = await this.usersService.findByEmailWithPassword(email);

    if (!user) {
      throw new UnauthorizedException("Email ou mot de passe incorrect");
    }

    if (!user.confirmedAt) {
      await this.mailerService.registerEmail(email);
      throw new UnauthorizedException("Veuillez confirmer votre email avant de vous connecter");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Email ou mot de passe incorrect");
    }

    return { userId: user.id };
  }

  private generate2FACode(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  private generateTokens(userId: string, email: string): { accessToken: string; refreshToken: string } {
    // Simple token generation (to be replaced with proper JWT)
    const accessToken = this.createSimpleToken(userId, email, "access");
    const refreshToken = this.createSimpleToken(userId, email, "refresh");

    return { accessToken, refreshToken };
  }

  private createSimpleToken(userId: string, email: string, type: "access" | "refresh"): string {
    const payload = {
      sub: userId,
      email,
      type,
      iat: Date.now(),
      exp: Date.now() + (type === "access" ? 3600000 : 604800000), // 1h for access, 7d for refresh
    };

    return Buffer.from(JSON.stringify(payload)).toString("base64");
  }
}
