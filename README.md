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
