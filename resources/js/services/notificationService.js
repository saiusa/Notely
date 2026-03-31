/**
 * services/notificationService.js
 * Notification listing, read status, and deletion.
 */
import api from './api';

const notificationService = {
    /** GET /api/notifications?page=N */
    async getNotifications(page = 1) {
        const res = await api.get('/notifications', { params: { page } });
        return res.data;
    },

    /** GET /api/notifications/unread-count */
    async getUnreadCount() {
        const res = await api.get('/notifications/unread-count');
        return res.data; // { unread_count: number }
    },

    /** PATCH /api/notifications/:id/read */
    async markAsRead(notificationId) {
        const res = await api.patch(`/notifications/${notificationId}/read`);
        return res.data;
    },

    /** PATCH /api/notifications/read-all */
    async markAllAsRead() {
        const res = await api.patch('/notifications/read-all');
        return res.data;
    },

    /** DELETE /api/notifications/:id */
    async deleteNotification(notificationId) {
        const res = await api.delete(`/notifications/${notificationId}`);
        return res.data;
    },
};

export default notificationService;
