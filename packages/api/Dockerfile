# packages/api/Dockerfile

# ---- Base ----
# Use a base image with Node.js for a consistent environment
FROM node:18-alpine AS base
WORKDIR /usr/src/app

# ---- Dependencies ----
# First, copy only the package.json files to leverage Docker layer caching.
# This step will only be re-run if these files change.
FROM base AS deps
COPY package.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/

# Install all dependencies for the monorepo
RUN npm install

# ---- Builder ----
# Build the NestJS application
FROM base AS builder
# Copy all source code and the installed dependencies
COPY . .
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Generate Prisma Client
# This is crucial for the build step as NestJS needs the generated types.
RUN npx prisma generate --schema=./packages/api/prisma/schema.prisma

# Build the NestJS application. The `build:api` script is in the root package.json
RUN npm run build:api

# ---- Production ----
# Create a small, optimized production image
FROM node:18-alpine AS production
WORKDIR /usr/src/app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy only the necessary files for running the production server
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/packages/api/package.json ./packages/api/
COPY --from=builder /usr/src/app/packages/api/dist ./packages/api/dist
COPY --from=builder /usr/src/app/packages/api/prisma ./packages/api/prisma

# Expose the port the API will run on
EXPOSE 3001

# Command to run the application
# We use the script from the workspace's package.json
CMD ["npm", "run", "start:prod", "--workspace=api"]
