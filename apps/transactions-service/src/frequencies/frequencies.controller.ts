import { Body, Controller, Delete, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
} from "@nestjs/swagger";
import { ValidationErrorResponse } from "src/common/dto/validation-error.dto";
import { Frequency } from "src/generated/prisma/client";

import { CreateFrequencyRequest } from "./dto/create-frequency.dto";
import { FrequencyResponse } from "./dto/frequency.dto";
import { UpdateFrequencyRequest } from "./dto/update-frequency.dto";
import { FrequenciesService } from "./frequencies.service";

@Controller("frequencies")
export class FrequenciesController {
  constructor(private readonly frequenciesService: FrequenciesService) {}

  @Post()
  @ApiCreatedResponse({
    description: "The frequency has been successfully created",
    type: FrequencyResponse,
  })
  @ApiBadRequestResponse({
    description: "Validation failed",
    type: ValidationErrorResponse,
  })
  create(@Body() createFrequencyDto: CreateFrequencyRequest): Promise<Frequency> {
    return this.frequenciesService.create(createFrequencyDto);
  }

  @Get()
  @ApiFoundResponse({
    description: "Frequencies found",
    type: FrequencyResponse,
  })
  @ApiNotFoundResponse({
    description: "Frequencies not found",
    type: FrequencyResponse,
  })
  async findAll(): Promise<Frequency[]> {
    return this.frequenciesService.findAll();
  }

  @Get(":id")
  @ApiFoundResponse({
    description: "Frequency found",
    type: FrequencyResponse,
  })
  @ApiNotFoundResponse({
    description: "Frequency not found",
    type: FrequencyResponse,
  })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Frequency | null> {
    const frequency = await this.frequenciesService.findOne(id);

    if (!frequency) throw new NotFoundException("The frequency with the given ID was not found");

    return frequency;
  }

  @Patch(":id")
  @ApiOkResponse({
    type: FrequencyResponse,
  })
  @ApiNotFoundResponse({
    description: "The frequency with the given ID was not found",
    type: FrequencyResponse,
  })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateFrequencyDto: UpdateFrequencyRequest,
  ): Promise<Frequency> {
    const frequency = this.frequenciesService.update(id, updateFrequencyDto);

    if (!frequency) throw new NotFoundException("The frequency with the given ID was not found");

    return frequency;
  }

  @Delete(":id")
  @ApiOkResponse({
    type: FrequencyResponse,
  })
  @ApiNotFoundResponse({
    description: "The frequency with the given ID was not found",
    type: FrequencyResponse,
  })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<Frequency | null> {
    const frequency = await this.frequenciesService.remove(id);

    if (!frequency) throw new NotFoundException("The frequency with the given ID was not found");

    return frequency;
  }
}
