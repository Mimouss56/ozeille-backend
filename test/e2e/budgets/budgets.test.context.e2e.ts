import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";

import { BudgetsDataset } from "./budgets.dataset.e2e";

export class BudgetsTestContext {
  public userId: string;
  public existingBudgetId: string;
  public categoryId: string;
  public accessToken: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService?: JwtService,
  ) {}

  async init(): Promise<void> {
    await this.cleanup(); // Nettoyage préventif crucial

    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.default.hash(BudgetsDataset.user.password, 10);

    // 1. Création du user
    const user = await this.prisma.user.create({
      data: {
        ...BudgetsDataset.user,
        password: hashedPassword,
        confirmedAt: new Date(),
      },
    });
    this.userId = user.id;

    // 2. Création du budget existant
    const budget = await this.prisma.budget.create({
      data: {
        ...BudgetsDataset.existingBudget,
        userId: this.userId,
      },
    });
    this.existingBudgetId = budget.id;

    // 3. Création de la catégorie liée
    const category = await this.prisma.category.create({
      data: {
        ...BudgetsDataset.category,
        userId: this.userId,
        budgetId: this.existingBudgetId,
      },
    });
    this.categoryId = category.id;

    // 4. Création des transactions
    await this.prisma.transaction.createMany({
      data: BudgetsDataset.transactions.map((t) => ({
        ...t,
        userId: this.userId,
        categoryId: this.categoryId,
      })),
    });

    // 5. Génération du token si JwtService fourni
    if (this.jwtService) {
      this.accessToken = await this.jwtService.signAsync({ sub: this.userId });
    }
  }

  async cleanup(): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: BudgetsDataset.user.email },
    });

    if (user) {
      await this.prisma.transaction.deleteMany({ where: { userId: user.id } });
      await this.prisma.category.deleteMany({ where: { userId: user.id } });
      await this.prisma.budget.deleteMany({ where: { userId: user.id } });
      await this.prisma.user.delete({ where: { id: user.id } });
    }
  }
}
