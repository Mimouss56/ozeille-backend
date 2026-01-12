#!/bin/sh

set -e

echo "Moving to db directory"
cd /home/node/db

echo "Executing migrations"
npx prisma migrate deploy

echo "Launching server"
cd /home/node/app
node main
