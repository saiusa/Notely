/**
 * services/communityService.js
 * Communities and membership API calls.
 */
import api from './api';

const communityService = {
    /** GET /api/categories (with eager-loaded communities) */
    async getCategories() {
        const res = await api.get('/categories');
        return res.data;
    },

    /** GET /api/categories/:id */
    async getCategory(categoryId) {
        const res = await api.get(`/categories/${categoryId}`);
        return res.data;
    },

    /** GET /api/communities?page=N */
    async getCommunities(page = 1) {
        const res = await api.get('/communities', { params: { page } });
        return res.data;
    },

    /** GET /api/communities/:id */
    async getCommunity(communityId) {
        const res = await api.get(`/communities/${communityId}`);
        return res.data;
    },

    /**
     * POST /api/communities
     * @param {{ name: string, description: string, image?: string }} data
     */
    async createCommunity(data) {
        const res = await api.post('/communities', data);
        return res.data;
    },

    /**
     * PUT /api/communities/:id
     * @param {number} communityId
     * @param {{ name: string, description: string, category_id: number, image?: File, rules?: string[] }} data
     */
    async updateCommunity(communityId, data) {
        // Use _method: 'PUT' for method spoofing since we're sending FormData
        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('name', data.name);
        formData.append('description', data.description);
        formData.append('category_id', data.category_id);
        if (data.image) {
            formData.append('image', data.image);
        }
        if (data.rules && Array.isArray(data.rules)) {
            // Append each rule as rules[index]
            data.rules.forEach((rule, index) => {
                formData.append(`rules[${index}]`, rule);
            });
        }

        const res = await api.post(`/communities/${communityId}`, formData);
        return res.data;
    },

    /** GET /api/communities/:id/posts?page=N */
    async getCommunityPosts(communityId, page = 1) {
        const res = await api.get(`/communities/${communityId}/posts`, { params: { page } });
        return res.data;
    },

    /** GET /api/communities/me?page=N */
    async getMyCommunities(page = 1) {
        const res = await api.get('/communities/me', { params: { page } });
        return res.data;
    },

    /** GET /api/communities/:id/members?page=N */
    async getMembers(communityId, page = 1) {
        const res = await api.get(`/communities/${communityId}/members`, { params: { page } });
        return res.data;
    },

    /** POST /api/communities/:id/join */
    async joinCommunity(communityId) {
        const res = await api.post(`/communities/${communityId}/join`);
        return res.data;
    },

    /** DELETE /api/communities/:id/leave */
    async leaveCommunity(communityId) {
        const res = await api.delete(`/communities/${communityId}/leave`);
        return res.data;
    },

    /**
     * Toggle membership status for a community
     * If user is a member, they leave. If not a member, they join.
     * @param {number} communityId
     * @param {boolean} isCurrentlyMember - whether user is currently a member
     * @returns {Promise<{success: boolean, isMember: boolean, message: string}>}
     */
    async toggleJoinCommunity(communityId, isCurrentlyMember) {
        try {
            if (isCurrentlyMember) {
                await this.leaveCommunity(communityId);
                return {
                    success: true,
                    isMember: false,
                    message: 'Left community successfully.',
                };
            } else {
                await this.joinCommunity(communityId);
                return {
                    success: true,
                    isMember: true,
                    message: 'Joined community successfully.',
                };
            }
        } catch (error) {
            console.error('Failed to toggle community membership:', error);
            return {
                success: false,
                isMember: isCurrentlyMember,
                message: 'Failed to update membership status.',
            };
        }
    },
};

export default communityService;
