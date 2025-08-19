// This file provides TypeScript definitions for Vite's client-side environment variables.
// It ensures that `import.meta.env` and other Vite-specific properties are correctly typed.

interface ImportMetaEnv {
    /**
     * The base URL for the backend API.
     * This is defined in the deployment environment (e.g., Coolify).
     */
    readonly VITE_API_URL: string;

    /**
     * The API key for the Google Gemini service.
     * This is defined in the deployment environment (e.g., Coolify).
     */
    readonly VITE_GEMINI_API_KEY: string;

    /** `true` when the app is running in production mode. */
    readonly PROD: boolean;

    /** `true` when the app is running in development mode. */
    readonly DEV: boolean;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

