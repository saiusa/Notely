/**
 * services/emailNotificationService.js
 * Manages email notification preferences and delivery
 */
import api from './api';

const emailNotificationService = {
    /**
     * GET /api/email-notifications/preferences
     * Get user's email notification preferences
     */
    async getPreferences() {
        try {
            const res = await api.get('/email-notifications/preferences');
            return res.data;
        } catch (error) {
            console.error('Failed to fetch email notification preferences:', error);
            return null;
        }
    },

    /**
     * PUT /api/email-notifications/preferences
     * Update email notification preferences
     */
    async updatePreferences(preferences) {
        const res = await api.put('/email-notifications/preferences', preferences);
        return res.data;
    },

    /**
     * POST /api/email-notifications/send-test
     * Send a test email to verify delivery
     */
    async sendTestEmail() {
        const res = await api.post('/email-notifications/send-test');
        return res.data;
    },

    /**
     * POST /api/email-notifications/unsubscribe/:token
     * Unsubscribe from email notifications (for email links)
     */
    async unsubscribe(token) {
        const res = await api.post(`/email-notifications/unsubscribe/${token}`);
        return res.data;
    },
};

export default emailNotificationService;
