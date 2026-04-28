/**
 * services/api.js
 * Central Axios instance for all API calls.
 * - Reads Sanctum Bearer token from localStorage
 * - Auto-redirects to /login on 401 (expired session)
 * - Uses Vite's import.meta.env for environment variables
 */
import axios from 'axios';

// Get API base URL from Vite environment.
// NUCLEAR OPTION: If VITE_API_URL resolves to localhost, force production URL.
// NEVER allow localhost to reach the production build.
const baseURL = import.meta.env.VITE_API_URL === 'http://127.0.0.1:8000'
    ? 'https://notelyjournal.me/api'
    : (import.meta.env.VITE_API_URL || 'https://notelyjournal.me/api');

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

// ── Request interceptor: attach Bearer token & handle FormData ──
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // For FormData requests, let axios auto-set Content-Type with boundary
    if (config.data instanceof FormData) {
        // Delete the default application/json Content-Type
        delete config.headers['Content-Type'];
        // Also don't override Accept for multipart uploads
        delete config.headers['Accept'];
    }

    return config;
});

// ── Response interceptor: handle 401 globally ──
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            if (!window.location.hash.includes('/login')) {
                window.location.hash = '#/login';
            }
        }
        
        // Handle global suspension
        if (error.response?.status === 403 && error.response?.data?.message?.toLowerCase().includes('suspended')) {
            localStorage.removeItem('auth_token');
            if (!window.location.hash.includes('/login')) {
                window.location.hash = '#/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
