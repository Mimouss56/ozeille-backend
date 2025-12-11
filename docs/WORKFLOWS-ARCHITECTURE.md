# Architecture des Workflows CI/CD

## Vue d'ensemble

Le système CI/CD est organisé en workflows spécialisés qui s'activent selon le contexte (PR, push, merge).

## Workflows et leurs rôles

### 1. `pr-module-tests.yml` ⭐ Principal pour les PRs
**Déclencheur** : Pull Request vers `develop` avec changements dans `backend/apps/**`

**Responsabilités** :
- Détecte automatiquement les services et modules modifiés
- Génère une matrice dynamique de tests
- Appelle `ci-common.yml` pour chaque service/module affecté
- Exécute en parallèle les tests par service

**Exemple de matrice générée** :
```json
{
  "include": [
    {"service": "users-service", "modules": "users,auth"},
    {"service": "transactions-service", "modules": "transactions"}
  ]
}
```

### 2. `ci-common.yml` - Workflow réutilisable
**Type** : `workflow_call` (appelé par d'autres workflows)

**Paramètres** :
- `service` : nom du service (users-service, transactions-service)
- `modules` : liste des modules à tester (comma-separated) ou "all"
- `node-version` : version de Node.js (défaut: "24")

**Actions** :
1. Provisionne PostgreSQL (service GitHub Actions)
2. Installe les dépendances npm
3. Génère les clients Prisma et applique les migrations
4. Lint ciblé sur les modules spécifiés
5. Tests TI : `test/ti/<module>/*.ti.spec.ts`
6. Tests E2E : `test/e2e/<module>/*.e2e.spec.ts`
7. Build du service

**Variables d'environnement** :
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test_db`

### 3. `backend.yml` - Routage PR/Push
**Déclencheur** : 
- Push vers `develop` avec changements dans `backend/**`
- Pull Request vers `develop` avec changements dans `backend/**`

**Comportement** :
- **Sur PR** : Appelle `pr-module-tests.yml` pour tests ciblés
- **Sur push vers develop** : Laisse `develop-pipeline.yml` gérer le pipeline complet

### 4. `develop-pipeline.yml` - Pipeline complet après merge
**Déclencheur** : Push vers `develop` (après merge d'un PR)

**Responsabilités** :
1. **Audit complet** : Lint + tests de tous les services
2. **Détection changements DTO** : Vérifie `backend/apps/*/src/*/dto/*.dto.ts`
3. **Publication DTO package** (si changements détectés et NPM_TOKEN configuré)
4. **Build et push Docker images** des services
5. **Semantic Release** pour versioning automatique
6. **Merge fast-forward** vers `main` si succès

**Cas d'usage** :
- Validation finale après merge de PR
- Publication automatique des artefacts
- Préparation du déploiement en production

### 5. `pr-checks.yml` - Checks qualité additionnels
**Déclencheur** : Pull Request vers `develop`

**Responsabilités** :
- Métriques de qualité de code (complexité, code mort, etc.)
- Scan SonarQube (si `SONAR_TOKEN` configuré)
- Checks additionnels non liés aux tests fonctionnels

**Note** : Ne fait plus de détection de modules (délégué à `pr-module-tests.yml`)

### 6. Autres workflows

#### `auto-merge.yml`
- Merge automatique des PRs avec label spécifique
- Vérifie les checks requis avant merge

#### `label-automerge.yml`
- Gestion des labels pour auto-merge
- Attribue/retire labels selon critères

#### `release-backend.yml`
- Publication des releases backend
- Gestion des tags de version

## Flux de travail typique

### Scénario A : Développement d'une feature

```mermaid
graph LR
    A[Créer PR] --> B[pr-module-tests.yml]
    B --> C{Modules modifiés}
    C -->|users| D[Test users-service/users]
    C -->|auth| E[Test users-service/auth]
    C -->|transactions| F[Test transactions-service/transactions]
    D --> G[pr-checks.yml]
    E --> G
    F --> G
    G --> H{Tous passés?}
    H -->|Oui| I[✅ PR prête]
    H -->|Non| J[❌ Corrections nécessaires]
```

### Scénario B : Merge dans develop

```mermaid
graph LR
    A[Merge PR] --> B[develop-pipeline.yml]
    B --> C[Tests complets]
    C --> D[Build Docker]
    D --> E[Semantic Release]
    E --> F[Merge → main]
    F --> G[🚀 Prêt pour prod]
```

## Optimisations implémentées

### ✅ Tests ciblés par module
- Seuls les modules modifiés sont testés en PR
- Réduit le temps de feedback de ~80%
- Parallélisation par service

### ✅ Cache des dépendances
- Cache npm par service/version Node
- Accélère les builds de ~50%

### ✅ PostgreSQL as Service
- Provisionné automatiquement pour `transactions-service`
- Pas de setup Docker manuel
- Health checks intégrés

### ✅ Matrice dynamique
- Adaptation automatique selon les changements
- Pas de configuration manuelle
- Scalable pour nouveaux services

## Configuration des secrets

Secrets requis dans GitHub :

| Secret | Utilisé par | Obligatoire | Description |
|--------|-------------|-------------|-------------|
| `SONAR_TOKEN` | pr-checks.yml, develop-pipeline.yml | Non | Analyse SonarQube |
| `NPM_TOKEN` | develop-pipeline.yml | Non | Publication packages npm |
| `DOCKER_REGISTRY_TOKEN` | develop-pipeline.yml | Non | Push images Docker |

## Fichiers de configuration associés

### Par service (users-service, transactions-service)

```
backend/apps/<service>/
├── package.json              # Scripts npm + config Jest
├── tsconfig.json            # Alias TypeScript (src/*)
├── test/
│   ├── jest-e2e.json    # Config tests TI/E2E
│   ├── ti/<module>/        # Tests d'intégration
│   └── e2e/<module>/       # Tests end-to-end
```

### Scripts npm requis

```json
{
  "scripts": {
    "lint": "eslint \"{src,test}/**/*.ts\"",
    "test": "jest",
    "test:ti": "jest --testPathPattern=\"test/ti/.*\\.ti\\.spec\\.ts$\"",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "build": "nest build"
  }
}
```

## Debugging

### Voir les modules détectés
Consulter les logs du job `detect-changes` dans `pr-module-tests.yml` :
```
Changed files:
backend/apps/users-service/src/users/users.service.ts
backend/apps/users-service/src/auth/auth.controller.ts

Generated matrix: {"include":[{"service":"users-service","modules":"users,auth"}]}
```

### Tester localement la détection
```bash
cd backend
git fetch origin develop
git diff --name-only origin/develop...HEAD | grep "^backend/apps/"
```

### Exécuter les tests d'un module
```bash
cd backend/apps/users-service
npm test -- --testPathPattern="test/ti/users/.*\.ti\.spec\.ts$" --runInBand
```

## Maintenance

### Ajouter un nouveau service
1. Créer `backend/apps/<nouveau-service>/`
2. Ajouter structure de tests : `test/ti/` et `test/e2e/`
3. Configurer `package.json` avec scripts de test
4. Aucun changement workflow requis ✅ (détection automatique)

### Ajouter un nouveau module
1. Créer `backend/apps/<service>/src/<nouveau-module>/`
2. Créer `test/ti/<nouveau-module>/`
3. Créer `test/e2e/<nouveau-module>/` (optionnel)
4. Écrire tests `*.ti.spec.ts` et `*.e2e.spec.ts`
5. Aucun changement workflow requis ✅

## Métriques et monitoring

Les workflows GitHub Actions fournissent :
- Durée d'exécution par job
- Taux de succès/échec
- Logs détaillés par étape
- Artefacts de build (si configurés)

Pour monitoring avancé, intégrer :
- SonarQube pour métriques de code
- Datadog/Grafana pour métriques CI/CD
- Slack/Discord notifications
