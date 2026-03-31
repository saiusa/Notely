/**
 * services/profileService.js
 * Profile update API calls.
 */
import api from './api';

const profileService = {
    /**
     * PUT /api/me/profile
     * @param {{ first_name: string, last_name: string, location?: string, birthday?: string, gender?: string, description?: string, profile_picture?: string }} data
     */
    async updateProfile(data) {
        const res = await api.put('/me/profile', data);
        return res.data;
    },
};

export default profileService;
