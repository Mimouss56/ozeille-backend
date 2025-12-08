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

  findOne(id: number) {
    return `This action returns a #${id} frequency`;
  }

  update(id: number, updateFrequencyDto: UpdateFrequencyDto) {
    return `This action updates a #${id} frequency`;
  }

  remove(id: number) {
    return `This action removes a #${id} frequency`;
  }
}
