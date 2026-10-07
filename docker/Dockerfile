# SCAYLE Storefront Application Dockerfile for Node runtime

# Build
FROM node:24.17.0-alpine3.23@sha256:7c078d435026a97c8ff97b00d70e2f6ec6298a440e25a9485a9af414d5d37009 AS build

ARG VERSION
ARG GIT_REPOSITORY_URL
ARG GIT_COMMIT_SHA

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml patches/ .npmrc ./

ENV VERSION=${VERSION} \
    OTEL_ENABLED=true \
    OTEL_RESOURCE_ATTRIBUTES=git.commit.sha=${GIT_COMMIT_SHA},git.repository_url=${GIT_REPOSITORY_URL}

# Install pnpm via corepack, pinned to `packageManager` in package.json
# (single source of truth — bump pnpm there, not here). Reads from the
# package.json already copied above.
RUN PNPM_VERSION="$(node -p "require('./package.json').packageManager.replace(/^pnpm@/, '')")" \
    && test -n "${PNPM_VERSION}" \
    && echo "Installing pnpm@${PNPM_VERSION}" \
    && corepack enable \
    && corepack install -g "pnpm@${PNPM_VERSION}"
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm nuxt build

# Run
FROM node:24.17.0-alpine3.23@sha256:7c078d435026a97c8ff97b00d70e2f6ec6298a440e25a9485a9af414d5d37009

WORKDIR /app

# Use --chown=node:node so the non-root user can read the application files.
COPY --from=build --chown=node:node /app/.output /app/.output

# Run as non-root user to prevent container escape vulnerabilities (DS-0002).
# The 'node' user is provided by the base node:*-alpine image.
USER node

CMD ["node", "./.output/server/index.mjs"]
