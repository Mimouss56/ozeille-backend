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
    // Le DTO ne contient généralement PAS le userId (il vient du token)
    const dto: CreateCategoryDto = {
      label: "Test Catégorie",
      budgetId: "budget-1",
      color: "#FF0000",
      // userId: "user-1", // On l'enlève du DTO entrant pour être réaliste
      limitAmount: 100,
      userId: null,
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
});
