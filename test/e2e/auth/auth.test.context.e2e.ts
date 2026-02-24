import * as bcrypt from "bcrypt";
import { PrismaService } from "src/prisma/prisma.service";

import { AuthDataset } from "./auth.dataset.e2e";

export class AuthTestContext {
  public confirmedUserId: string;
  public unconfirmedUserId: string;

  constructor(private readonly prisma: PrismaService) {}

  async init(): Promise<void> {
    await this.cleanup(); // Nettoyage préventif

    const hashedConfirmedPassword = await bcrypt.hash(AuthDataset.confirmedUser.password, 10);
    const hashedUnconfirmedPassword = await bcrypt.hash(AuthDataset.unconfirmedUser.password, 10);

    // 1. Création de l'utilisateur confirmé (Login, 2FA)
    const confirmed = await this.prisma.user.create({
      data: {
        ...AuthDataset.confirmedUser,
        password: hashedConfirmedPassword,
        confirmedAt: new Date(),
      },
    });
    this.confirmedUserId = confirmed.id;

    // 2. Création de l'utilisateur NON confirmé (Register Confirm, Login bloqué)
    const unconfirmed = await this.prisma.user.create({
      data: {
        ...AuthDataset.unconfirmedUser,
        password: hashedUnconfirmedPassword,
        confirmedAt: null, // 👈 Pas de date de confirmation
      },
    });
    this.unconfirmedUserId = unconfirmed.id;
  }

  async cleanup(): Promise<void> {
    // Liste exhaustive des emails utilisés dans les différents tests E2E
    const emailsToDelete = [
      AuthDataset.confirmedUser.email,
      AuthDataset.unconfirmedUser.email,
      AuthDataset.registerUser.email,
      "auth.register.duplicate@example.com",
      "invalid.firstname@example.com",
      "invalid.lastname@example.com",
      "long.password@example.com",
      "not.confirmed@example.com",
    ];

    const users = await this.prisma.user.findMany({ where: { email: { in: emailsToDelete } } });
    const userIds = users.map((u) => u.id);

    if (userIds.length > 0) {
      // Suppression en cascade sécurisée
      await this.prisma.category.deleteMany({ where: { userId: { in: userIds } } });
      await this.prisma.budget.deleteMany({ where: { userId: { in: userIds } } });
      await this.prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
  }
}
