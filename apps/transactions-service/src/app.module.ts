import { Module } from "@nestjs/common";

import { TransactionsModule } from "./transactions/transactions.module";
import { FrequenciesModule } from './frequencies/frequencies.module';

@Module({
  imports: [TransactionsModule, FrequenciesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
