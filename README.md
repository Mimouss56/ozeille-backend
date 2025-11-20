# Backend du projet `La pince`

## Requis

- Node.js 22
- Docker
- Docker Compose

## Demarrage du projet

Le docker compose se trouve à la racine du projet. Des valeurs sont définis par défaut. 

Elles peuvent être surchargées en copiant le fichier `.env.example` par `.env` et en modifiant les valeurs.

Executer la commande suivante pour démarrer le projet :

```shell
docker-compose up
```

Pour le lancer en mode détaché :

```shell
docker-compose up -d
```

## Installation de dépendances

Pour installer de nouvelles dépendances, vous pouvez vous connecter directement dans le containeur avec la commande :

```shell
docker compose exec <container> sh
```

Sinon, vous pouvez installer directement avec la commande suivante :

```shell
docker compose exec <container> npm i <package>
```

ou `container` est le nom du conteneur et `package` le nom du package.

