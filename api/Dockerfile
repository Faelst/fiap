# syntax=docker/dockerfile:1
# API da FIAP School: NestJS + Prisma + SQLite (better-sqlite3).
# Build: docker build -t fiap-school-api api/   (ou docker compose up, na raiz)

ARG NODE_VERSION=24

# ---- base: Node + yarn 1 + openssl (os engines do Prisma procuram a libssl) ----
FROM node:${NODE_VERSION}-bookworm-slim AS base
# yarn 1 fixo (o mesmo do packageManager), instalado pelo npm: não depende do
# corepack nem do yarn que a imagem traga. YARN_IGNORE_PATH ignora qualquer
# yarnPath de .yarnrc herdado.
ENV YARN_IGNORE_PATH=1
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && npm install -g --force yarn@1.22.22 \
  && npm cache clean --force
WORKDIR /app

# ---- toolchain: para o better-sqlite3 compilar se não houver binário pronto ----
FROM base AS toolchain
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
# O postinstall roda `prisma generate`, que precisa do schema e do config.
COPY package.json yarn.lock prisma.config.ts ./
COPY prisma ./prisma

# ---- deps: node_modules completo, só para compilar ----
FROM toolchain AS deps
RUN yarn install --frozen-lockfile --non-interactive \
  && yarn cache clean

# ---- prod-deps: só dependencies (prisma, tsx e dotenv estão lá: migrate e seed rodam no boot) ----
FROM toolchain AS prod-deps
RUN yarn install --production --frozen-lockfile --non-interactive \
  && yarn cache clean

# ---- build: compila o Nest para dist/ ----
FROM deps AS build
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN yarn build

# ---- runtime ----
FROM base AS runtime
ENV NODE_ENV=production \
    PORT=3333 \
    DATABASE_URL=file:/app/data/fiap-school.db \
    LOG_LEVEL=info
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
# O seed (tsx prisma/seed.ts) importa o client gerado em src/generated.
COPY --from=prod-deps --chown=node:node /app/src/generated ./src/generated
COPY --chown=node:node package.json prisma.config.ts ./
COPY --chown=node:node prisma ./prisma
RUN mkdir -p /app/data && chown node:node /app/data
USER node
VOLUME ["/app/data"]
EXPOSE 3333
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 3333) + '/api/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
# migrate deploy + seed (só popula o banco vazio; SEED_RESET=true recria) e
# sobe a API. `exec` deixa o node como PID 1, recebendo o SIGTERM do `docker stop`.
CMD ["sh", "-c", "yarn -s prisma:setup && exec node dist/main"]
