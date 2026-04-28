/**
 * services/searchService.js
 * Full-text search for posts, communities, and users
 */
import api from './api';

const searchService = {
    /**
     * Search across posts, communities, and users
     * GET /api/search?q=query
     */
    async search(query) {
        if (!query || query.length < 2) {
            return { users: [], communities: [], posts: [] };
        }
        
        const res = await api.get('/search', { params: { q: query } });
        return res.data;
    }
};

export default searchService;
