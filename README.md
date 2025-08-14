# Anime Tracker - Monorepo

This project is a full-stack Anime Tracker application built with React (Vite) on the frontend and NestJS on the backend, containerized with Docker.

## Prerequisites

- Docker and Docker Compose
- Node.js and npm (for local development or if you prefer not to use Docker for everything)
- A code editor like VS Code

## Getting Started with Docker (Recommended)

This is the simplest way to get the entire stack (frontend, backend, database) running.

### 1. Configure Environment Variables

The application uses a `.env` file for configuration. Create a `.env` file in the root of the project by copying the example:

```bash
cp .env.example .env
