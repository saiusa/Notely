/**
 * services/settingsService.js
 * Account, security, privacy, notification settings, and account deletion.
 */
import api from './api';

const settingsService = {
    /**
     * PUT /api/me/settings/account
     * @param {{ username: string, email: string, phone_number?: string }} data
     */
    async updateAccount(data) {
        const res = await api.put('/me/settings/account', data);
        return res.data;
    },

    /**
     * PUT /api/me/settings/security/password
     * @param {{ current_password: string, new_password: string, new_password_confirmation: string }} data
     */
    async updatePassword(data) {
        const res = await api.put('/me/settings/security/password', data);
        return res.data;
    },

    /**
     * PUT /api/me/settings/security/two-factor
     * @param {{ two_factor_enabled: boolean }} data
     */
    async updateTwoFactor(data) {
        const res = await api.put('/me/settings/security/two-factor', data);
        return res.data;
    },

    /**
     * POST /api/me/settings/security/two-factor/setup
     * Generates a secret and QR code for 2FA setup
     * @returns {{ secret: string, qr_code: string }}
     */
    async setupTwoFactor() {
        const res = await api.post('/me/settings/security/two-factor/setup');
        return res.data;
    },

    /**
     * POST /api/me/settings/security/two-factor/confirm
     * Verifies the 2FA code and enables 2FA
     * @param {{ code: string }} data — 6-digit code from authenticator app
     * @returns {{ backup_codes: string[], message: string }}
     */
    async confirmTwoFactor(data) {
        const res = await api.post('/me/settings/security/two-factor/confirm', data);
        return res.data;
    },

    /**
     * DELETE /api/me/settings/security/two-factor
     * Disables 2FA for the user
     * @returns {{ message: string }}
     */
    async disableTwoFactor() {
        const res = await api.delete('/me/settings/security/two-factor');
        return res.data;
    },

    /**
     * PUT /api/me/settings/privacy
     * @param {{ default_post_privacy: 'public'|'private', hide_comments: boolean, show_reaction_counts: boolean }} data
     */
    async updatePrivacy(data) {
        const res = await api.put('/me/settings/privacy', data);
        return res.data;
    },

    /**
     * PUT /api/me/settings/notifications
     * @param {{ notify_likes: boolean, notify_comments: boolean, email_notifications: boolean }} data
     */
    async updateNotifications(data) {
        const res = await api.put('/me/settings/notifications', data);
        return res.data;
    },

    /** DELETE /api/me — permanently deletes account */
    async deleteAccount() {
        const res = await api.delete('/me');
        return res.data;
    },
};

export default settingsService;
