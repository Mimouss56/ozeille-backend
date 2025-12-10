import { Injectable } from "@nestjs/common";
import { Frequency } from "src/generated/prisma/client";

import { CreateFrequencyRequest } from "../dto/create-frequency.dto";
import { UpdateFrequencyRequest } from "../dto/update-frequency.dto";
import { FrequenciesRepository } from "../repository/frequencies.repository";

@Injectable()
export class FrequenciesService {
  constructor(private readonly repository: FrequenciesRepository) {}

  create(createFrequencyRequest: CreateFrequencyRequest): Promise<Frequency> {
    return this.repository.create(createFrequencyRequest);
  }

  findAll(): Promise<Frequency[]> {
    return this.repository.getAll();
  }

  async findOneById(id: string): Promise<Frequency> {
    const frequency = await this.repository.getById(id);

    if (!frequency) {
      throw new Error("The frequency with the given ID was not found.");
    }

    return frequency;
  }

  async update(id: string, updateFrequencyRequest: UpdateFrequencyRequest): Promise<Frequency | null> {
    await this.findOneById(id);

    return this.repository.updateOne(id, updateFrequencyRequest);
  }

  async remove(id: string): Promise<Frequency | null> {
    await this.findOneById(id);

    return this.repository.remove(id);
  }
}
