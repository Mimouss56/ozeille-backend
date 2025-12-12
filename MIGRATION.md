# Migration vers Architecture Monolithe

## Vue d'ensemble

Ce document décrit la migration de deux microservices NestJS (`transactions-service` et `users-service`) vers une architecture monolithe unifiée.

## Objectifs

1. ✅ **Base de données unique** : Fusion des deux bases PostgreSQL en une seule
2. ✅ **package.json unifié** : Un seul fichier de dépendances pour tout le backend
3. ✅ **Infrastructure Docker unifiée** : Un seul Dockerfile et docker-compose.yaml

## Architecture Finale

```
backend/
├── src/
│   ├── app.module.ts          # Module racine unifié
│   ├── main.ts                # Point d'entrée de l'application
│   ├── transactions/          # Module transactions
│   ├── budgets/               # Module budgets
│   ├── categories/            # Module categories
│   ├── frequencies/           # Module frequencies
│   ├── users/                 # Module users
│   ├── auth/                  # Module auth
│   ├── mailer/                # Module mailer
│   ├── prisma/                # Module prisma (service partagé)
│   ├── redis/                 # Module redis (service partagé)
│   ├── common/                # Modules communs (filters, interceptors, etc.)
│   └── generated/             # Code généré par Prisma
│       ├── prisma/            # Client Prisma
│       └── zod/               # Schémas Zod
├── prisma/
│   ├── schema.prisma          # Schéma unifié
│   ├── migrations/            # Migrations fusionnées
│   └── models/                # Modèles Prisma
├── test/
│   ├── ti/                    # Tests d'intégration
│   └── e2e/                   # Tests End-to-End
├── docker/
│   ├── Dockerfile             # Image Docker unifiée
│   ├── entrypoint.sh          # Script de démarrage dev
│   └── entrypoint-prod.sh     # Script de démarrage prod
├── package.json               # Dépendances unifiées
├── docker-compose.yaml        # Composition Docker unifiée
└── prisma.config.ts           # Configuration Prisma

```

## Modules Fusionnés

### Services de Gestion des Transactions
- `TransactionsModule` : Gestion des transactions financières
- `BudgetsModule` : Gestion des budgets
- `CategoriesModule` : Gestion des catégories
- `FrequenciesModule` : Gestion des fréquences

### Services de Gestion des Utilisateurs
- `UsersModule` : Gestion des utilisateurs
- `AuthModule` : Authentification et autorisation
- `MailerModule` : Envoi d'emails

### Services Partagés
- `PrismaModule` : Accès à la base de données (partagé globalement)
- `RedisModule` : Cache et sessions (partagé globalement)

## Modifications Principales

### 1. Base de Données

**Avant** :
- `users-db` (PostgreSQL) : 5432
- `transactions-db` (PostgreSQL) : 7002

**Après** :
- `db` (PostgreSQL) : 5432
- Une seule base de données : `lapince_db`
- Tous les modèles fusionnés dans `prisma/schema.prisma`

### 2. Configuration Docker

**Avant** :
```yaml
services:
  users-api: ...
  users-db: ...
  transactions-api: ...
  transactions-db: ...
  redis: ...
  mailpit: ...
```

**Après** :
```yaml
services:
  api:          # API unifiée
  db:           # Base de données unique
  redis:        # Cache
  mailpit:      # Serveur mail de développement
```

### 3. Variables d'Environnement

**Avant** :
- `USERS_API_PORT`, `USERS_DB_*`
- `TRANSACTIONS_API_PORT`, `TRANSACTIONS_DB_*`

**Après** :
```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://lapince:lapince@localhost:5432/lapince_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Mailer
MAILER_HOST=localhost
MAILER_PORT=1025
```

### 4. Dépendances

**Nouvelles dépendances ajoutées** :
- `bcrypt` : Hash des mots de passe
- `ioredis` : Client Redis
- `nodemailer` : Envoi d'emails
- `@nestjs/config` : Configuration centralisée
- `class-transformer` & `class-validator` : Validation
- `uuid` : Génération d'identifiants uniques

## Schéma Prisma Unifié

Le schéma Prisma fusionne tous les modèles des deux services :

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

generator zod {
  provider = "zod-prisma"
  output   = "../src/generated/zod"
}

datasource db {
  provider = "postgresql"
}

// Modèles de transactions-service
model Budget { ... }
model Category { ... }
model Frequency { ... }
model Transaction { ... }

// Modèles de users-service
model User { ... }
```

## Tests

Les tests des deux services ont été fusionnés :

- **Tests TI** : `test/ti/{auth,users,mailer,transactions,budgets,categories,frequencies}/`
- **Tests E2E** : `test/e2e/{auth,users,transactions}/`

## Scripts NPM

```json
{
  "start": "nest start",
  "start:dev": "npx prisma generate && nest start --watch",
  "start:prod": "node dist/main",
  "test": "jest",
  "test:ti": "jest --testPathPattern=\"test/ti/.*\\.ti\\.spec\\.ts$\" --runInBand",
  "test:e2e": "jest --config ./test/jest-e2e.json",
  "prisma:generate": "npx prisma generate",
  "prisma:migrate": "npx prisma migrate dev",
  "prisma:studio": "npx prisma studio"
}
```

## Démarrage

### Développement avec Docker

```bash
# Démarrer tous les services
docker-compose up

# L'API sera accessible sur http://localhost:3000
# Swagger UI : http://localhost:3000/api-docs
# Mailpit : http://localhost:8025
```

### Développement Local

```bash
# Installer les dépendances
npm install --legacy-peer-deps

# Générer le client Prisma
npm run prisma:generate

# Lancer les migrations
npm run prisma:migrate

# Démarrer l'application
npm run start:dev
```

## Prochaines Étapes

1. ✅ Fusionner les schémas Prisma
2. ⏳ Migrer les données existantes (si nécessaire)
3. ⏳ Exécuter tous les tests
4. ⏳ Supprimer l'ancien dossier `apps/`
5. ⏳ Mettre à jour la documentation

## Notes Importantes

- **Compatibilité des dépendances** : Utiliser `--legacy-peer-deps` pour résoudre les conflits de peer dependencies (notamment avec `zod-prisma`)
- **Prisma v7** : La propriété `url` dans le datasource n'est plus supportée dans le schema.prisma ; elle doit être définie dans `prisma.config.ts`
- **Port par défaut** : L'application écoute maintenant sur le port 3000 (au lieu de 3000 pour users et 3001 pour transactions)

## Avantages de l'Architecture Monolithe

1. **Simplification** : Un seul projet, une seule base de données
2. **Performance** : Pas de latence réseau entre services
3. **Transactions** : Transactions de base de données atomiques entre tous les modules
4. **Déploiement** : Un seul conteneur Docker à déployer
5. **Développement** : Plus simple à développer et déboguer localement
