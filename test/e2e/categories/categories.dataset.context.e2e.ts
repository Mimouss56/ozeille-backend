import { PrismaService } from "src/prisma/prisma.service";

export class CategoriesTestContext {
  public userId: string;
  public budgetId: string;

  public readonly userEmail = "test@example.com";
  // On garde le mot de passe en clair pour le login, mais on le hash pour la DB
  public readonly password = "Password123!";
  public readonly existingCategoryLabel = "Déjà présent";
  public readonly budgetLabel = "Budget E2E";
  public existingCategoryId: string;

  constructor(private readonly prisma: PrismaService) {}

  async init(): Promise<void> {
    // 1. Création ou récupération du user (autonome, sans import)
    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.default.hash(this.password, 10);
    let user = await this.prisma.user.findUnique({ where: { email: this.userEmail } });
    user ??= await this.prisma.user.create({
      data: {
        email: this.userEmail,
        password: hashedPassword,
        firstName: "Cat",
        lastName: "E2E",
        confirmedAt: new Date(),
      },
    });
    this.userId = user.id;

    // 3. CRÉATION DU BUDGET
    const budget = await this.prisma.budget.create({
      data: {
        label: this.budgetLabel,
        color: "#3498db",
        userId: this.userId,
      },
    });
    this.budgetId = budget.id;

    // 4. CRÉATION DE LA CATÉGORIE
    const category = await this.prisma.category.create({
      data: {
        label: this.existingCategoryLabel,
        color: "#e74c3c",
        limitAmount: "500.00",
        userId: this.userId,
        budgetId: this.budgetId,
      },
    });
    this.existingCategoryId = category.id;
  }
  async cleanup(): Promise<void> {
    // Suppression des catégories liées au user
    await this.prisma.category.deleteMany({ where: { userId: this.userId } });
    // Suppression des budgets liés au user
    await this.prisma.budget.deleteMany({ where: { userId: this.userId } });
    // Suppression du user
    await this.prisma.user.deleteMany({ where: { email: this.userEmail } });
  }
}
