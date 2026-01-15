import { PrismaService } from "src/prisma/prisma.service";

export class AuthTestContext {
  public userId: string;
  public readonly email = "e2e-auth-@test.com";
  public readonly password = "Password123!";
  public readonly firstName = "John";
  public readonly lastName = "Doe";

  constructor(private prisma: PrismaService) {}

  /**
   * Initialise les données nécessaires pour la suite de tests
   */
  async init(): Promise<void> {
    // Création d'un utilisateur pour les tests
    const user = await this.prisma.user.create({
      data: {
        email: this.email,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
        confirmedAt: null,
      },
    });
    this.userId = user.id;
  }

  /**
   * Nettoie toutes les données liées à ce contexte
   */
  async cleanup(): Promise<void> {
    await this.prisma.user.deleteMany({ where: { email: this.email } });
  }
}
