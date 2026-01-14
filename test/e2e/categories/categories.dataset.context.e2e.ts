import { PrismaService } from "src/prisma/prisma.service";

export class CategoriesTestContext {
  public userId: string;
  public budgetId: string;

  public readonly userEmail = "e2e-cat-@test.com";
  public readonly existingCategoryLabel = "Déjà présent";
  public readonly budgetLabel = "Budget E2E";

  constructor(private prisma: PrismaService) {}

  /**
   * Initialise les données nécessaires pour la suite de tests
   */
  async init(): Promise<void> {
    // 1. CRÉATION DU USER
    const user = await this.prisma.user.create({
      data: {
        email: this.userEmail,
        password: "Password123!",
        firstName: "Jean",
        lastName: "Dupont",
        confirmedAt: new Date(),
      },
    });
    this.userId = user.id;

    // 2. CRÉATION DU BUDGET
    const budget = await this.prisma.budget.create({
      data: {
        label: this.budgetLabel,
        color: "#3498db",
        // Si ton schema.prisma définit une relation User sur Budget, décommente la ligne suivante :
        // userId: this.userId,
      },
    });
    this.budgetId = budget.id;

    // 3. CRÉATION DE LA CATÉGORIE
    await this.prisma.category.create({
      data: {
        label: this.existingCategoryLabel,
        color: "#e74c3c",
        limitAmount: "500.00",
        userId: this.userId,
        budgetId: this.budgetId,
      },
    });
  }

  /**
   * Nettoie toutes les données liées à ce contexte
   */
  async cleanup(): Promise<void> {
    // 1. Supprimer les catégories du budget
    await this.prisma.category.deleteMany({
      where: { budgetId: this.budgetId },
    });

    // 2. Supprimer le budget
    await this.prisma.budget.deleteMany({
      where: { id: this.budgetId },
    });

    await this.prisma.user.delete({ where: { id: this.userId } });
  }
}
