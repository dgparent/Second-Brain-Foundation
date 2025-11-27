FROM node:20-alpine AS base

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY turbo.json ./
COPY tsconfig.base.json ./

COPY apps/workers/package.json ./apps/workers/
COPY packages/*/package.json ./packages/*/

RUN pnpm install --frozen-lockfile

COPY apps/workers ./apps/workers
COPY packages ./packages

RUN pnpm --filter @sbf/workers build

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=base /app/apps/workers/dist ./dist
COPY --from=base /app/apps/workers/package.json ./
COPY --from=base /app/node_modules ./node_modules

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
