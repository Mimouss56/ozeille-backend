# Architecture du Projet - Backend La Pince

## Vue d'ensemble

### Structure du Monorepo

Le backend est organisé en **monorepo** avec plusieurs microservices indépendants :

```
backend/
├── apps/                           # Microservices
│   ├── users-service/             # Gestion des utilisateurs et authentification
│   └── transactions-service/      # Gestion des transactions financières
├── .github/workflows/             # CI/CD GitHub Actions
└── docs/                          # Documentation
```

### Stack Technique

- **Framework** : NestJS v11
- **Runtime** : Node.js v24
- **Langage** : TypeScript v5.7
- **Base de données** : PostgreSQL 15
- **ORM** : Prisma v7
- **Tests** : Jest v29
- **Validation** : class-validator, nestjs-zod
- **Documentation API** : Swagger (NestJS)

---

## Architecture des Services

### Structure Standard d'un Service

Chaque service suit la structure NestJS modulaire :

```
apps/<service>/
├── src/
│   ├── main.ts                    # Point d'entrée
│   ├── app.module.ts              # Module racine
│   ├── <module>/                  # Module fonctionnel
│   │   ├── <module>.module.ts    # Déclaration du module
│   │   ├── <module>.service.ts   # Logique métier (optionnel)
│   │   ├── controller/
│   │   │   └── <module>.controller.ts
│   │   ├── dto/
│   │   │   ├── create-<entity>.dto.ts
│   │   │   ├── update-<entity>.dto.ts
│   │   │   └── <entity>-response.dto.ts
│   │   ├── entities/
│   │   │   └── <entity>.entity.ts
│   │   ├── exceptions/
│   │   │   └── <entity>.<error>.exception.ts
│   │   ├── repository/
│   │   │   └── <module>.repository.ts
│   │   ├── usecases/
│   │   │   ├── <entity>.usecase.<action>.ts
│   │   │   └── ...
│   │   └── services/              # Services techniques (optionnel)
│   │       └── <module>.<feature>.service.ts
│   ├── common/                    # Code partagé
│   │   ├── dto/                   # DTOs réutilisables
│   │   ├── filters/               # Exception filters
│   │   ├── interceptors/          # Intercepteurs globaux
│   │   ├── schemas/               # Schémas Zod
│   │   └── types.ts               # Types TypeScript communs
│   ├── prisma/                    # Configuration Prisma
│   │   └── prisma.service.ts
│   └── generated/                 # Code généré (Prisma Client)
│       └── prisma/
├── prisma/
│   ├── schema.prisma              # Schéma principal
│   ├── models/                    # Modèles Prisma modulaires
│   │   ├── <module>.prisma
│   └── migrations/                # Migrations
├── test/
│   ├── ti/<module>/               # Tests d'intégration
│   │   └── *.ti.spec.ts
│   ├── e2e/<module>/              # Tests end-to-end
│   │   └── *.e2e.spec.ts
│   ├── jest-ti-e2e.json          # Config Jest TI/E2E
│   └── jest-e2e.json             # Config Jest E2E classique
├── docker/
│   ├── Dockerfile
│   └── entrypoint.sh
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## Conventions de Nommage

### Fichiers et Dossiers

#### Modules
- **Dossier** : `kebab-case` (ex: `users`, `auth`, `mailer`)
- **Fichier module** : `<module>.module.ts` (ex: `users.module.ts`)

#### Controllers
- **Fichier** : `<module>.controller.ts`
- **Classe** : `PascalCase` + suffixe `Controller` (ex: `UsersController`)
- **Décorateur** : `@Controller('<route>')` avec route au pluriel

#### DTOs (Data Transfer Objects)
- **Dossier** : `dto/` dans chaque module
- **Nommage** :
  - Création : `create-<entity>.dto.ts` → `CreateUserDto`
  - Mise à jour : `update-<entity>.dto.ts` → `UpdateUserDto`
  - Réponse : `<entity>-response.dto.ts` → `UserResponseDto`
  - Erreur : `<type>-error.dto.ts` → `ValidationErrorDto`
- **Classe** : `PascalCase` + suffixe `Dto`

#### Entities
- **Dossier** : `entities/` dans chaque module
- **Fichier** : `<entity>.entity.ts`
- **Classe** : `PascalCase` + suffixe `Entity` (ex: `UserEntity`)

#### Repositories
- **Dossier** : `repository/` dans chaque module
- **Fichier** : `<module>.repository.ts`
- **Classe** : `PascalCase` + suffixe `Repository` (ex: `UsersRepository`)

#### Use Cases
- **Dossier** : `usecases/` dans chaque module
- **Fichier** : `<entity>.usecase.<action>.ts`
- **Classe** : `PascalCase` + suffixe `Usecase` + Action
- **Exemples** :
  ```
  user.usecase.create.ts       → UserUsecaseCreate
  user.usecase.find-by.ts      → UserUsecaseFind
  users.usecase.register.ts    → UsersUsecaseRegister
  ```

#### Services
- **Fichier** : `<module>.service.ts` ou `<module>.<feature>.service.ts`
- **Classe** : `PascalCase` + suffixe `Service` (ex: `UsersService`, `MailerSendMailService`)

#### Exceptions
- **Dossier** : `exceptions/` dans chaque module
- **Fichier** : `<entity>.<description>.exception.ts`
- **Classe** : `PascalCase` + suffixe `Exception`
- **Exemples** :
  ```
  user.not-found.exception.ts              → UserNotFoundException
  user.password-doesnt-match.exception.ts  → UserPasswordDoesntMatchException
  ```

#### Tests
- **Tests unitaires** : `<nom>.spec.ts` (à côté du fichier source)
- **Tests d'intégration** : `test/ti/<module>/<nom>.ti.spec.ts`
- **Tests E2E** : `test/e2e/<module>/<nom>.e2e.spec.ts`

### Code TypeScript

#### Classes
- **PascalCase** : `UserEntity`, `CreateUserDto`, `UsersController`

#### Méthodes et Fonctions
- **camelCase** : `findById()`, `createUser()`, `validateEmail()`

#### Variables et Constantes
- **camelCase** pour variables : `userName`, `isActive`
- **SCREAMING_SNAKE_CASE** pour constantes : `MAX_ATTEMPTS`, `DATABASE_URL`

#### Interfaces
- **PascalCase** avec préfixe `I` (optionnel) : `IUserRepository` ou `UserRepository`

#### Types
- **PascalCase** : `UserCreateInput`, `PaginatedResponse<T>`

#### Enums
- **PascalCase** pour le nom, **SCREAMING_SNAKE_CASE** pour les valeurs :
  ```typescript
  enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
    GUEST = 'GUEST'
  }
  ```

---

## Bonnes Pratiques

### Organisation des Modules

#### Principe de Responsabilité Unique
Chaque module doit avoir **une seule responsabilité** :
- ✅ `users` : Gestion des utilisateurs
- ✅ `auth` : Authentification et autorisations
- ✅ `mailer` : Envoi d'emails
- ❌ `users-and-auth` : Trop de responsabilités

#### Modules Communs
Le dossier `common/` contient le code partagé entre modules :
- DTOs réutilisables (pagination, erreurs)
- Filters globaux (exceptions HTTP)
- Intercepteurs (transformation de réponses)
- Types et interfaces communs

#### Dépendances entre Modules
- Utiliser l'injection de dépendances NestJS
- Importer les modules via leurs exports
- **Éviter les imports circulaires**

### Use Cases (Clean Architecture)

#### Pourquoi des Use Cases ?
- Séparation claire entre **logique métier** et **infrastructure**
- Testabilité accrue (pas de dépendance à NestJS)
- Réutilisabilité du code métier

#### Structure d'un Use Case
```typescript
@Injectable()
export class UserUsecaseCreate {
  constructor(private readonly prisma: PrismaService) {}

  async execute(data: UserCreateInput): Promise<UserEntity> {
    // Validation métier
    // Logique métier
    // Appel à la base de données
    return user;
  }
}
```

#### Injection dans les Controllers
```typescript
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUsecase: UserUsecaseCreate,
    private readonly findUsecase: UserUsecaseFind
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.createUsecase.execute(dto);
  }
}
```

### Gestion des Erreurs

#### Exceptions Personnalisées
Créer des exceptions métier héritant de `HttpException` :

```typescript
export class UserNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`User with ID ${id} not found`);
  }
}
```

#### Exception Filters
Utiliser des filters pour formater les erreurs :

```typescript
@Catch(ZodValidationException)
export class ZodValidationFilter implements ExceptionFilter {
  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    response.status(400).json({
      statusCode: 400,
      message: 'Validation failed',
      errors: exception.getZodErrors()
    });
  }
}
```

### Validation

#### DTOs avec class-validator
```typescript
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}
```

#### DTOs avec nestjs-zod (préféré)
```typescript
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
```

### Prisma

#### Schéma Modulaire
Diviser le schéma en plusieurs fichiers dans `prisma/models/` :

```prisma
// prisma/models/users.prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

Puis importer dans `schema.prisma` :
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

include "models/users.prisma"
include "models/transactions.prisma"
```

#### PrismaService
Encapsuler le client Prisma dans un service injectable :

```typescript
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

#### Génération de Types
Générer les types TypeScript depuis Prisma :
```bash
npx prisma generate
```

Les types générés sont dans `src/generated/prisma/`.

### Tests

#### Structure des Tests

##### Tests Unitaires (`.spec.ts`)
- À côté du fichier source
- Testent une unité isolée (classe, fonction)
- Mockent toutes les dépendances

```typescript
describe('UsersService', () => {
  let service: UsersService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      }
    } as any;
    
    service = new UsersService(prisma);
  });

  it('should find user by id', async () => {
    prisma.user.findUnique.mockResolvedValue(mockUser);
    const result = await service.findById('123');
    expect(result).toEqual(mockUser);
  });
});
```

##### Tests d'Intégration (`.ti.spec.ts`)
- Dans `test/ti/<module>/`
- Testent l'interaction entre plusieurs composants
- Utilisent `@nestjs/testing` pour créer un module

```typescript
describe('UserUsecaseCreate (TI)', () => {
  let usecase: UserUsecaseCreate;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserUsecaseCreate,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    usecase = module.get<UserUsecaseCreate>(UserUsecaseCreate);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create user without password in response', async () => {
    const result = await usecase.execute(userData);
    expect(result.password).toBeUndefined();
  });
});
```

##### Tests E2E (`.e2e.spec.ts`)
- Dans `test/e2e/<module>/`
- Testent l'application complète via HTTP
- Utilisent Supertest

```typescript
describe('UsersController (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'test@test.com', password: 'password123' })
      .expect(201);
  });
});
```

#### Configuration Jest

**Imports avec alias `src/*`** dans tous les tests :

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "src/*": ["src/*"]
    }
  }
}

// package.json
{
  "jest": {
    "moduleNameMapper": {
      "^src/(.*)$": "<rootDir>/../src/$1"
    }
  }
}

// test/jest-ti-e2e.json
{
  "rootDir": ".",
  "moduleNameMapper": {
    "^src/(.*)$": "<rootDir>/../src/$1"
  }
}
```

#### Scripts npm Requis

```json
{
  "scripts": {
    "test": "jest",
    "test:ti": "jest --testPathPattern=\"test/ti/.*\\.ti\\.spec\\.ts$\" --runInBand",
    "test:ti:module": "jest --testPathPattern=\"test/ti/$MODULE/.*\\.ti\\.spec\\.ts$\" --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "test:e2e:module": "jest --testPathPattern=\"test/e2e/$MODULE/.*\\.e2e\\.spec\\.ts$\" --runInBand",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "build": "nest build"
  }
}
```

### Docker

#### Dockerfile Multi-stage
```dockerfile
# Build stage
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:24-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
CMD ["node", "dist/main"]
```

#### Entrypoint pour Migrations
```bash
#!/bin/sh
npx prisma migrate deploy
exec "$@"
```

---

## CI/CD

### Workflows GitHub Actions

#### pr-module-tests.yml
- **Déclencheur** : PR vers `develop` avec changements dans `apps/**`
- **Fonction** : Détecte les modules modifiés et lance tests ciblés
- **Optimisation** : Teste uniquement `apps/<service>/src/<module>/` modifiés

#### ci-common.yml
- **Réutilisable** : Appelé par d'autres workflows
- **Paramètres** : `service`, `modules`, `node-version`
- **Étapes** :
  1. Setup Node.js + cache npm
  2. Installation dépendances
  3. Génération Prisma Client
  4. Lint par module
  5. Tests TI séquentiels par module
  6. Tests E2E séquentiels par module
  7. Build du service

#### develop-pipeline.yml
- **Déclencheur** : Push vers `develop`
- **Fonction** : Pipeline complet (tests, build, release)

### Détection Intelligente des Modules

Le workflow détecte automatiquement les modules modifiés :

```bash
# Fichiers modifiés
apps/users-service/src/users/users.service.ts
apps/users-service/src/auth/auth.controller.ts

# Modules détectés
users, auth

# Tests lancés
test/ti/users/*.ti.spec.ts
test/ti/auth/*.ti.spec.ts
test/e2e/users/*.e2e.spec.ts
test/e2e/auth/*.e2e.spec.ts
```

### Variables d'Environnement CI

```yaml
env:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
  NODE_ENV: test
```

---

## Workflow de Développement

### 1. Créer une Branche
```bash
git checkout develop
git pull origin develop
git checkout -b feat/my-feature
```

### 2. Développer avec Tests
```bash
# Développement local
npm run start:dev

# Lancer tests d'un module
cd apps/users-service
MODULE=users npm run test:ti:module
MODULE=users npm run test:e2e:module
```

### 3. Commit et Push
```bash
git add .
git commit -m "feat: add user registration"
git push origin feat/my-feature
```

### 4. Créer une Pull Request
- Cible : `develop`
- Les workflows CI se lancent automatiquement
- Seuls les modules modifiés sont testés

### 5. Review et Merge
- Review du code
- Vérification des tests CI
- Merge dans `develop`

### 6. Déploiement
- `develop` → Tests complets + Build Docker
- Merge `develop` → `main` pour production

---

## Règles de Commit

### Format Conventional Commits

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

#### Types
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `refactor` : Refactoring sans changement fonctionnel
- `test` : Ajout ou modification de tests
- `docs` : Documentation
- `chore` : Tâches de maintenance
- `ci` : Changements CI/CD
- `perf` : Amélioration de performance

#### Exemples
```bash
feat(users): add email confirmation
fix(auth): resolve token expiration issue
refactor(transactions): extract repository pattern
test(users): add TI tests for registration
docs: update architecture documentation
ci: simplify workflow module detection
```

---

## Ressources

### Documentation Externe
- [NestJS Official Docs](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

### Documentation Interne
- [CI/CD Module Tests](./CI-MODULE-TESTS.md)
- [Workflows Architecture](./WORKFLOWS-ARCHITECTURE.md)
- [FAQ](./faq.md)

---

## Checklist Nouveau Service

Quand on crée un nouveau microservice :

- [ ] Structure des dossiers respectée
- [ ] `prisma/schema.prisma` configuré avec modèles modulaires
- [ ] `PrismaService` injectable créé
- [ ] DTOs avec validation (nestjs-zod ou class-validator)
- [ ] Exception filters globaux
- [ ] Tests : `test/ti/` et `test/e2e/`
- [ ] Configuration Jest (`jest-ti-e2e.json`)
- [ ] Scripts npm (`test:ti`, `test:ti:module`, etc.)
- [ ] Dockerfile et entrypoint
- [ ] README.md spécifique au service
- [ ] Variables d'environnement documentées

## Checklist Nouveau Module

Quand on crée un nouveau module dans un service :

- [ ] Dossier `src/<module>/` créé
- [ ] `<module>.module.ts` avec imports/exports
- [ ] Controller avec routes RESTful
- [ ] DTOs de création/update/réponse
- [ ] Entities si nécessaire
- [ ] Repository si accès base de données
- [ ] Use cases pour logique métier
- [ ] Exceptions personnalisées
- [ ] Tests unitaires (`.spec.ts`)
- [ ] Tests TI dans `test/ti/<module>/`
- [ ] Tests E2E dans `test/e2e/<module>/` (optionnel)
- [ ] Documentation Swagger (décorateurs `@Api*`)
