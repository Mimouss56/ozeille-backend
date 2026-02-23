import { ConflictException } from "@nestjs/common";

import { CategoriesService } from "./categories.service";

const mockRepo = {
  findByLabelAndUserIdAndBudgetId: jest.fn(),
  create: jest.fn(),
};

describe("CategoriesService - create (TU)", () => {
  let service: CategoriesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CategoriesService(mockRepo as any);
  });

  it("doit lancer un 409 si la catégorie existe déjà pour ce budget", async () => {
    mockRepo.findByLabelAndUserIdAndBudgetId.mockResolvedValue({ id: "cat-1" });
    const ctx = {
      userId: "user-1",
      input: { label: "Test", budgetId: "budget-1" },
    };
    await expect(service.create(ctx as any)).rejects.toThrow(ConflictException);
  });

  it("doit créer la catégorie si aucune n'existe pour ce budget", async () => {
    mockRepo.findByLabelAndUserIdAndBudgetId.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue({ id: "cat-2" });
    const ctx = {
      userId: "user-1",
      input: { label: "Test", budgetId: "budget-1" },
    };
    const result = await service.create(ctx as any);
    expect(result).toEqual({ id: "cat-2" });
    expect(mockRepo.create).toHaveBeenCalledWith("user-1", ctx.input);
  });
});
