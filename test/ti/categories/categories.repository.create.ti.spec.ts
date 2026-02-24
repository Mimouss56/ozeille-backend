import { CreateCategoryDto } from "src/categories/dto/create-category.dto";
// L'exception n'est plus levée manuellement par le repo, on peut retirer l'import ou le laisser si utilisé ailleurs
// import { CategoriesBudgetDoesntExistException } from "src/categories/exceptions/categories.budget-does-exist.exception";
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
        findFirst: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaService>;
    repository = new CategoriesRepository(mockPrisma);
  });

  it("doit créer une catégorie avec tous les champs attendus (cas success)", async () => {
    // 1. Mock du retour Prisma
    (mockPrisma.category.create as jest.Mock).mockResolvedValue({
      id: "cat-1",
      label: "Test Catégorie",
      budgetId: "budget-1",
      color: "#FF0000",
      userId: "user-1",
      limitAmount: 100,
    });

    // 2. Préparation des données
    const userId = "user-1";
    const dto: CreateCategoryDto = {
      label: "Test Catégorie",
      budgetId: "budget-1",
      color: "#FF0000",
      limitAmount: 100,
      type: "EXPENSE",
    };

    // 3. Exécution avec la NOUVELLE signature (userId, dto)
    const result = await repository.create(userId, dto);

    // 4. Vérification de l'appel Prisma (Mode Scalaire)
    expect(mockPrisma.category.create).toHaveBeenCalledWith({
      data: {
        ...dto,
        userId,
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
  it("doit trouver une catégorie par label, userId et budgetId", async () => {
    const userId = "user-1";
    const budgetId = "budget-1";
    const label = "Test Catégorie";
    const fakeCategory = {
      id: "cat-1",
      label,
      budgetId,
      color: "#FF0000",
      userId,
      limitAmount: 100,
    };
    (mockPrisma.category.findFirst as jest.Mock).mockResolvedValue(fakeCategory);
    const repo = new CategoriesRepository(mockPrisma);
    const found = await repo.findByLabelAndUserIdAndBudgetId(label, userId, budgetId);
    expect(found).toEqual(fakeCategory);
    expect(mockPrisma.category.findFirst).toHaveBeenCalledWith({ where: { label, userId, budgetId } });
  });

  it("doit retourner null si aucune catégorie ne correspond", async () => {
    (mockPrisma.category.findFirst as jest.Mock).mockResolvedValue(null);
    const repo = new CategoriesRepository(mockPrisma);
    const found = await repo.findByLabelAndUserIdAndBudgetId("label", "user", "budget");
    expect(found).toBeNull();
  });
});
