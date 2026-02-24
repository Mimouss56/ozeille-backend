import { Injectable, Logger } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const dbUrl = process.env.DATABASE_URL;
    if (process.env.NODE_ENV === "test" && dbUrl && !dbUrl.includes("localhost")) {
      throw new Error(
        "🚨 DANGER FATAL: L'application en mode 'test' essaie de se connecter à une base distante ! Rejet immédiat de la connexion.",
      );
    }

    const adapter = new PrismaPg({
      connectionString: dbUrl,
    });
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log("✅ Connexion à la base de données réussie");
    } catch (err) {
      this.logger.error("❌ Erreur de connexion à la base de données", err);
    }
  }
}
