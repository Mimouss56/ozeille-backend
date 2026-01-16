import { PrismaService } from "src/prisma/prisma.service";

export class AuthTestContext {
  public userId: string;

  public readonly testUser = {
    email: "e2e-auth-@test.com",
    password: "Password123!",
    firstName: "Validate2FA",
    lastName: "Doe",
  };
  public readonly testToken = "valid-confirmation-token";
  constructor(private prisma: PrismaService) {}

  /**
   * Initialise les données nécessaires pour la suite de tests
   */
  async init(): Promise<void> {
    // Création d'un utilisateur pour les tests
    const user = await this.prisma.user.create({
      data: this.testUser,
    });
    this.userId = user.id;
  }

  /**
   * Nettoie toutes les données liées à ce contexte
   */
  async cleanup(): Promise<void> {
    await this.prisma.user.deleteMany({ where: { email: this.testUser.email } });
  }
}
