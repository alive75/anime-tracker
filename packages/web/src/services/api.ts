import axios from 'axios';

// By using a relative baseURL, we can use the same code for both
// local development and production.
// In development, Vite's proxy will forward requests from /api to the backend.
// In production, the reverse proxy (e.g., in Coolify, Vercel, etc.)
// should be configured to do the same.
const api = axios.create({
    baseURL: '/api',
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
