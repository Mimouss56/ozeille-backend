import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from "@nestjs/common";
import { Frequency } from "src/generated/prisma/client";
import { ZodValidationPipe } from "src/pipe/ZodValidationPipe";

import { CreateFrequencyDto, createFrequencySchema } from "./dto/create-frequency.dto";
import { UpdateFrequencyDto } from "./dto/update-frequency.dto";
import { FrequenciesService } from "./frequencies.service";

@Controller("frequencies")
export class FrequenciesController {
  constructor(private readonly frequenciesService: FrequenciesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createFrequencySchema))
  create(@Body() createFrequencyDto: CreateFrequencyDto): Promise<Frequency> {
    return this.frequenciesService.create(createFrequencyDto);
  }

  @Get()
  getAll(): Promise<Frequency[]> {
    return this.frequenciesService.findAll();
  }

  @Get(":id")
  getById(@Param("id") id: string): Promise<Frequency | null> {
    return this.frequenciesService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateFrequencyDto: UpdateFrequencyDto): Promise<Frequency> {
    return this.frequenciesService.update(id, updateFrequencyDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string): Promise<Frequency | null> {
    return this.frequenciesService.remove(id);
  }
}
