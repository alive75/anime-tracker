# Estágio 1: Build - Constrói a aplicação React
FROM node:20-alpine AS builder

WORKDIR /app

# Declara os argumentos de build que serão passados pelo docker-compose.yml
ARG VITE_API_URL
ARG VITE_GEMINI_API_KEY

# Define-os como variáveis de ambiente para o processo de build do Vite
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}

# Copia os arquivos de manifesto do pacote
COPY package.json package-lock.json* ./

# Instala as dependências
RUN npm install

# Copia o resto do código-fonte
COPY . .

# Constrói a aplicação para produção
# O Vite irá injetar as variáveis de ambiente (VITE_*) no código final
RUN npm run build

# ---
# Estágio 2: Serve - Usa uma imagem leve do Nginx para servir os arquivos
FROM nginx:1.25-alpine

# Copia os arquivos estáticos construídos do estágio de builder para o diretório do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia a configuração personalizada do Nginx para lidar com o roteamento do React (SPA)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80 (padrão do Nginx)
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
