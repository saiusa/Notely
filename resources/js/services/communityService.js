/**
 * services/communityService.js
 * Communities and membership API calls.
 */
import api from './api';

const communityService = {
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
};

export default communityService;
