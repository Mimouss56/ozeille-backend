# Tests Modulaires CI/CD

## Vue d'ensemble

Le système CI/CD détecte automatiquement les modules modifiés dans un PR et exécute uniquement les tests pertinents (TI et E2E) pour ces modules.

## Structure des tests

```
backend/apps/<service>/
├── src/
│   ├── <module>/          # Module
├── test/
│   ├── ti/             # Tests d'intégration (TI)
│   │   ├── <module>/
│   │   │   ├── *.ti.spec.ts
│   └── e2e/            # Tests end-to-end
│       ├── <module>/
│       │   └── *.e2e.spec.ts
```

## Déclenchement des tests

### Sur Pull Request vers `develop`

Lorsqu'un PR cible `develop`, le workflow `.github/workflows/pr-module-tests.yml` :

1. **Détecte les changements** : Analyse les fichiers modifiés dans `backend/apps/<service>/src/<module>/`
2. **Identifie les modules** : Crée une liste des modules affectés par service
3. **Exécute les tests ciblés** :
   - Tests TI : `<service>/test/ti/<module>/*.ti.spec.ts`
   - Tests E2E : `<service>/test/e2e/<module>/*.e2e.spec.ts`

### Exemples de déclenchement

#### Cas 1 : Modification d'un seul module
```bash
# Fichiers modifiés :
backend/apps/users-service/src/users/users.service.ts
backend/apps/users-service/src/users/dto/create-user.dto.ts
```
**Résultat** : Lance uniquement les tests pour le module `users` du service `users-service`
- `users-service/test/ti/users/*.ti.spec.ts`
- `users-service/test/e2e/users/*.e2e.spec.ts`

#### Cas 2 : Modification de plusieurs modules
```bash
# Fichiers modifiés :
backend/apps/users-service/src/users/users.service.ts
backend/apps/users-service/src/auth/auth.controller.ts
```
**Résultat** : Lance les tests pour les modules `users` et `auth`
- `test/ti/users/*.ti.spec.ts` + `test/ti/auth/*.ti.spec.ts`
- `test/e2e/users/*.e2e.spec.ts` + `test/e2e/auth/*.e2e.spec.ts`

#### Cas 3 : Modification de fichiers de configuration
```bash
# Fichiers modifiés :
backend/apps/users-service/package.json
backend/apps/users-service/tsconfig.json
```
**Résultat** : Lance **tous les tests** du service (mode `all`)

#### Cas 4 : Modification de plusieurs services
```bash
# Fichiers modifiés :
backend/apps/users-service/src/users/users.service.ts
backend/apps/transactions-service/src/transactions/transactions.service.ts
```
**Résultat** : Lance les tests en parallèle :
- Service `users-service` → module `users`
- Service `transactions-service` → module `transactions`

## Scripts npm disponibles

Chaque service (users-service, transactions-service) dispose des scripts suivants :

```bash
# Tous les tests unitaires
npm test

# Tests TI uniquement (tous les modules)
npm run test:ti

# Tests TI pour un module spécifique
MODULE=users npm run test:ti:module

# Tests E2E classiques (tous les modules)
npm run test:e2e

# Tests E2E pour un module spécifique
MODULE=auth npm run test:e2e:module

# Build du service
npm run build

# Lint
npm run lint
```

### Configuration requise dans package.json

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
  },
  "jest": {
    "moduleNameMapper": {
      "^src/(.*)$": "<rootDir>/../src/$1"
    }
  }
}
```

## Bonnes pratiques

### Nommage des fichiers de tests

- **Tests d'intégration (TI)** : `<nom>.ti.spec.ts`
- **Tests E2E** : `<nom>.e2e.spec.ts`
- **Tests unitaires** : `<nom>.spec.ts`

### Organisation par module

Placez toujours les tests dans le dossier correspondant au module :
```
test/ti/<module>/<fichier>.ti.spec.ts
test/e2e/<module>/<fichier>.e2e.spec.ts
```

### Imports avec alias

Utilisez toujours l'alias `src/*` dans vos tests :
```typescript
import { UserService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma/prisma.service';
```

Ceci est configuré dans :
- `tsconfig.json` : `"paths": { "src/*": ["src/*"] }`
- `package.json` (section jest) : `"moduleNameMapper": { "^src/(.*)$": "<rootDir>/../src/$1" }`

## Workflows GitHub Actions

### pr-module-tests.yml
**Déclenché par** : Pull Request vers `develop` avec changements dans `backend/apps/**`

**Étapes** :
1. Détecte les services et modules modifiés via `git diff`
2. Génère une matrice JSON avec les services/modules à tester
3. Lance `ci-common.yml` pour chaque entrée de la matrice en parallèle

### ci-common.yml (workflow réutilisable)
**Paramètres** :
- `service` (required) : nom du service (ex: users-service)
- `modules` (optional, default: "all") : liste comma-separated des modules
- `node-version` (optional, default: "24") : version de Node.js

**Étapes** :
1. Provisionne PostgreSQL 15-alpine (service container)
2. Setup Node.js et cache des dépendances
3. Installation des dépendances (`npm ci`)
4. Génération du client Prisma et migrations
5. Lint ciblé sur les modules spécifiés
6. Tests TI via `npm run test:ti` ou `npm run test:ti:module`
7. Tests E2E via `npm run test:e2e` ou `npm run test:e2e:module`
8. Build du service via `npm run build`

**Variables d'environnement** :
```yaml
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
```

## Débogage

### Voir les modules détectés

Les logs GitHub Actions affichent dans le job `detect-changes` :
```
Changed files:
backend/apps/users-service/src/users/users.service.ts
backend/apps/users-service/src/auth/auth.controller.ts

Generated matrix: {"include":[{"service":"users-service","modules":"users,auth"}]}
```

### Tester localement

```bash
# Simuler la détection de modules
cd backend
git diff --name-only origin/develop...HEAD | grep "^backend/apps/"

# Lancer les tests d'un module spécifique
cd apps/users-service
MODULE=users npm run test:ti:module
MODULE=users npm run test:e2e:module

# Lancer tous les tests TI
npm run test:ti

# Lancer tous les tests E2E
npm run test:e2e
```

### Vérifier la configuration Jest

```bash
# Afficher la config Jest résolue
cd apps/users-service
npx jest --showConfig

# Vérifier le module mapper
cat package.json | grep -A 5 "moduleNameMapper"
```

### Problèmes courants

#### Erreur "Cannot find module 'src/...'"
- Vérifier `tsconfig.json` : doit contenir `"paths": { "src/*": ["src/*"] }`
- Vérifier `package.json` : doit contenir `"moduleNameMapper": { "^src/(.*)$": "<rootDir>/../src/$1" }`

#### Tests non détectés
- Vérifier le nommage : `*.ti.spec.ts` pour TI, `*.e2e.spec.ts` pour E2E
- Vérifier l'emplacement : `test/ti/<module>/` ou `test/e2e/<module>/`

#### PostgreSQL non disponible en local
- Utiliser Docker : `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:15-alpine`
- Ou configurer `DATABASE_URL` vers une autre instance