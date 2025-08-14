# Estágio 1: Builder - Constrói a aplicação
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de manifesto do pacote
COPY package.json package-lock.json* ./

# Instala todas as dependências (incluindo as de desenvolvimento)
RUN npm install

# Copia o resto do código-fonte da API
COPY . .

# Gera o cliente Prisma
RUN npx prisma generate

# Constrói a aplicação NestJS para produção
RUN npm run build

# ---
# Estágio 2: Production - Cria a imagem final
FROM node:20-alpine

WORKDIR /app

# Copia os manifestos de dependência do estágio de builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json* ./

# Instala apenas as dependências de produção
RUN npm ci --omit=dev

# Copia a aplicação construída e o schema do Prisma do builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expõe a porta em que a aplicação roda
EXPOSE 3001

# Comando para iniciar o servidor em produção
CMD ["node", "dist/main"]
