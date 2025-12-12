#!/bin/sh

echo "------------------------------------------"
echo "  Démarrage du stage de développement NestJS "
echo "------------------------------------------"

# Vérifie si le dossier node_modules existe
if [ ! -d "node_modules" ]; then
  echo "Le dossier node_modules n'existe pas. Exécution de npm install..."
  npm install
  if [ $? -ne 0 ]; then
    echo "ERREUR: npm install a échoué. Arrêt."
    exit 1
  fi
  echo "npm install terminé."
else
  echo "Le dossier node_modules existe. Vérification des dépendances avec npm install..."
  npm install || true # Utilise || true pour éviter l'échec si des warnings mineurs surviennent
  if [ $? -ne 0 ]; then
    echo "AVERTISSEMENT: npm install a rencontré des problèmes. Le serveur pourrait ne pas démarrer correctement."
  fi
  echo "Vérification des dépendances terminée."
fi

echo "Lancement du serveur NestJS en mode développement..."
# Exécute la commande de démarrage de NestJS en mode dev
# Le 'exec' est crucial pour s'assurer que les signaux d'arrêt sont transmis correctement au processus NestJS.
exec npm run start:dev

echo "------------------------------------------"
echo "  Arrêt du stage de développement NestJS "
echo "------------------------------------------"