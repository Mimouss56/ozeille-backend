import { Injectable } from '@nestjs/common';
import { CreateFrequencyDto } from './dto/create-frequency.dto';
import { UpdateFrequencyDto } from './dto/update-frequency.dto';
import { FrequenciesRepository } from './repository/frequencies.repository';

@Injectable()
export class FrequenciesService {
  constructor(private readonly repository: FrequenciesRepository) { }
  
  create(createFrequencyDto: CreateFrequencyDto) {
    return this.repository.create(createFrequencyDto);
  }

  findAll() {
    return this.repository.getAll();
  }

  findOne(id: string) {
    return this.repository.findOne(id);
  }

  update(id: string, updateFrequencyDto: UpdateFrequencyDto) {
    return this.repository.update(id, updateFrequencyDto);
  }

  remove(id: string) {
    return this.repository.remove(id);
  }
}
