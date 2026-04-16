/**
 * services/profileService.js
 * Profile update API calls.
 */
import api from './api';

const profileService = {
    /**
     * PUT /api/me/profile
     * @param {{ first_name: string, last_name: string, location?: string, birthday?: string, gender?: string, description?: string }} data
     */
    async updateProfile(data) {
        const res = await api.put('/me/profile', data);
        return res.data;
    },

    /**
     * GET /api/users/:username/profile
     * Fetch a user's public profile by username
     */
    async getUserProfile(username) {
        const res = await api.get(`/users/${username}/profile`);
        return res.data;
    },
};

export default profileService;
