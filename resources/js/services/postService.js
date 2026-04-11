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
     * @param {Object} data - Post data
     */
    async createPost(data) {
        const res = await api.post('/posts', data);
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
            // Create a new axios instance without default headers for this specific request
            const uploadRequest = await fetch('/api/uploads', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
                    'Accept': 'application/json',
                },
            });

            if (!uploadRequest.ok) {
                const errorData = await uploadRequest.json();
                console.error('Upload error response:', errorData);
                throw new Error(errorData.message || `Upload failed with status ${uploadRequest.status}`);
            }

            const data = await uploadRequest.json();
            console.log('Upload successful:', data);
            return data;
        } catch (error) {
            console.error('Upload error:', error.message);
            throw error;
        }
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
