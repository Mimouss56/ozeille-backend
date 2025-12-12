import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
// Transaction Management
import { BudgetsModule } from './budgets/budgets.module';
import { CategoriesModule } from './categories/categories.module';
import { FrequenciesModule } from './frequencies/frequencies.module';
import { TransactionsModule } from './transactions/transactions.module';
// User Management
import { AuthModule } from './auth/auth.module';
import { MailerModule } from './mailer/mailer.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
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
