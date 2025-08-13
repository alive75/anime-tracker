import axios from 'axios';

// The base URL for the backend API is now read from Vite's environment variables.
// This is a more flexible approach than hardcoding the URL.
// VITE_API_URL should be defined in a .env file in the packages/web directory.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
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
