import { Test, TestingModule } from "@nestjs/testing";

import { FrequenciesService } from "../services/frequencies.service";
import { FrequenciesController } from "./frequencies.controller";

describe("FrequenciesController", () => {
  let controller: FrequenciesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FrequenciesController],
      providers: [FrequenciesService],
    }).compile();

    controller = module.get<FrequenciesController>(FrequenciesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
