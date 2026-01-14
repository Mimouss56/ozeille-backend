import { CreateCategoryDto } from "src/categories/dto/create-category.dto";
import { CategoriesBudgetDoesntExistException } from "src/categories/exceptions/categories.budget-does-exist.exception";
import { CategoriesRepository } from "src/categories/repository/categories.repository";
import { PrismaService } from "src/prisma/prisma.service";

describe("CategoriesRepository - create (TI)", () => {
  let repository: CategoriesRepository;
  let mockPrisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    mockPrisma = {
      category: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;
    repository = new CategoriesRepository(mockPrisma);
  });

  it("should return CategoriesBudgetDoesntExistException", async () => {
    const dto = {
      label: "Test Catégorie",
    } as CreateCategoryDto;
    let exception;
    try {
      await repository.create(dto);
    } catch (error) {
      exception = error;
    }
    expect(exception).toBeInstanceOf(CategoriesBudgetDoesntExistException);
  });

  it("doit créer une catégorie avec tous les champs attendus (cas success)", async () => {
    (mockPrisma.category.create as jest.Mock).mockResolvedValue({
      id: "cat-1",
      label: "Test Catégorie",
      budgetId: "budget-1",
      color: "#FF0000",
      userId: "user-1",
      limitAmount: 100,
    });
    const dto: CreateCategoryDto = {
      label: "Test Catégorie",
      budgetId: "budget-1",
      color: "#FF0000",
      userId: "user-1",
      limitAmount: 100,
    };
    const result = await repository.create(dto);
    expect(mockPrisma.category.create).toHaveBeenCalledWith({
      data: {
        label: "Test Catégorie",
        color: "#FF0000",
        userId: "user-1",
        limitAmount: 100,
        budget: { connect: { id: "budget-1" } },
      },
    });
    expect(result).toEqual({
      id: "cat-1",
      label: "Test Catégorie",
      budgetId: "budget-1",
      color: "#FF0000",
      userId: "user-1",
      limitAmount: 100,
    });
  });
});
