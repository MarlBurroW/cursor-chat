# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY frontend/vite.config.ts \
    frontend/tsconfig.json \
    frontend/tsconfig.node.json \
    frontend/postcss.config.js \
    frontend/tailwind.config.js \
    frontend/index.html \
    ./
COPY frontend/src ./src
RUN yarn build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder
WORKDIR /app
# Installation des dépendances de build
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
# Copie des fichiers source et configuration
COPY tsconfig.json ./
COPY src ./src
# Build TypeScript
RUN yarn build

# Stage 3: Production
FROM node:18-alpine
WORKDIR /app

# Installation des dépendances de production uniquement
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

# Copie du build backend
COPY --from=backend-builder /app/dist ./dist

# Copie du build frontend
COPY --from=frontend-builder /app/frontend/dist ./public

# Configuration production
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/server.js"] 