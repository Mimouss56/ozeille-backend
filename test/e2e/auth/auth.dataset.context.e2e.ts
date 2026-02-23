import { PrismaService } from "src/prisma/prisma.service";

export class AuthTestContext {
  public userId: string;

  public readonly testUser = {
    email: "test@example.com",
    password: "Password123!",
    firstName: "Validate2FA",
    lastName: "Doe",
  };
  public readonly testToken = "valid-confirmation-token";
  constructor(private readonly prisma: PrismaService) {}

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
}
