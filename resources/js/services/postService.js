/**
 * services/postService.js
 * Posts, Comments, Likes, and Reports API calls.
 */
import api from './api';

const postService = {
    // ─── Posts ────────────────────────────────────────────
    /** GET /api/posts?page=N */
    async getFeed(page = 1) {
        const res = await api.get('/posts', { params: { page } });
        return res.data; // paginated { data, current_page, last_page, ... }
    },

    /** GET /api/posts/journal/private?page=N - Get authenticated user's private posts */
    async getPrivatePosts(page = 1) {
        const res = await api.get('/posts/journal/private', { params: { page } });
        return res.data;
    },

    /** GET /api/posts/journal/public?page=N - Get authenticated user's public posts */
    async getUserPublicPosts(page = 1) {
        const res = await api.get('/posts/journal/public', { params: { page } });
        return res.data;
    },

    /** GET /api/posts?tab=community - Community feed (posts from joined communities) */
    async getCommunityFeed(page = 1) {
        const res = await api.get('/posts', { params: { tab: 'community', page } });
        return res.data; // paginated { data, current_page, last_page, ... }
    },

    /** GET /api/posts/explore - Trending posts from all public communities */
    async getExploreFeed(page = 1) {
        const res = await api.get('/posts/explore', { params: { page } });
        return res.data; // paginated { data, current_page, last_page, ... }
    },

    /** GET /api/posts/:id */
    async getPost(postId) {
        const res = await api.get(`/posts/${postId}`);
        return res.data;
    },

    /**
     * POST /api/posts
     * @param {Object} data - Post data
     */
    async createPost(data) {
        const res = await api.post('/posts', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return res.data;
    },

    /**
     * POST /api/uploads
     * Upload a file and get back the URL
     */
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        console.log('Uploading file:', {
            name: file.name,
            type: file.type,
            size: file.size,
        });

        try {
            // Use axios with FormData - it handles Content-Type and auth headers automatically
            const res = await api.post('/uploads', formData);
            console.log('Upload successful:', res.data);
            return res.data;
        } catch (error) {
            console.error('Upload error:', error.message);
            throw error;
        }
    },

    /** PUT /api/posts/:id (via POST with method spoofing for FormData) */
    async updatePost(postId, data) {
        // Add method spoofing for Laravel's form method override (required for FormData with PUT)
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            const res = await api.post(`/posts/${postId}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data;
        }
        // Fallback for regular JSON data
        const res = await api.put(`/posts/${postId}`, data);
        return res.data;
    },

    /** DELETE /api/posts/:id */
    async deletePost(postId) {
        const res = await api.delete(`/posts/${postId}`);
        return res.data;
    },

    // ─── Comments ────────────────────────────────────────
    /** GET /api/posts/:id/comments?page=N */
    async getComments(postId, page = 1) {
        const res = await api.get(`/posts/${postId}/comments`, { params: { page } });
        return res.data;
    },

    /** POST /api/posts/:id/comments */
    async createComment(postId, content, parentId = null) {
        const res = await api.post(`/posts/${postId}/comments`, {
            content,
            parent_id: parentId
        });
        return res.data;
    },

    /** PUT /api/posts/:postId/comments/:commentId */
    async updateComment(postId, commentId, content) {
        const res = await api.put(`/posts/${postId}/comments/${commentId}`, { content });
        return res.data;
    },

    /** DELETE /api/posts/:postId/comments/:commentId */
    async deleteComment(postId, commentId) {
        const res = await api.delete(`/posts/${postId}/comments/${commentId}`);
        return res.data;
    },

    // ─── Likes ───────────────────────────────────────────
    /** GET /api/posts/:id/likes */
    async getLikes(postId) {
        const res = await api.get(`/posts/${postId}/likes`);
        return res.data; // { post_id, likes_count, liked_by_user }
    },

    /** POST /api/posts/:id/likes */
    async likePost(postId) {
        const res = await api.post(`/posts/${postId}/likes`);
        return res.data;
    },

    /** DELETE /api/posts/:id/likes */
    async unlikePost(postId) {
        const res = await api.delete(`/posts/${postId}/likes`);
        return res.data;
    },

    // ─── Reports ─────────────────────────────────────────
    /** POST /api/posts/:id/reports */
    async reportPost(postId, reason) {
        const res = await api.post(`/posts/${postId}/reports`, { reason });
        return res.data;
    },

    /** POST /api/posts/:postId/comments/:commentId/reports */
    async reportComment(postId, commentId, reportData) {
        const res = await api.post(`/posts/${postId}/comments/${commentId}/reports`, reportData);
        return res.data;
    },

    /** GET /api/reports/me */
    async getMyReports(page = 1) {
        const res = await api.get('/reports/me', { params: { page } });
        return res.data;
    },
};

export default postService;
