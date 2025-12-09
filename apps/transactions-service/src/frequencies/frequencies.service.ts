import { Injectable } from "@nestjs/common";
import { Frequency } from "src/generated/prisma/client";

import { CreateFrequencyRequest } from "./dto/create-frequency.dto";
import { UpdateFrequencyRequest } from "./dto/update-frequency.dto";
import { FrequenciesRepository } from "./repository/frequencies.repository";

@Injectable()
export class FrequenciesService {
  constructor(private readonly repository: FrequenciesRepository) {}

  create(createFrequencyRequest: CreateFrequencyRequest): Promise<Frequency> {
    return this.repository.create(createFrequencyRequest);
  }

  findAll(): Promise<Frequency[]> {
    return this.repository.getAll();
  }

  findOne(id: string): Promise<Frequency | null> {
    return this.repository.getById(id);
  }

  async update(id: string, updateFrequencyRequest: UpdateFrequencyRequest): Promise<Frequency> {
    return this.repository.updateOne(id, updateFrequencyRequest);
  }

  async remove(id: string): Promise<Frequency | null> {
    return this.repository.remove(id);
  }
}
