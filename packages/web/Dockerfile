# Usa uma imagem base do Node.js
FROM node:20-alpine

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos de gerenciamento de pacotes da raiz
COPY package.json package-lock.json* ./

# Copia o package.json específico do web
COPY packages/web/package.json ./packages/web/

# Instala todas as dependências do monorepo
RUN npm install

# Copia o restante do código-fonte do web
COPY packages/web ./packages/web

# O comando para iniciar o servidor de desenvolvimento é fornecido pelo docker-compose.yml
# Ex: command: npm run dev --workspace=web
