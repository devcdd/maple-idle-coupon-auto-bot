# Multi-stage build for the entire monorepo

# Base stage with pnpm
FROM node:24-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

# Dependencies stage - install all deps
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/server/package.json ./packages/server/
COPY packages/client/package.json ./packages/client/
RUN pnpm install --frozen-lockfile --ignore-scripts

# Server build stage
FROM deps AS build-server
COPY packages/server/src ./packages/server/src
COPY packages/server/tsconfig*.json ./packages/server/
COPY packages/server/nest-cli.json ./packages/server/
COPY packages/server/.swcrc ./packages/server/
WORKDIR /app/packages/server
RUN pnpm build

# Client build stage
FROM deps AS build-client
COPY packages/client/src ./packages/client/src
COPY packages/client/public ./packages/client/public
COPY packages/client/index.html ./packages/client/
COPY packages/client/vite.config.ts ./packages/client/
COPY packages/client/tsconfig*.json ./packages/client/
WORKDIR /app/packages/client
RUN pnpm build

# Production stage - final lightweight image
FROM node:24-alpine AS production

# Install pnpm and curl for healthcheck
RUN npm install -g pnpm && apk add --no-cache curl

WORKDIR /app

# Copy built server
COPY --from=build-server /app/packages/server/dist ./packages/server/dist
COPY --from=build-server /app/packages/server/package.json ./packages/server/

# Copy built client
COPY --from=build-client /app/packages/client/dist ./packages/client/dist

# Copy package files for dependency installation
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/server/package.json ./packages/server/

# Install only production dependencies
WORKDIR /app/packages/server
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV SERVER_PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["pnpm", "start:prod"]
