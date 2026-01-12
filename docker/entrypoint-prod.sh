#!/bin/sh

set -e

echo "Installing dependencies"
cd /home/node/db
npm i -D typescript@5.7.3 prisma@7.0.0 dotenv
npm i @prisma/adapter-pg pg

echo "Executing migrations"
npx prisma migrate deploy

echo "Launching server"
cd /home/node/app
node main
