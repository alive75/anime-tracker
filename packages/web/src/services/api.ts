import axios from 'axios';

// A function to robustly determine the API base URL.
const getApiBaseUrl = () => {
    let apiUrl = import.meta.env.VITE_API_URL;

    // Vite provides `import.meta.env.PROD` which is true during a production build.
    if (import.meta.env.PROD) {
        // In production, the VITE_API_URL environment variable is mandatory.
        if (!apiUrl) {
            console.error("FATAL ERROR: The VITE_API_URL environment variable is not set in the production build. Please set it in your deployment settings (e.g., Coolify).");
            // Return an invalid URL to make it clear that the configuration is missing.
            return 'api-url-not-configured';
        }

        // --- Automatic HTTPS Upgrade ---
        // This logic prevents "Mixed Content" errors in production. If the frontend is
        // served over HTTPS, it automatically upgrades the API URL to use HTTPS as well.
        const isSiteSecure = window.location.protocol === 'https:';
        if (isSiteSecure && apiUrl.startsWith('http://')) {
            console.warn(`[API Setup] Auto-upgrading API URL to HTTPS to prevent Mixed Content errors. Original: ${apiUrl}`);
            apiUrl = apiUrl.replace('http://', 'https://');
        }
    }

    // For local development, we can fall back to a default value.
    return apiUrl || 'http://localhost:3001/api';
};

const baseURL = getApiBaseUrl();

// This log helps developers immediately see which API endpoint is being used.
console.log(`[API Setup] Service connecting to API at: ${baseURL}`);

const api = axios.create({
    baseURL,
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
