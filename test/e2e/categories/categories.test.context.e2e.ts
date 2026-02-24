import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";

import { CategoriesDataset } from "./categories.dataset.e2e";

export class CategoriesTestContext {
  public userId: string;
  public budgetId: string;
  public existingCategoryId: string;
  public existingCategoryLabel: string;
  public accessToken: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService?: JwtService,
  ) {}

  async init(): Promise<void> {
    await this.cleanup();

    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.default.hash(CategoriesDataset.user.password, 10);

    // 1. Création de l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        ...CategoriesDataset.user,
        password: hashedPassword,
        confirmedAt: new Date(),
      },
    });
    this.userId = user.id;

    // 2. Création du budget
    const budget = await this.prisma.budget.create({
      data: {
        ...CategoriesDataset.budget,
        userId: this.userId,
      },
    });
    this.budgetId = budget.id;

    // 3. Création de la catégorie par défaut
    const category = await this.prisma.category.create({
      data: {
        ...CategoriesDataset.existingCategory,
        userId: this.userId,
        budgetId: this.budgetId,
      },
    });
    this.existingCategoryId = category.id;
    this.existingCategoryLabel = category.label;

    // Génération du token si JwtService fourni
    if (this.jwtService) {
      this.accessToken = await this.jwtService.signAsync({ sub: this.userId });
    }
  }

  async cleanup(): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: CategoriesDataset.user.email },
    });

    if (user) {
      await this.prisma.category.deleteMany({ where: { userId: user.id } });
      await this.prisma.budget.deleteMany({ where: { userId: user.id } });
      await this.prisma.user.delete({ where: { id: user.id } });
    }
  }
}
