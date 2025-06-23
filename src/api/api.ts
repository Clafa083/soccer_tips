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
        // Use query parameter instead of Authorization header
        // since the server filters out Authorization headers
        if (!config.params) {
            config.params = {};
        }
        config.params.token = token;
        
        // Also include in POST data as fallback
        if (config.method === 'post' && config.data && typeof config.data === 'object') {
            config.data.token = token;
        }
    }
    return config;
});

// Add response interceptor to handle errors and implement PUT fallback
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Handle unauthorized access
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/vm2026/login') {
                window.location.href = `/vm2026/login?redirect=${encodeURIComponent(window.location.pathname)}`;
            }
        }
        
        // Handle PUT method not allowed - retry with POST + _method=PUT
        if (error.response?.status === 405 && error.config?.method === 'put') {
            console.log('PUT method not allowed, trying POST with _method=PUT fallback');
            
            try {
                // Convert PUT to POST with _method=PUT in query params
                const originalConfig = error.config;
                const url = new URL(originalConfig.url, originalConfig.baseURL);
                url.searchParams.set('_method', 'PUT');
                
                const fallbackResponse = await axios({
                    ...originalConfig,
                    method: 'post',
                    url: url.toString()
                });
                
                return fallbackResponse;
            } catch (fallbackError) {
                console.error('Fallback POST also failed:', fallbackError);
                // Return original error if fallback also fails
                return Promise.reject(error);
            }
        }
        
        // Handle other error cases
        const message = error.response?.data?.message || error.message;
        return Promise.reject(new Error(message));
    }
);

export default api;
