# Estágio 1: Build - Constrói a aplicação React
# This Dockerfile expects the build context to be the monorepo root.
FROM node:20-alpine AS builder

WORKDIR /app

# Declara os argumentos de build
ARG VITE_API_URL
ARG VITE_GEMINI_API_KEY

# Define-os como variáveis de ambiente para o processo de build do Vite
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}

# Copy all package manifests and lock file to leverage Docker cache
COPY package.json package-lock.json* ./
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/

# Install all dependencies for the monorepo
RUN npm install

# Copy the entire monorepo source code
COPY . .

# Build the web application using the workspace command
RUN npm run build:web

# ---
# Estágio 2: Serve - Usa uma imagem leve do Nginx para servir os arquivos
FROM nginx:1.25-alpine

# Copy the built assets from the builder stage
# The build output is in /app/packages/web/dist
COPY --from=builder /app/packages/web/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
# The config file is at packages/web/nginx.conf relative to the build context
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80 (padrão do Nginx)
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
