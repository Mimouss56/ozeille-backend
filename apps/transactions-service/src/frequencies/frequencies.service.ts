import { Injectable } from "@nestjs/common";
import { Frequency } from "src/generated/prisma/client";

import { CreateFrequencyDto } from "./dto/create-frequency.dto";
import { UpdateFrequencyDto } from "./dto/update-frequency.dto";
import { FrequenciesRepository } from "./repository/frequencies.repository";

@Injectable()
export class FrequenciesService {
  constructor(private readonly repository: FrequenciesRepository) {}

  create(createFrequencyDto: CreateFrequencyDto): Promise<Frequency> {
    return this.repository.create(createFrequencyDto);
  }

  findAll(): Promise<Frequency[]> {
    return this.repository.getAll();
  }

  findOne(id: string): Promise<Frequency | null> {
    return this.repository.getById(id);
  }

  update(id: string, updateFrequencyDto: UpdateFrequencyDto): Promise<Frequency> {
    return this.repository.updateOne(id, updateFrequencyDto);
  }

  async remove(id: string): Promise<Frequency | null> {
    const frequency = await this.repository.getById(id);

    if (!frequency) return null;

    return this.repository.remove(id);
  }
}
