import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { randomBytes, randomUUID } from "crypto";
import { MailerService } from "src/mailer/services/mailer.service";
import { RedisKey, RedisService } from "src/redis/redis.module";
import { UsersService } from "src/users/services/users.service";

import { ResetPasswordDto } from "../../users/dto/reset-password.dto";
import { REDIS_TTL } from "../constants/redis.constants";
import { LoginResponseDto } from "../dto/login-response.dto";
import { LoginDto } from "../dto/login.dto";
import { Validate2FADto } from "../dto/validate-2fa.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly mailerService: MailerService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Login: Validate credentials and generate 2FA code
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    // Validate credentials
    const { userId } = await this.validateCredentials(loginDto.email, loginDto.password);

    // Generate and store 2FA code
    const code2FA = this.generate2FACode();
    await this.redisService.setWithPrefix(RedisKey.TWO_FA, userId, code2FA, REDIS_TTL.CODE_2FA);

    // Generate and store temp token
    const tempToken = `tmp_${randomBytes(32).toString("hex")}`;

    await this.redisService.setWithPrefix(RedisKey.TEMP_TOKEN, tempToken, userId, REDIS_TTL.TEMP_TOKEN);

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
    const userId = await this.redisService.getWithPrefix(RedisKey.TEMP_TOKEN, validate2FADto.tempToken);
    if (!userId) {
      throw new UnauthorizedException("Token temporaire invalide ou expiré");
    }

    // Verify 2FA code
    const storedCode = await this.redisService.getWithPrefix(RedisKey.TWO_FA, userId);
    if (!storedCode || storedCode !== validate2FADto.code) {
      throw new UnauthorizedException("Code de vérification invalide ou expiré");
    }

    // Delete used codes
    await this.redisService.delWithPrefix(RedisKey.TWO_FA, userId);
    await this.redisService.delWithPrefix(RedisKey.TEMP_TOKEN, validate2FADto.tempToken);

    // Get user for email
    const user = await this.usersService.findById(userId);

    // Generate JWT tokens
    return this.generateTokens(userId, user.email);
  }

  /**
   * Verify email confirmation token
   */
  async verifyConfirmation(token: string): Promise<boolean> {
    const email = await this.redisService.getWithPrefix(RedisKey.CONFIRM_EMAIL_TOKEN, token);
    const status = false;
    if (!email) {
      this.logger.warn(`Token not found or expired: ${token}`);
      // return false for invalid/expired token exception
      return status;
    }

    try {
      // Find user by email to get userId
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        this.logger.error(`User not found for email: ${email}`);
        // return false if user not found exception
        return status;
      }

      await this.usersService.confirmUserEmail(user.id);
      await this.redisService.delWithPrefix(RedisKey.CONFIRM_EMAIL_TOKEN, token);
      this.logger.log(`Email confirmed successfully for: ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to confirm email for ${email}:`, error);
      // return false on any other error exception
      return status;
    }
  }

  /**
   * Request password reset - generates token and sends email
   */
  async forgotPassword(email: string): Promise<void> {
    // Find user by email
    const user = await this.usersService.findByEmail(email);

    // Si l'utilisateur n'existe pas, on retourne quand même success (sécurité)
    if (!user) {
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Generate unique token (UUID)
    const resetToken = randomUUID();

    // Store token in Redis with userId
    await this.redisService.setWithPrefix(
      RedisKey.RESET_PASSWORD_TOKEN,
      resetToken,
      user.id,
      REDIS_TTL.RESET_PASSWORD_TOKEN,
    );
    // Send email with reset link
    await this.mailerService.sendResetPasswordEmail(email, resetToken);

    this.logger.log(`Password reset email sent to: ${email}`);
  }

  async resetPassword(token: string, resetPassword: ResetPasswordDto): Promise<void> {
    // Get userId from reset token
    // const userId = await this.repository.getUserIdFromResetToken(token);
    const userId = await this.redisService.getWithPrefix(RedisKey.RESET_PASSWORD_TOKEN, token);
    if (!userId) {
      throw new UnauthorizedException("Token de réinitialisation invalide ou expiré");
    }
    //

    // Hash new password
    const hashedPassword = await bcrypt.hash(resetPassword.password, 10);

    // Update user password in database
    await this.usersService.updateUserPassword(userId, hashedPassword);

    // Delete used reset token
    await this.redisService.delWithPrefix(RedisKey.RESET_PASSWORD_TOKEN, token);

    this.logger.log(`Password successfully reset for userId: ${userId}`);
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
