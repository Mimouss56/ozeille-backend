FROM node:22-alpine AS base
USER node
WORKDIR /home/node/app

FROM base AS development
WORKDIR /usr/script

COPY ./docker/entrypoint.sh ./entrypoint.sh
USER root
RUN chmod +x ./entrypoint.sh
USER node
WORKDIR /home/node/app

COPY --chown=node:node . .

EXPOSE 3000
CMD sh /usr/script/entrypoint.sh

# --- Install deps for prod ---
FROM base AS prod-deps
COPY --chown=node:node package.json .
COPY --chown=node:node package-lock.json .
RUN npm install --prod

# --- Build app for prod ---
FROM base AS build
COPY --chown=node:node . .
RUN npm install
RUN npx prisma generate
RUN npm run build

# --- Install dependencies for starting app ---
FROM base as setup
RUN npm i -D typescript@5.7.3 prisma@7.0.0 --no-audit --no-fund
RUN npm i @prisma/adapter-pg pg dotenv --no-audit --no-fund

# --- Build final --
FROM base AS production

# -- A custom script which handle all logics when service start
WORKDIR /home/node/script
COPY --chown=node:node ./docker/entrypoint-prod.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# -- Import all migrations, the config file and necessary dependencies needed for the migration
WORKDIR /home/node/db
COPY --from=setup /gome/node/app/node_modules /home/node/db/nodes_modules
COPY --from=build /home/node/app/prisma /home/node/db/prisma
COPY --from=build /home/node/app/prisma.config.ts /home/node/db/prisma.config.ts

# -- Import all necessaries files for the service
WORKDIR /home/node/app
COPY --from=prod-deps --chown=node:node /home/node/app/node_modules node_modules
COPY --from=build --chown=node:node /home/node/app/dist ./

CMD ["../script/entrypoint.sh"]
