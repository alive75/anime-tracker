import axios from 'axios';

// The base URL for the backend API is now read from Vite's environment variables.
// This is a more flexible approach than hardcoding the URL.
// VITE_API_URL should be defined in a .env file in the packages/web directory.
let baseURL = process.env.VITE_API_URL || 'http://localhost:3001';

// Automatically upgrade to HTTPS if the frontend is served over HTTPS.
// This resolves mixed content errors in production environments.
if (typeof window !== 'undefined' && window.location.protocol === 'https:' && baseURL.startsWith('http://')) {
    baseURL = baseURL.replace('http://', 'https://');
}

const api = axios.create({
    baseURL: baseURL,
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
