import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '', '');
    return {
        plugins: [react()],
        // Proxy API requests to the NestJS backend during development
        server: {
            proxy: {
                '/api': {
                    target: 'http://localhost:3001',
                    changeOrigin: true,
                },
            },
        },
        define: {
            // The Gemini API guidelines require process.env.API_KEY.
            // This exposes the environment variable to the client-side code.
            // Make sure to have a .env file in the `packages/web` directory
            // with your API_KEY.
            // VITE_API_URL is no longer needed as we use a proxy.
            'process.env': {
                API_KEY: env.API_KEY
            }
        }
    }
})
