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

    /** GET /api/posts/:id */
    async getPost(postId) {
        const res = await api.get(`/posts/${postId}`);
        return res.data;
    },

    /**
     * POST /api/posts
     * @param {{ content: string, mood_id: number, privacy: 'public'|'private', community_id?: number, image?: string, allow_comments?: boolean, is_anonymous?: boolean, hashtags?: string[] }} data
     */
    async createPost(data) {
        const res = await api.post('/posts', data);
        return res.data;
    },

    /** PUT /api/posts/:id */
    async updatePost(postId, data) {
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
    async createComment(postId, content) {
        const res = await api.post(`/posts/${postId}/comments`, { content });
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

    /** GET /api/reports/me */
    async getMyReports(page = 1) {
        const res = await api.get('/reports/me', { params: { page } });
        return res.data;
    },
};

export default postService;
