import { Test, TestingModule } from '@nestjs/testing';
import { FrequenciesController } from './frequencies.controller';
import { FrequenciesService } from './frequencies.service';

describe('FrequenciesController', () => {
  let controller: FrequenciesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FrequenciesController],
      providers: [FrequenciesService],
    }).compile();

    controller = module.get<FrequenciesController>(FrequenciesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
