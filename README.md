# Backend du projet `La Pince`

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

Backend monolithe NestJS pour l'application de gestion budgétaire "La Pince".

## 📋 Description

Application NestJS unifiée regroupant :
- **Gestion des transactions** : transactions, budgets, catégories, fréquences
- **Gestion des utilisateurs** : authentification, utilisateurs, envoi d'emails
- **Services partagés** : Prisma (PostgreSQL), Redis, Mailer

## 🔧 Requis

- Node.js 22
- Docker & Docker Compose
- PostgreSQL 17
- Redis 8

## 🚀 Démarrage du projet

### Avec Docker (Recommandé)

Le docker-compose se trouve à la racine du projet avec des valeurs par défaut.

1. Copier le fichier d'environnement :
```bash
cp .env.example .env
```

2. Modifier les variables si nécessaire, puis démarrer :
```bash
# Mode interactif
docker-compose up

# Mode détaché
docker-compose up -d
```

3. L'API sera accessible sur :
   - **API** : http://localhost:3000
   - **Swagger UI** : http://localhost:3000/api-docs
   - **Mailpit** : http://localhost:8025
   - **PostgreSQL** : localhost:5432
   - **Redis** : localhost:6379

### En local

```bash
# Installer les dépendances
npm install

# Générer le client Prisma
npm run prisma:generate

# Lancer les migrations
npm run prisma:migrate

# Démarrer en mode développement
npm run start:dev
```

## 📦 Installation de dépendances

### Dans le conteneur Docker

```bash
# Se connecter au conteneur
docker compose exec api sh

# Installer une dépendance
docker compose exec api npm i <package>
```

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests d'intégration
npm run test:ti

# Tests d'intégration d'un module spécifique
MODULE=users npm run test:ti:module

# Tests E2E
npm run test:e2e

# Tests E2E d'un module spécifique
MODULE=auth npm run test:e2e:module

# Couverture de code
npm run test:cov
```

## 🗄️ Base de données

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer une migration
npm run prisma:migrate

# Ouvrir Prisma Studio
npm run prisma:studio
```

## 📚 Scripts disponibles

```bash
npm run start          # Démarrer l'application
npm run start:dev      # Mode développement avec watch
npm run start:prod     # Mode production
npm run build          # Compiler le projet
npm run format         # Formatter le code
npm run lint           # Linter le code
```

## 🏗️ Architecture

```
src/
├── transactions/      # Module transactions
├── budgets/          # Module budgets
├── categories/       # Module catégories
├── frequencies/      # Module fréquences
├── users/            # Module utilisateurs
├── auth/             # Module authentification
├── mailer/           # Module emails
├── prisma/           # Service Prisma
├── redis/            # Service Redis
├── common/           # Filtres, intercepteurs, etc.
└── generated/        # Code généré par Prisma
```

## 🌍 Variables d'environnement

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
MAILER_FROM=noreply@lapince.com

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=24h
```

## 📖 Documentation

- [Architecture complète](docs/ARCHITECTURE.md)
- [Migration vers monolithe](MIGRATION.md)
- [Tests CI/CD](docs/CI-MODULE-TESTS.md)
- [FAQ](docs/faq.md)

## 🔗 Ressources

- [Documentation NestJS](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Discord NestJS](https://discord.gg/G7Qnnhy)

## 👥 Équipe

Projet développé par **O-clock-Pooka**

## 📝 License

UNLICENSED - Usage privé uniquement

