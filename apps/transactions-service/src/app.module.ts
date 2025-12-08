import { Module } from "@nestjs/common";

import { TransactionsModule } from "./transactions/transactions.module";
import { BudgetsModule } from "./budgets/budgets.module";

@Module({
  imports: [TransactionsModule, BudgetsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
