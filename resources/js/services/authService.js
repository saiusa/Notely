/**
 * services/authService.js
 * Authentication API calls (register, login, logout, forgot-password, me).
 */
import api from './api';

const authService = {
    /**
     * POST /api/auth/register
     * @param {{ username: string, email: string, password: string, password_confirmation: string, phone_number?: string }} data
     */
    async register(data) {
        const res = await api.post('/auth/register', data);
        return res.data; // { message, user, token, token_type }
    },

    /**
     * POST /api/auth/login
     * @param {{ email: string, password: string, remember_me?: boolean }} credentials
     */
    async login(credentials) {
        const res = await api.post('/auth/login', credentials);
        return res.data; // { message, user, token, token_type, remember_token? }
    },

    /**
     * POST /api/auth/logout  (requires auth)
     */
    async logout() {
        const res = await api.post('/auth/logout');
        return res.data;
    },

    /**
     * POST /api/auth/forgot-password
     * @param {{ email: string }} data
     */
    async forgotPassword(data) {
        const res = await api.post('/auth/forgot-password', data);
        return res.data;
    },

    /**
     * POST /api/auth/reset-password
     * @param {{ email: string, token: string, password: string, password_confirmation: string }} data
     */
    async resetPassword(data) {
        const res = await api.post('/auth/reset-password', data);
        return res.data;
    },

    /**
     * GET /api/me  (requires auth)
     * Returns user with profile, setting, and communities.
     */
    async getMe() {
        const res = await api.get('/me');
        return res.data;
    },

    /**
     * POST /api/auth/remember-me/validate
     * Validates remember_token and returns new session token for auto-login
     * @param {{ remember_token: string }} data
     */
    async validateRememberToken(data) {
        const res = await api.post('/auth/remember-me/validate', data);
        return res.data; // { message, user, token, token_type, remember_token }
    },
};

export default authService;
