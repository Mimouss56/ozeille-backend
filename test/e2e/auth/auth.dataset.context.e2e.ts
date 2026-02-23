import { PrismaService } from "src/prisma/prisma.service";
import { createTestUser } from "test/utils/createTestUser";

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
    // Création ou récupération d'un utilisateur pour les tests
    const user = await createTestUser(this.prisma, this.testUser);
    this.userId = user.id;
  }
}
