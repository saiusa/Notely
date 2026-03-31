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
