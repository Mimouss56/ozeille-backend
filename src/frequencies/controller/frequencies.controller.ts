import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiFoundResponse, ApiNotFoundResponse, ApiOkResponse } from "@nestjs/swagger";
import { ErrorResponse } from "src/common/dto/base-error.dto";
import { ValidationErrorResponse } from "src/common/dto/validation-error.dto";
import { Frequency } from "src/generated/prisma/client";



import { CreateFrequencyRequest } from "../dto/create-frequency.dto";
import { FrequencyResponse } from "../dto/frequency.dto";
import { UpdateFrequencyRequest } from "../dto/update-frequency.dto";
import { FrequenciesService } from "../services/frequencies.service";
















@Controller("api/frequencies")
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
    type: ErrorResponse,
  })
  async findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Frequency | null> {
    return this.frequenciesService.findOneById(id);
  }

  @Put(":id")
  @ApiOkResponse({
    type: FrequencyResponse,
  })
  @ApiNotFoundResponse({
    description: "The frequency with the given ID was not found",
    type: ErrorResponse,
  })
  async update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateFrequencyDto: UpdateFrequencyRequest,
  ): Promise<Frequency | null> {
    return this.frequenciesService.update(id, updateFrequencyDto);
  }

  @Delete(":id")
  @ApiOkResponse({
    type: FrequencyResponse,
  })
  @ApiNotFoundResponse({
    description: "The frequency with the given ID was not found",
    type: ErrorResponse,
  })
  async remove(@Param("id", ParseUUIDPipe) id: string): Promise<Frequency | null> {
    return this.frequenciesService.remove(id);
  }
}
