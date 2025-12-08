import { Module } from '@nestjs/common';
import { FrequenciesService } from './frequencies.service';
import { FrequenciesController } from './frequencies.controller';
import { FrequenciesRepository } from './repository/frequencies.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [FrequenciesController],
  providers: [FrequenciesService, FrequenciesRepository, PrismaService],
})
export class FrequenciesModule {}
