import { PrismaService } from "src/prisma/prisma.service";

export class AuthTestContext {
  public userId: string;

  public readonly testUser = {
    email: "test@example.com",
    password: "Password123!",
    firstName: "Validate2FA",
    lastName: "Doe",
    confirmedAt: new Date(),
  };
  public readonly testToken = "valid-confirmation-token";
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initialise les données nécessaires pour la suite de tests
   */
  async init(): Promise<void> {
    // Création ou récupération d'un utilisateur pour les tests
    const { email, password, firstName, lastName, confirmedAt } = this.testUser;
    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.default.hash(password, 10);
    let user = await this.prisma.user.findUnique({ where: { email } });
    user ??= await this.prisma.user.create({
      data: { email, password: hashedPassword, firstName, lastName, confirmedAt },
    });
    this.userId = user.id;
  }
}
