import { Injectable } from "@nestjs/common";

import { Frequency } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateFrequencyDto } from "../dto/create-frequency.dto";

@Injectable()
export class FrequenciesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Frequency[]> {
    return this.prisma.frequency.findMany();
  }

  async create(frequency: CreateFrequencyDto): Promise<Frequency> {
    return this.prisma.frequency.create({ data: frequency });
  }
}
