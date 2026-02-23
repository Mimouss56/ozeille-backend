import * as bcrypt from "bcrypt";
import { PrismaService } from "src/prisma/prisma.service";

export class CategoriesTestContext {
  public userId: string;
  public budgetId: string;

  public readonly userEmail = "e2e-cat-@test.com";
  // On garde le mot de passe en clair pour le login, mais on le hash pour la DB
  public readonly password = "Password123!";
  public readonly existingCategoryLabel = "Déjà présent";
  public readonly budgetLabel = "Budget E2E";
  public existingCategoryId: string;

  constructor(private readonly prisma: PrismaService) {}

  async init(): Promise<void> {
    // 1. Hashage du mot de passe pour la DB
    const hashedPassword = await bcrypt.hash(this.password, 10);

    // 2. CRÉATION DU USER
    const user = await this.prisma.user.create({
      data: {
        email: this.userEmail,
        password: hashedPassword,
        firstName: "Jean",
        lastName: "Dupont",
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
    await this.prisma.category.deleteMany({ where: { userId: this.userId } });
    await this.prisma.budget.deleteMany({ where: { userId: this.userId } });
    await this.prisma.user.deleteMany({ where: { id: this.userId } });
  }
}
