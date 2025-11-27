FROM node:20-alpine AS base

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY turbo.json ./
COPY tsconfig.base.json ./

COPY apps/auth-service/package.json ./apps/auth-service/
COPY packages/*/package.json ./packages/*/

RUN pnpm install --frozen-lockfile

COPY apps/auth-service ./apps/auth-service
COPY packages ./packages

RUN pnpm --filter @sbf/auth-service build

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=base /app/apps/auth-service/dist ./dist
COPY --from=base /app/apps/auth-service/package.json ./
COPY --from=base /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/index.js"]
