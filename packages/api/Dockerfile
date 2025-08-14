# Usa uma imagem base do Node.js
FROM node:20-alpine

# Instala dependências do sistema necessárias para o Prisma
# ca-certificates é para SSL em geral e openssl é especificamente para o motor do Prisma
RUN apk add --no-cache openssl ca-certificates

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia os arquivos de gerenciamento de pacotes da raiz
COPY package.json package-lock.json* ./

# Copia o package.json específico da API
COPY packages/api/package.json ./packages/api/

# Copia o schema do Prisma para gerar o client
COPY packages/api/prisma ./packages/api/prisma

# Instala todas as dependências do monorepo
RUN npm install

# Copia o restante do código-fonte da API
COPY packages/api ./packages/api

# O comando para executar a aplicação será fornecido pelo docker-compose.yml
# para habilitar o hot-reloading. Ex: command: npm run dev --workspace=api
