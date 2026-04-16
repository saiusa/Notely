/**
 * services/searchService.js
 * Full-text search for posts, communities, and users
 */
import api from './api';

const searchService = {
    /**
     * Search across posts, communities, and users
     * GET /api/search?q=query&type=posts|communities|users
     */
    async search(query, type = 'all', page = 1) {
        const params = new URLSearchParams({
            q: query,
            type,
            page,
        });
        
        const res = await api.get(`/search?${params.toString()}`);
        return res.data; // { results: [], total, status }
    },

    /**
     * Search posts only
     */
    async searchPosts(query, page = 1) {
        return this.search(query, 'posts', page);
    },

    /**
     * Search communities only
     */
    async searchCommunities(query, page = 1) {
        return this.search(query, 'communities', page);
    },

    /**
     * Search users only
     */
    async searchUsers(query, page = 1) {
        return this.search(query, 'users', page);
    },

    /**
     * Get search suggestions (autocomplete)
     * GET /api/search/suggestions?q=query
     */
    async getSuggestions(query) {
        if (!query || query.length < 2) {
            return { suggestions: [] };
        }
        
        const res = await api.get('/search/suggestions', { 
            params: { q: query } 
        });
        return res.data;
    },
};

export default searchService;
