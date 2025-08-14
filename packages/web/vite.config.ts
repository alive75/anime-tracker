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
        // Vite automatically loads variables from .env files.
        // We will define VITE_API_URL and VITE_GEMINI_API_KEY in Coolify's UI.
        // No 'define' block is needed for standard VITE_ prefixed variables.
    }
})
