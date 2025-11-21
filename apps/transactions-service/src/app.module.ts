import { Module } from '@nestjs/common';
import { TransactionsModule } from './transactions/transactions.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [TransactionsModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
