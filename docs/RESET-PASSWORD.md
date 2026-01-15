# Fonctionnalité de Réinitialisation de Mot de Passe

## Vue d'ensemble

Cette fonctionnalité implémente un flux sécurisé de réinitialisation de mot de passe en deux phases :
1. **Demande de réinitialisation** : L'utilisateur demande un lien de réinitialisation
2. **Définition du nouveau mot de passe** : L'utilisateur utilise le lien pour définir un nouveau mot de passe

## Architecture

### Endpoints API

#### 1. POST `/api/auth/forgot-password`

**Description** : Demande un lien de réinitialisation de mot de passe.

**Body** :
```json
{
  "email": "user@example.com"
}
```

**Réponse** :
```json
{
  "message": "Si ce compte existe, un email a été envoyé"
}
```

**Sécurité** : L'API retourne toujours le même message (200 OK), que l'email existe ou non, pour éviter l'énumération d'utilisateurs.

#### 2. POST `/api/auth/reset-password`

**Description** : Réinitialise le mot de passe avec le token reçu par email.

**Body** :
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "newPassword": "NewSecurePassword123!"
}
```

**Réponse (succès)** :
```json
{
  "message": "Mot de passe modifié avec succès"
}
```

**Réponse (erreur)** :
```json
{
  "statusCode": 401,
  "message": "Le lien de réinitialisation a expiré ou est invalide"
}
```

## Flux de Données

### Phase 1 : Demande de lien

```
User -> Front -> POST /auth/forgot-password { email }
  -> Back -> Recherche utilisateur en BDD
    -> Si trouvé:
       - Génère UUID token
       - Stocke dans Redis (TTL: 15 min)
       - Envoie email avec lien
    -> Si non trouvé:
       - Retourne 200 OK (sécurité)
  -> Front -> Affiche "Si ce compte existe, un email a été envoyé"
```

### Phase 2 : Nouveau mot de passe

```
User -> Clique sur lien -> Front affiche formulaire
User -> Saisit nouveau mot de passe -> POST /auth/reset-password { token, newPassword }
  -> Back -> Vérifie token dans Redis
    -> Si valide:
       - Hash le nouveau mot de passe (Argon2/bcrypt)
       - Met à jour en BDD
       - Supprime le token de Redis
       - Retourne 200 OK
    -> Si invalide/expiré:
       - Retourne 401 Unauthorized
```

## Sécurité

### Mesures implémentées

1. **Pas d'énumération d'utilisateurs** : L'API retourne toujours le même message, qu'un compte existe ou non
2. **Token unique (UUID v4)** : Chaque demande génère un token cryptographiquement sécurisé
3. **Expiration courte (15 minutes)** : Le token expire automatiquement dans Redis
4. **Usage unique** : Le token est supprimé après utilisation, empêchant sa réutilisation
5. **Hash du mot de passe** : Le nouveau mot de passe est hashé avec bcrypt (10 rounds)
6. **Validation stricte** : 
   - Email validé côté DTO
   - Token doit être un UUID v4 valide
   - Mot de passe minimum 8 caractères

### Stockage Redis

**Clé** : `reset-password-token:<UUID>`  
**Valeur** : `userId`  
**TTL** : 900 secondes (15 minutes)

Exemple :
```
reset-password-token:550e8400-e29b-41d4-a716-446655440000 -> "user-123"
```

## Email

### Template d'email de réinitialisation

L'email contient :
- Un message clair expliquant la demande
- Un bouton/lien cliquable vers le frontend
- L'URL complète en texte (fallback)
- La durée d'expiration (15 minutes)
- Un avertissement de sécurité (si non demandé, ignorer)

**Lien généré** :
```
${FRONTEND_URL}/reset-password?token=<UUID>
```

**Variables d'environnement utilisées** :
- `FRONTEND_URL` : URL du frontend (ex: https://lapince.com)
- `API_URL` : URL de l'API (fallback si FRONTEND_URL absent)

## Configuration

### Variables d'environnement

```env
# Frontend URL (pour les liens dans les emails)
FRONTEND_URL=http://localhost:5173

# Email (MailPit en dev)
MAILER_HOST=localhost
MAILER_PORT=1025
MAILER_FROM=no-reply@lapince.com

# Production: configurer un vrai SMTP
# MAILER_HOST=smtp.gmail.com
# MAILER_PORT=587
# MAILER_USER=your-email@gmail.com
# MAILER_PASSWORD=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:3000
```

### Constantes Redis

Définies dans `backend/src/auth/constants/redis.constants.ts` :

```typescript
export const REDIS_TTL = {
  // ...
  RESET_PASSWORD_TOKEN: 900, // 15 minutes
};
```

## Tests

### Tests manuels (dev)

1. **Démarrer MailPit** :
   ```bash
   cd backend
   docker-compose up -d mailpit
   ```

2. **Ouvrir MailPit** : http://localhost:8025

3. **Tester le flux complet** :
   ```bash
   # 1. Demander un lien de réinitialisation
   curl -X POST http://localhost:3000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com"}'

   # 2. Récupérer le token dans MailPit

   # 3. Réinitialiser le mot de passe
   curl -X POST http://localhost:3000/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"token":"<TOKEN>","newPassword":"NewPassword123!"}'
   ```

### Scénarios de test

- ✅ Email existant → Email envoyé, token créé
- ✅ Email inexistant → 200 OK (pas d'info révélée)
- ✅ Token valide → Mot de passe mis à jour
- ✅ Token expiré → 401 Unauthorized
- ✅ Token invalide → 401 Unauthorized
- ✅ Token déjà utilisé → 401 Unauthorized
- ✅ Validation DTO → Email invalide rejeté
- ✅ Validation DTO → Mot de passe < 8 caractères rejeté

## Fichiers modifiés/créés

### Nouveaux fichiers

- `backend/src/auth/dto/forgot-password.dto.ts`
- `backend/src/auth/dto/reset-password.dto.ts`
- `backend/docs/RESET-PASSWORD.md` (ce fichier)

### Fichiers modifiés

- `backend/src/auth/controller/auth.controller.ts` : Ajout des endpoints
- `backend/src/auth/services/auth.service.ts` : Ajout des méthodes forgotPassword() et resetPassword()
- `backend/src/auth/repository/auth.repository.ts` : Ajout des méthodes de gestion des tokens de réinitialisation
- `backend/src/auth/constants/redis.constants.ts` : Ajout du TTL pour les tokens de réinitialisation
- `backend/src/redis/entities/redis-key.entity.ts` : Ajout de RESET_PASSWORD_TOKEN
- `backend/src/mailer/services/mailer.service.ts` : Ajout de sendResetPasswordEmail()

## Frontend (à implémenter)

### Page `/forgot-password`

- Formulaire avec champ email
- Bouton "Envoyer le lien"
- Message de confirmation après soumission

### Page `/reset-password`

- Récupère le token depuis l'URL (?token=xyz)
- Formulaire avec :
  - Champ "Nouveau mot de passe"
  - Champ "Confirmer le mot de passe"
- Validation côté client (longueur, correspondance)
- Redirection vers `/login` après succès
- Gestion des erreurs (lien expiré, etc.)

## Améliorations futures

- [ ] Ajouter une limite de tentatives (rate limiting)
- [ ] Logger les tentatives de réinitialisation (audit)
- [ ] Envoyer un email de confirmation après changement de mot de passe
- [ ] Ajouter des règles de complexité du mot de passe
- [ ] Implémenter un système de blacklist pour les mots de passe communs
- [ ] Ajouter des tests unitaires et e2e
