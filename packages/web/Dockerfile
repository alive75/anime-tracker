# packages/web/Dockerfile

# ---- Builder Stage ----
# Build the React application using Vite
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Argument to receive the Gemini API key during the build
ARG API_KEY
ENV API_KEY=$API_KEY

# Copy monorepo package definitions
COPY package.json ./
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/

# Install all dependencies
RUN npm install

# Copy all source code
COPY . .

# Build the web application. The build script is in the root package.json
RUN npm run build:web

# ---- Production Stage ----
# Use a lightweight Nginx server to serve the static files
FROM nginx:1.25-alpine

# Copy the built React app from the builder stage to Nginx's public directory
COPY --from=builder /usr/src/app/packages/web/dist /usr/share/nginx/html

# Copy our custom Nginx configuration
# This is the key to routing /api requests to the backend service.
COPY packages/web/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for HTTP traffic
EXPOSE 80

# The default Nginx command will start the server
CMD ["nginx", "-g", "daemon off;"]
