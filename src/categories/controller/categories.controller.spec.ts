import { Test, TestingModule } from "@nestjs/testing";
import { RequestContext } from "src/common/interfaces/request-context.interface";

import { CreateCategoryRequest } from "../dto/create-category.dto";
import { UpdateCategoryRequest } from "../dto/update-category.dto";
import { CategoriesService } from "../services/categories.service";
import { CategoriesController } from "./categories.controller";

describe("CategoriesController", () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  // Mock du Service
  const mockCategoriesService = {
    findAll: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Mock du Contexte (l'utilisateur connecté)
  const mockCtx = {
    userId: "user-123",
    input: {}, // Sera surchargé selon les tests
  } as RequestContext<unknown>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of categories", async () => {
      const result = [{ id: "cat-1", label: "Food", userId: "user-123" }];
      mockCategoriesService.findAll.mockResolvedValue(result);

      expect(await controller.findAll(mockCtx)).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith(mockCtx);
    });
  });

  describe("create", () => {
    it("should create a category", async () => {
      const dto: CreateCategoryRequest = {
        label: "New Cat",
        color: "#FFF",
        budgetId: "budget-1",
        limitAmount: 100,
      };

      const ctxWithInput = { ...mockCtx, input: dto };
      const createdCategory = { id: "cat-1", ...dto };

      mockCategoriesService.create.mockResolvedValue(createdCategory);

      expect(await controller.create(dto, ctxWithInput)).toBe(createdCategory);
      // On vérifie que le service a bien reçu le contexte
      expect(service.create).toHaveBeenCalledWith(ctxWithInput);
    });
  });

  describe("findOne", () => {
    it("should return a single category", async () => {
      const result = { id: "cat-1", label: "Food" };
      mockCategoriesService.findOne.mockResolvedValue(result);

      expect(await controller.findOne("cat-1", mockCtx)).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(mockCtx, "cat-1");
    });
  });

  describe("update", () => {
    it("should update a category", async () => {
      const dto: UpdateCategoryRequest = {
        label: "Updated Food",
        color: "#000",
        limitAmount: 200,
      };
      const ctxWithInput = { ...mockCtx, input: dto };
      const result = { id: "cat-1", ...dto };

      mockCategoriesService.update.mockResolvedValue(result);

      expect(await controller.update("cat-1", dto, ctxWithInput)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(ctxWithInput, "cat-1");
    });
  });

  describe("remove", () => {
    it("should remove a category", async () => {
      const result = { id: "cat-1", label: "Deleted" };
      mockCategoriesService.remove.mockResolvedValue(result);

      expect(await controller.remove("cat-1", mockCtx)).toBe(result);
      expect(service.remove).toHaveBeenCalledWith(mockCtx, "cat-1");
    });
  });
});
