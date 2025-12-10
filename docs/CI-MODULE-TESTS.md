# Tests Modulaires CI/CD

## Vue d'ensemble

Le système CI/CD détecte automatiquement les modules modifiés dans un PR et exécute uniquement les tests pertinents (TI et E2E) pour ces modules.

## Structure des tests

```
backend/apps/<service>/
├── src/
│   ├── users/          # Module users
│   ├── auth/           # Module auth
│   └── mailer/         # Module mailer
├── test/
│   ├── ti/             # Tests d'intégration (TI)
│   │   ├── users/
│   │   │   ├── user.usecase.create.ti.spec.ts
│   │   │   └── user.usecase.find.ti.spec.ts
│   │   ├── auth/
│   │   └── mailer/
│   └── e2e/            # Tests end-to-end
│       ├── users/
│       │   └── users.e2e.spec.ts
│       └── auth/
```

## Déclenchement des tests

### Sur Pull Request vers `develop`

Lorsqu'un PR cible `develop`, le workflow `.github/workflows/pr-module-tests.yml` :

1. **Détecte les changements** : Analyse les fichiers modifiés dans `backend/apps/<service>/src/<module>/`
2. **Identifie les modules** : Crée une liste des modules affectés par service
3. **Exécute les tests ciblés** :
   - Tests TI : `test/ti/<module>/*.ti.spec.ts`
   - Tests E2E : `test/e2e/<module>/*.e2e.spec.ts`

### Exemples de déclenchement

#### Cas 1 : Modification d'un seul module
```bash
# Fichiers modifiés :
backend/apps/users-service/src/users/users.service.ts
backend/apps/users-service/src/users/dto/create-user.dto.ts
```
**Résultat** : Lance uniquement les tests pour le module `users` du service `users-service`
- `test/ti/users/*.ti.spec.ts`
- `test/e2e/users/*.e2e.spec.ts`

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

### users-service

```bash
# Tous les tests unitaires
npm test

# Tests TI uniquement
npm run test:ti

# Tests TI pour un module spécifique
MODULE=users npm run test:ti:module

# Tests E2E pour un module spécifique
MODULE=auth npm run test:e2e:module

# Tests E2E classiques
npm run test:e2e
```

## Configuration Jest

### Tests unitaires classiques
Utilise la config dans `package.json` (section `jest`)

### Tests TI/E2E
Utilise `test/jest-ti-e2e.json` pour :
- Timeout plus long (30s)
- Patterns de fichiers `*.ti.spec.ts` et `*.e2e.spec.ts`
- Résolution des alias `src/*`

## Workflows GitHub Actions

### `.github/workflows/pr-module-tests.yml`
- **Trigger** : Pull Request vers `develop` avec changements dans `backend/apps/**`
- **Job `detect-changes`** : Détecte les services et modules modifiés
- **Job `test-modules`** : Exécute les tests via matrice dynamique

### `.github/workflows/ci-common.yml`
- Workflow réutilisable appelé par `pr-module-tests.yml`
- Reçoit en paramètres :
  - `service` : nom du service à tester
  - `modules` : liste des modules (ou `"all"`)
  - `node-version` : version de Node.js
- Provisionne Postgres automatiquement si nécessaire
- Exécute lint, tests TI, tests E2E, et build

## Services avec base de données

Le service `transactions-service` nécessite PostgreSQL pour les tests. Le workflow provisionne automatiquement :
- Service Docker `postgres:15-alpine`
- Base de données `test_db`
- Credentials : `postgres/postgres`
- Variables d'environnement `DATABASE_URL` configurées automatiquement

Prisma est automatiquement initialisé :
```bash
npx prisma generate
npx prisma migrate deploy
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

## Débogage

### Voir les modules détectés

Les logs GitHub Actions affichent :
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

# Lancer les tests d'un module
cd apps/users-service
npm test -- --testPathPattern="test/ti/users/.*\.ti\.spec\.ts$" --runInBand
```

## Optimisations futures

- [ ] Cache des dépendances npm entre jobs
- [ ] Parallélisation des tests au niveau module (actuellement par service)
- [ ] Intégration SonarQube pour analyse de couverture par module
- [ ] Notifications Slack/Discord avec détails des modules testés
