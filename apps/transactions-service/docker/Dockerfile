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
RUN npm run build

# --- Build final --
FROM base AS production
COPY --from=prod-deps /home/node/app/node_modules node_modules
COPY --from=build /home/node/app/dist dist
CMD ["node", "dist/main" ]