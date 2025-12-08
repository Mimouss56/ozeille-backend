import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes } from '@nestjs/common';
import { FrequenciesService } from './frequencies.service';
import { CreateFrequencyDto, createFrequencySchema } from './dto/create-frequency.dto';
import { UpdateFrequencyDto } from './dto/update-frequency.dto';
import { ZodValidationPipe } from 'src/pipe/ZodValidationPipe';
import { Frequency } from 'src/generated/prisma/client';

@Controller('frequencies')
export class FrequenciesController {
  constructor(private readonly frequenciesService: FrequenciesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createFrequencySchema))
  create(@Body() createFrequencyDto: CreateFrequencyDto): Promise<Frequency> {
    return this.frequenciesService.create(createFrequencyDto);
  }

  @Get()
  findAll() {
    return this.frequenciesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.frequenciesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFrequencyDto: UpdateFrequencyDto) {
    return this.frequenciesService.update(id, updateFrequencyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.frequenciesService.remove(id);
  }
}
