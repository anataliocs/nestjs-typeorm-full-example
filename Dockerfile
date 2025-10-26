# Base stage
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Dependencies stage
FROM base AS dependencies
WORKDIR /usr/src/app
COPY --chown=node:node package*.json ./
RUN pnpm install --frozen-lockfile

# Build stage
FROM dependencies AS build
COPY --chown=node:node . .
RUN pnpm run build

# Production stage
FROM base AS production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app ./
ENV NODE_ENV production
USER node
EXPOSE 3000
CMD [ "node", "dist/main.js" ]