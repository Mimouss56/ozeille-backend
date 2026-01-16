# Configuration des Tests

## Variables d'Environnement

Pour que les tests fonctionnent correctement, plusieurs services doivent être disponibles :

### Services Requis

1. **PostgreSQL** : Base de données de test
2. **Redis** : Cache et sessions
3. **Mailpit** : Serveur SMTP de test pour les emails

### Configuration Locale

Créez un fichier `.env.test` à la racine du projet (déjà ignoré par git) :

```env
# Application
NODE_ENV=test
PORT=3000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Mailer (Mailpit)
MAILER_HOST=localhost
MAILER_PORT=1025
MAILER_USER=
MAILER_PASSWORD=
MAILER_FROM=test@lapince.com

# JWT
JWT_SECRET=test-secret-key
JWT_EXPIRATION=24h

# Frontend URL
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:3000
```

## Démarrer les Services de Test

### Option 1 : Docker Compose (Recommandé)

```bash
# Démarrer tous les services nécessaires
docker-compose up -d

# Les services seront disponibles sur :
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
# - Mailpit SMTP: localhost:1025
# - Mailpit Web UI: localhost:8025
```

### Option 2 : Services Individuels

```bash
# PostgreSQL
docker run -d --name test_postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=test_db \
  -p 5432:5432 \
  postgres:17-alpine

# Redis
docker run -d --name test_redis \
  -p 6379:6379 \
  redis:8-alpine

# Mailpit
docker run -d --name test_mailpit \
  -p 1025:1025 \
  -p 8025:8025 \
  axllent/mailpit:v1.27
```

## Lancer les Tests

### Tests d'Intégration (TI)

```bash
# Tous les tests TI
npm run test:ti

# Tests TI d'un module spécifique
MODULE=auth npm run test:ti:module
MODULE=users npm run test:ti:module
```

### Tests End-to-End (E2E)

```bash
# Tous les tests E2E
npm run test:e2e

# Tests E2E d'un module spécifique
MODULE=auth npm run test:e2e:module
```

### Tests avec Couverture

```bash
npm run test:cov
```

## Vérifier les Services

### PostgreSQL
```bash
# Vérifier la connexion
docker exec test_postgres pg_isready -U postgres

# Se connecter à la base de test
docker exec -it test_postgres psql -U postgres -d test_db
```

### Redis
```bash
# Vérifier la connexion
docker exec test_redis redis-cli ping
# Devrait retourner: PONG
```

### Mailpit
```bash
# Ouvrir l'interface web
open http://localhost:8025

# Ou avec curl
curl http://localhost:8025/api/v1/messages
```

## Configuration CI/CD

Les workflows GitHub Actions sont automatiquement configurés avec ces services :

### Services Docker dans GitHub Actions

```yaml
services:
  postgres:
    image: postgres:17-alpine
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: test_db
    ports:
      - 5432:5432

  redis:
    image: redis:8-alpine
    ports:
      - 6379:6379

  mailpit:
    image: axllent/mailpit:v1.27
    ports:
      - 1025:1025
      - 8025:8025
```

### Variables d'Environnement CI/CD

```yaml
env:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
  REDIS_HOST: localhost
  REDIS_PORT: 6379
  MAILER_HOST: localhost
  MAILER_PORT: 1025
  NODE_ENV: test
```

## Dépannage

### Erreur de Connexion PostgreSQL

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution** : Vérifier que PostgreSQL est démarré et écoute sur le port 5432.

```bash
docker ps | grep postgres
```

### Erreur de Connexion Redis

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution** : Vérifier que Redis est démarré.

```bash
docker ps | grep redis
```

### Erreur de Connexion Mailpit

```
Error: connect ECONNREFUSED 127.0.0.1:1025
```

**Solution** : Vérifier que Mailpit est démarré.

```bash
docker ps | grep mailpit
# Ou démarrer Mailpit
docker run -d --name test_mailpit \
  -p 1025:1025 -p 8025:8025 \
  axllent/mailpit:v1.27
```

### Prisma Client non généré

```
Error: @prisma/client did not initialize yet
```

**Solution** : Générer le client Prisma.

```bash
npx prisma generate
```

### Migrations non appliquées

**Solution** : Appliquer les migrations.

```bash
npx prisma migrate deploy
```

## Nettoyage

### Arrêter et supprimer les conteneurs de test

```bash
# Avec Docker Compose
docker-compose down -v

# Manuellement
docker rm -f test_postgres test_redis test_mailpit

# Supprimer les volumes
docker volume prune
```

## Bonnes Pratiques

1. **Isolation des tests** : Chaque test doit nettoyer ses données après exécution
2. **Base de données de test** : Ne jamais utiliser la base de données de développement
3. **Mailpit** : Consulter l'interface web (localhost:8025) pour voir les emails envoyés pendant les tests
4. **Parallélisation** : Les tests E2E s'exécutent avec `--runInBand` pour éviter les conflits

## Ressources

- [Jest Documentation](https://jestjs.io/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Mailpit Documentation](https://github.com/axllent/mailpit)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
