# Adaptation des Workflows GitHub Actions

## Vue d'ensemble

Tous les workflows GitHub Actions ont été adaptés pour fonctionner avec l'architecture monolithe au lieu de l'ancienne architecture microservices.

## Changements Principaux

### Structure des Chemins

**Avant (Microservices)** :
```
apps/
├── transactions-service/
│   ├── src/
│   ├── test/
│   └── prisma/
└── users-service/
    ├── src/
    ├── test/
    └── prisma/
```

**Après (Monolithe)** :
```
src/
├── transactions/
├── budgets/
├── users/
├── auth/
└── ...
test/
├── ti/
└── e2e/
prisma/
```

### Workflows Modifiés

#### 1. `pr-module-tests.yml` & `pr-modules-tests.yml`
**Changements** :
- Détection des modules changés dans `src/<module>/` au lieu de `apps/<service>/src/<module>/`
- Exclusion des dossiers `common`, `generated`
- Matrix simplifiée : `module` au lieu de `service` + `modules`
- Appel à `ci-common.yml` avec un seul paramètre `module`

**Trigger paths** :
```yaml
paths:
  - "src/**"
  - "test/**"
  - "prisma/**"
```

#### 2. `ci-common.yml` (Workflow Réutilisable)
**Changements** :
- Input : `module` au lieu de `service` + `modules`
- Node version : 22 (au lieu de 24)
- PostgreSQL : 17-alpine (au lieu de 15-alpine)
- Redis : 8-alpine (au lieu de 7-alpine)
- Working directory : racine au lieu de `apps/${{ inputs.service }}`
- Installation : `npm ci --legacy-peer-deps`
- Tests par module individuel

**Services Docker** :
```yaml
postgres:
  image: postgres:17-alpine
redis:
  image: redis:8-alpine
```

#### 3. `pr-checks.yml`
**Changements** :
- Détection des modules dans `src/<module>/` directement
- Un seul `npm ci --legacy-peer-deps` à la racine
- Un seul Prisma generate/migrate
- Tests par module avec variables d'environnement DATABASE_URL et REDIS_*
- Cleanup de PostgreSQL et Redis

**Variables d'environnement** :
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/testdb
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### 4. `develop-pipeline.yml`
**Changements** :
- Suppression des étapes séparées pour chaque service
- Une seule étape d'installation de dépendances
- Un seul Prisma generate/migrate
- Un seul lint et un seul test
- Ajout de Redis pour les tests
- PostgreSQL 17 et Redis 8

**Étapes simplifiées** :
```yaml
- Install dependencies (unique)
- Generate Prisma Client (unique)
- Run Migrations (unique)
- Lint (global)
- Run Tests (global)
```

#### 5. `release-backend.yml`
**Changements** :
- Même structure que develop-pipeline.yml
- PostgreSQL 17 et Redis 8
- Installation unique avec `--legacy-peer-deps`
- Ajout des variables d'environnement Redis

## Modules Détectés

Le système détecte automatiquement les modules suivants dans `src/` :

### Modules de Gestion des Transactions
- `transactions`
- `budgets`
- `categories`
- `frequencies`

### Modules de Gestion des Utilisateurs
- `users`
- `auth`
- `mailer`

### Modules Partagés
- `prisma`
- `redis`

### Exclusions
- `common` (utilitaires partagés)
- `generated` (code généré par Prisma)

## Configuration des Tests

### Tests d'Intégration (TI)
```bash
npx jest --testPathPattern="test/ti/$MODULE/.*\.ti\.spec\.ts" --runInBand
```

### Tests E2E
```bash
npx jest --config ./jest-e2e.json --testPathPattern="test/e2e/$MODULE/.*\.e2e\.spec\.ts" --runInBand
```

## Variables Secrets Requises

Les workflows utilisent les secrets suivants :

- `GITHUB_TOKEN` : Token GitHub (fourni automatiquement)
- `SONAR_TOKEN` : Token SonarQube (optionnel)

## Optimisations

### Cache NPM
**Avant** :
```yaml
key: ${{ runner.os }}-npm-${{ hashFiles('apps/*/package-lock.json') }}
```

**Après** :
```yaml
key: ${{ runner.os }}-npm-${{ hashFiles('package-lock.json') }}
```

### Parallélisation
Les tests par module sont exécutés en parallèle via la matrix strategy :

```yaml
strategy:
  fail-fast: false
  matrix: ${{ fromJson(needs.detect-changes.outputs.modules-matrix) }}
```

## Commandes Docker

### PostgreSQL
```bash
docker run --name postgres_ci \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=testdb \
  -p 5432:5432 \
  -d postgres:17-alpine
```

### Redis
```bash
docker run --name redis_ci \
  -p 6379:6379 \
  -d redis:8-alpine
```

## Points d'Attention

1. **Legacy Peer Dependencies** : Utilisation de `--legacy-peer-deps` pour résoudre les conflits avec `zod-prisma`

2. **Services Docker** : PostgreSQL et Redis doivent être disponibles pour tous les tests

3. **Prisma** : Une seule génération de client pour tout le monolithe

4. **Node Version** : Node.js 22 utilisé partout

5. **Modules Partagés** : `common` et `generated` ne déclenchent pas de tests modulaires

## Workflow de Détection

```mermaid
graph TD
    A[PR créée/mise à jour] --> B[Détection des fichiers changés]
    B --> C{Changements dans src/?}
    C -->|Non| D[Pas de tests]
    C -->|Oui| E[Extraction des modules]
    E --> F[Filtrage common/generated]
    F --> G[Génération matrix JSON]
    G --> H[Tests parallèles par module]
```

## Exemples de Matrix Générée

### Changements dans users et auth
```json
{
  "include": [
    {"module": "users"},
    {"module": "auth"}
  ]
}
```

### Changements dans transactions uniquement
```json
{
  "include": [
    {"module": "transactions"}
  ]
}
```

## Migration Checklist

- ✅ pr-module-tests.yml adapté
- ✅ pr-modules-tests.yml adapté
- ✅ ci-common.yml adapté
- ✅ pr-checks.yml adapté
- ✅ develop-pipeline.yml adapté
- ✅ release-backend.yml adapté
- ✅ PostgreSQL 17 utilisé
- ✅ Redis 8 utilisé
- ✅ Node 22 utilisé
- ✅ Cache NPM adapté
- ✅ Variables d'environnement mises à jour

## Tests Locaux des Workflows

Pour tester localement avec [act](https://github.com/nektos/act) :

```bash
# Tester pr-checks
act pull_request -j pr-checks

# Tester develop-pipeline
act push -j full-audit
```
