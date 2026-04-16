/**
 * Test: postService
 * Unit tests for post service
 */
import postService from '../../services/postService';
import api from '../../services/api';

jest.mock('../../services/api');

describe('postService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getFeed should fetch paginated posts', async () => {
        const mockPosts = {
            data: [{ post_id: 1, content: 'Test post' }],
            current_page: 1,
            last_page: 3,
        };

        api.get.mockResolvedValue({ data: mockPosts });

        const result = await postService.getFeed(1);

        expect(api.get).toHaveBeenCalledWith('/posts', { params: { page: 1 } });
        expect(result.data).toHaveLength(1);
        expect(result.current_page).toBe(1);
    });

    test('createPost should send post data to API', async () => {
        const postData = {
            content: 'Test post',
            mood_id: 1,
            privacy: 'public',
        };

        const mockResponse = {
            post_id: 1,
            ...postData,
            created_at: '2026-04-13T00:00:00Z',
        };

        api.post.mockResolvedValue({ data: mockResponse });

        const result = await postService.createPost(postData);

        expect(api.post).toHaveBeenCalledWith('/posts', postData);
        expect(result.post_id).toBe(1);
        expect(result.content).toBe('Test post');
    });

    test('deletePost should call delete endpoint', async () => {
        api.delete.mockResolvedValue({ data: { message: 'Post deleted' } });

        const result = await postService.deletePost(1);

        expect(api.delete).toHaveBeenCalledWith('/posts/1');
        expect(result.message).toBe('Post deleted');
    });

    test('likePost should call like endpoint', async () => {
        api.post.mockResolvedValue({ data: { like_id: 1, post_id: 1 } });

        const result = await postService.likePost(1);

        expect(api.post).toHaveBeenCalledWith('/posts/1/likes');
        expect(result.like_id).toBe(1);
    });

    test('unlikePost should call unlike endpoint', async () => {
        api.delete.mockResolvedValue({ data: { message: 'Like removed' } });

        const result = await postService.unlikePost(1);

        expect(api.delete).toHaveBeenCalledWith('/posts/1/likes');
        expect(result.message).toBe('Like removed');
    });
});
