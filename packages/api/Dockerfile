# Estágio 1: Builder - Constrói a aplicação
# This Dockerfile expects the build context to be the monorepo root.
FROM node:20-alpine AS builder

WORKDIR /app

# Copy all package manifests and lock file to leverage Docker cache
COPY package.json package-lock.json* ./
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/

# Install all dependencies for the monorepo
RUN npm install

# Copy the entire monorepo source code
# This is done after npm install to leverage caching
COPY . .

# Generate Prisma client using the workspace command
RUN npm run prisma -- generate

# Build the API application using the workspace command
RUN npm run build:api

# ---
# Estágio 2: Production - Cria a imagem final
FROM node:20-alpine

WORKDIR /app

# Copy over the built application, node_modules, and necessary package/prisma files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages/api/package.json ./packages/api/
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/api/prisma ./packages/api/prisma

# Expõe a porta em que a aplicação roda
EXPOSE 3001

# Command to start the server. Path is relative to WORKDIR /app
CMD ["node", "packages/api/dist/main"]
