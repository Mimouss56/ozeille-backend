import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

import { FrequenciesController } from "./frequencies.controller";
import { FrequenciesService } from "./frequencies.service";
import { FrequenciesRepository } from "./repository/frequencies.repository";

@Module({
  controllers: [FrequenciesController],
  providers: [FrequenciesService, FrequenciesRepository, PrismaService],
})
export class FrequenciesModule {}
