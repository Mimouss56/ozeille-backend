import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ZodSerializerInterceptor, ZodValidationPipe } from "nestjs-zod";

import { BudgetsModule } from "./budgets/budgets.module";
import { CategoriesModule } from "./categories/categories.module";
import { FrequenciesModule } from "./frequencies/frequencies.module";
import { TransactionsModule } from "./transactions/transactions.module";

@Module({
  imports: [TransactionsModule, BudgetsModule, FrequenciesModule, CategoriesModule],
  controllers: [],
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
