import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ZodSerializerInterceptor, ZodValidationPipe } from "nestjs-zod";

// User Management
import { AuthModule } from "./auth/auth.module";
// Transaction Management
import { BudgetsModule } from "./budgets/budgets.module";
import { CategoriesModule } from "./categories/categories.module";
import { FrequenciesModule } from "./frequencies/frequencies.module";
import { HealthController } from "./health/health.controller";
import { MailerModule } from "./mailer/mailer.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RedisModule } from "./redis/redis.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
      // Optionnel mais recommandé : ignorer le fichier en production (les variables sont injectées par le serveur)
      ignoreEnvFile: process.env.NODE_ENV === "production",
    }),
    PrismaModule,
    RedisModule,
    // Transaction Management
    TransactionsModule,
    BudgetsModule,
    FrequenciesModule,
    CategoriesModule,
    // User Management
    UsersModule,
    AuthModule,
    MailerModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useValue: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
