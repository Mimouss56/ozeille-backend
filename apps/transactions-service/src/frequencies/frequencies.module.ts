import { Module } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

import { FrequenciesController } from "./controller/frequencies.controller";
import { FrequenciesRepository } from "./repository/frequencies.repository";
import { FrequenciesService } from "./services/frequencies.service";

@Module({
  controllers: [FrequenciesController],
  providers: [FrequenciesService, FrequenciesRepository, PrismaService],
})
export class FrequenciesModule {}
