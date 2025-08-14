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
# Removendo a cópia do web/package.json pois não é necessário para o build da API
# COPY packages/web/package.json ./packages/web/

# Instala todas as dependências do monorepo.
RUN npm install

# Copia apenas os arquivos necessários para a API
COPY packages/api/ ./packages/api/

# Gera o cliente Prisma.
RUN cd packages/api && npx prisma generate

# Constrói a aplicação da API.
RUN npm run build:api

# ---
# Estágio 2: Production - Cria a imagem final
FROM node:20-alpine

# Instala o OpenSSL novamente para garantir que o Prisma Client funcione no ambiente de produção.
RUN apk add --no-cache openssl

WORKDIR /app

# Copia apenas os arquivos necessários do estágio de build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages/api/package.json ./packages/api/

# Instala APENAS as dependências de produção da API
RUN npm install --production --workspace=api

# Copia a aplicação construída e os arquivos necessários do Prisma do estágio de build.
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/api/prisma ./packages/api/prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Expõe a porta em que a aplicação roda.
EXPOSE 3001

# Comando para aplicar as migrações do banco de dados e depois iniciar o servidor.
# Isso garante que o banco de dados esteja pronto antes do lançamento da aplicação.
CMD ["sh", "-c", "cd packages/api && npx prisma migrate deploy && cd ../.. && node packages/api/dist/main"]
