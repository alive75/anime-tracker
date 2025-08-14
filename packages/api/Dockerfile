# Estágio 1: Builder - Constrói a aplicação
FROM node:20-alpine AS builder

# Instala o OpenSSL, que é uma dependência do Prisma Client para o Alpine.
RUN apk add --no-cache openssl

WORKDIR /app

# Copia os manifestos de pacotes e o lock file para aproveitar o cache do Docker.
COPY package.json package-lock.json* ./
COPY packages/api/package.json ./packages/api/

# Instala todas as dependências (incluindo devDependencies para o build)
RUN npm install

# Copia todo o código-fonte da API
COPY packages/api/ ./packages/api/

# Gera o cliente Prisma ANTES do build
WORKDIR /app/packages/api
RUN npx prisma generate

# Constrói a aplicação da API
WORKDIR /app
RUN npm run build:api

# ---
# Estágio 2: Production - Cria a imagem final
FROM node:20-alpine

# Instala o OpenSSL para o Prisma Client
RUN apk add --no-cache openssl

WORKDIR /app

# Copia os package.json files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages/api/package.json ./packages/api/

# Copia o código fonte da API (necessário para o Prisma)
COPY --from=builder /app/packages/api/prisma ./packages/api/prisma

# Instala APENAS as dependências de produção
RUN npm install --production --workspace=api

# Gera o Prisma Client novamente no ambiente de produção
WORKDIR /app/packages/api
RUN npx prisma generate

# Volta para o diretório raiz
WORKDIR /app

# Copia a aplicação construída
COPY --from=builder /app/packages/api/dist ./packages/api/dist

# Expõe a porta
EXPOSE 3001

# Script de inicialização que garante que tudo está funcionando
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'set -e' >> /start.sh && \
    echo 'echo "🔄 Starting Anime Tracker API..."' >> /start.sh && \
    echo 'cd /app/packages/api' >> /start.sh && \
    echo 'echo "📊 Running database migrations..."' >> /start.sh && \
    echo 'npx prisma migrate deploy || (echo "❌ Migration failed" && exit 1)' >> /start.sh && \
    echo 'echo "✅ Migrations completed successfully"' >> /start.sh && \
    echo 'cd /app' >> /start.sh && \
    echo 'echo "🚀 Starting NestJS application..."' >> /start.sh && \
    echo 'node packages/api/dist/main' >> /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]
