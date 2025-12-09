import { Injectable } from "@nestjs/common";

import { Frequency } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateFrequencyRequest } from "../dto/create-frequency.dto";
import { UpdateFrequencyRequest } from "../dto/update-frequency.dto";

@Injectable()
export class FrequenciesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<Frequency[]> {
    return this.prisma.frequency.findMany();
  }

  async create(frequency: CreateFrequencyRequest): Promise<Frequency> {
    return this.prisma.frequency.create({ data: frequency });
  }

  async getById(id: string): Promise<Frequency | null> {
    return this.prisma.frequency.findUnique({
      where: {
        id,
      },
    });
  }

  async updateOne(id: string, frequency: UpdateFrequencyRequest): Promise<Frequency> {
    return this.prisma.frequency.update({
      where: { id },
      data: frequency,
    });
  }

  async remove(id: string): Promise<Frequency | null> {
    return this.prisma.frequency.delete({
      where: {
        id,
      },
    });
  }
}
