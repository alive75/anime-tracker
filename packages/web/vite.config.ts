import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(() => {
    return {
        plugins: [react()],
        server: {
            host: true, // Listen on all addresses, including 0.0.0.0
            port: 5173,
            // Use polling for HMR to work consistently in Docker environments
            watch: {
                usePolling: true,
            },
        },
        define: {
            // The Gemini API guidelines require process.env.API_KEY.
            // This exposes the environment variable from the Docker container
            // to the client-side code. The value is set via `env_file` in `docker-compose.yml`.
            'process.env': {
                API_KEY: process.env.API_KEY
            }
        }
    }
})

