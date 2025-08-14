# Estágio 1: Builder - Constrói a aplicação
# Este Dockerfile espera que o contexto de build seja a raiz do monorepo.
FROM node:20-alpine AS builder

# Instala o OpenSSL, que é uma dependência do Prisma Client para o Alpine.
# Isso corrige possíveis problemas de tempo de execução em ambientes de produção.
RUN apk add --no-cache openssl

WORKDIR /app

# Copia os manifestos de pacotes e o lock file para aproveitar o cache do Docker.
COPY package.json package-lock.json* ./
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/

# Instala todas as dependências do monorepo.
RUN npm install

# Copia todo o código-fonte do monorepo.
# Isso é feito após o npm install para aproveitar o cache.
COPY . .

# Gera o cliente Prisma.
RUN npm run prisma -- generate

# Constrói a aplicação da API.
RUN npm run build:api

# ---
# Estágio 2: Production - Cria a imagem final
FROM node:20-alpine

# Instala o OpenSSL novamente para garantir que o Prisma Client funcione no ambiente de produção.
RUN apk add --no-cache openssl

WORKDIR /app

# Copia os manifestos de pacotes e o lock file do estágio de build.
COPY --from=builder /app/package.json /app/package-lock.json* ./
COPY --from=builder /app/packages/api/package.json ./packages/api/
COPY --from=builder /app/packages/web/package.json ./packages/web/ # Copia para manter a estrutura de workspace

# Instala APENAS as dependências de produção usando npm ci.
# Isso é mais rápido, seguro e robusto do que copiar a pasta node_modules inteira.
RUN npm ci --omit=dev

# Copia a aplicação construída e os arquivos necessários do Prisma do estágio de build.
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/api/prisma ./packages/api/prisma

# Expõe a porta em que a aplicação roda.
EXPOSE 3001

# Comando para aplicar as migrações do banco de dados e depois iniciar o servidor.
# Isso garante que o banco de dados esteja pronto antes do lançamento da aplicação.
CMD ["sh", "-c", "npm run db:deploy && node packages/api/dist/main"]
