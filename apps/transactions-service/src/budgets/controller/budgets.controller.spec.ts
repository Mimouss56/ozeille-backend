import { Test, TestingModule } from "@nestjs/testing";

import { BudgetsService } from "../services/budgets.service";
import { BudgetsController } from "./budgets.controller";

describe("BudgetsController", () => {
  let controller: BudgetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetsController],
      providers: [BudgetsService],
    }).compile();

    controller = module.get<BudgetsController>(BudgetsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
