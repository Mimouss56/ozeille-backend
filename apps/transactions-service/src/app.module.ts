import { Module } from "@nestjs/common";

import { TransactionsModule } from "./transactions/transactions.module";

import { BudgetsModule } from "./budgets/budgets.module";
import { FrequenciesModule } from './frequencies/frequencies.module';

@Module({
  imports: [TransactionsModule, BudgetsModule, FrequenciesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
