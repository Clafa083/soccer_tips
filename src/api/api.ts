import axios from 'axios';
import { config } from '../config/config';

const api = axios.create({
    baseURL: config.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle unauthorized access
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/vm2026/login') {
                window.location.href = `/vm2026/login?redirect=${encodeURIComponent(window.location.pathname)}`;
            }
        }
        
        // Handle other error cases
        const message = error.response?.data?.message || error.message;
        return Promise.reject(new Error(message));
    }
);

export default api;
