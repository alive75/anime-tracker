# Anime Tracker - Monorepo

This project is a full-stack Anime Tracker application built with React (Vite) on the frontend and NestJS on the backend, containerized with Docker for both development and production.

## 🚀 Local Development with Docker

This is the simplest way to get the entire stack (frontend, backend, database) running locally.

### 1. Prerequisites
- Docker and Docker Compose installed on your machine.

### 2. Configure Local Environment Variables
The application uses a `.env` file for configuration. Create this file in the root of the project by copying the example:

```bash
cp .env.example .env
```

Now, open the newly created `.env` file and **fill in your `VITE_GEMINI_API_KEY`**. The other values are pre-configured for the local Docker setup and should work out of the box.

### 3. Build and Run the Application
From the root directory of the project, run the following command. It will build the production-ready Docker images for the API and frontend, and start all services in the background.

```bash
docker-compose up --build -d
```
- `--build`: Use this the first time or after changing a `Dockerfile` to force a rebuild.
- `-d`: Runs the containers in detached mode (in the background).

### 4. Initialize the Database
The very first time you run the application, you need to apply the database schema. With the containers running, execute the following command in your terminal:

```bash
docker-compose exec api npm run db:deploy
```

### 5. Access Your Application
🎉 You're all set! The services are now available at:

-   **Frontend (React App)**: [http://localhost:5173](http://localhost:5173)
-   **Backend (NestJS API)**: [http://localhost:3001](http://localhost:3001)

---

## ☁️ Production Deployment (e.g., on Coolify)

To deploy this monorepo to a platform like Coolify, you typically deploy the **API (backend)** and the **Web (frontend)** as two separate services. Here’s how to configure them:

### API Service (Backend) Configuration

In your Coolify API service settings, you need to set the following **Environment Variables**:

-   `DATABASE_URL`: The connection string for your production PostgreSQL database.
-   `JWT_SECRET`: A long, random, and secret string for signing tokens.
-   `JWT_EXPIRES_IN`: (Optional) How long tokens should last (e.g., `7d`).
-   `CLIENT_URL`: **This is critical for fixing CORS errors.** Set this to the public URL of your **frontend** application. For example: `https://anime.ts75.uk`.

### Web Service (Frontend) Configuration

In your Coolify Web service settings, you need to set the following **Build Environment Variables**:

-   `VITE_API_URL`: **This is critical.** Set this to the public URL of your **backend API**. For example: `https://api.yourdomain.com/api`.
-   `VITE_GEMINI_API_KEY`: Your Google Gemini API key.

By setting these variables correctly in your deployment environment, you ensure that the frontend can communicate with the backend without CORS issues and that all API keys are correctly configured.

---

## Useful Docker Commands

-   **Stop and remove containers, networks, and volumes:**
    ```bash
    docker-compose down -v
    ```
-   **View logs for all services (in real-time):**
    ```bash
    docker-compose logs -f
    ```
-   **View logs for a specific service (e.g., `api`):**
    ```bash
    docker-compose logs -f api
    ```
-   **Access a shell inside a running container (e.g., `api`):**
    ```bash
    docker-compose exec api sh
    ```
-   **Run any Prisma command inside the API container:**
    ```bash
    # Example: run a specific prisma command like studio
    docker-compose exec api npm run prisma -- studio
    ```
---

## 💡 Troubleshooting

### Connection Errors on `localhost` (e.g., `ERR_CONNECTION_REFUSED`)

If your browser console shows a network error when trying to log in or register, it means the frontend application cannot reach the backend API at `http://localhost:3001`. Here's how to fix it:

1.  **Check if your Docker containers are running:**
    ```bash
    docker-compose ps
    ```
    You should see both the `api` and `web` services with a status of `Up`. If not, try starting them again with `docker-compose up -d`.

2.  **Check the API logs for errors:**
    The most common issue is an error during the API server's startup. Check the logs:
    ```bash
    docker-compose logs -f api
    ```
    Look for a success message like `🚀 API server is running on http://localhost:3001/api`. If you see any errors, they will point to the root cause (e.g., a problem with the `.env` file or database connection).

3.  **Ensure Port `3001` is not blocked:**
    Make sure no other application or firewall on your computer is using or blocking port `3001`.

4.  **Verify `.env` configuration:**
    For local development, your root `.env` file should **not** have `VITE_API_URL` set. The code is designed to default to `http://localhost:3001/api` automatically when this variable is missing.
