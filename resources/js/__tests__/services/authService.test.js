/**
 * Test: authService
 * Unit tests for authentication service
 */
import authService from '../../services/authService';
import api from '../../services/api';

jest.mock('../../services/api');

describe('authService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('register should send correct data to API', async () => {
        const mockData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'Test123!@#',
            password_confirmation: 'Test123!@#',
        };

        api.post.mockResolvedValue({
            data: {
                message: 'User registered successfully',
                token: 'mock-token',
                user: { user_id: 1, username: 'testuser' },
            },
        });

        const result = await authService.register(mockData);

        expect(api.post).toHaveBeenCalledWith('/auth/register', mockData);
        expect(result.token).toBe('mock-token');
        expect(result.user.username).toBe('testuser');
    });

    test('login should send credentials to API', async () => {
        const credentials = {
            email: 'test@example.com',
            password: 'password123',
        };

        api.post.mockResolvedValue({
            data: {
                message: 'Login successful',
                token: 'mock-token',
                user: { user_id: 1, username: 'testuser' },
            },
        });

        const result = await authService.login(credentials);

        expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
        expect(result.token).toBe('mock-token');
    });

    test('logout should call logout endpoint', async () => {
        api.post.mockResolvedValue({
            data: { message: 'Logged out successfully' },
        });

        const result = await authService.logout();

        expect(api.post).toHaveBeenCalledWith('/auth/logout');
        expect(result.message).toBe('Logged out successfully');
    });

    test('getMe should fetch current user data', async () => {
        const mockUser = {
            user_id: 1,
            username: 'testuser',
            email: 'test@example.com',
        };

        api.get.mockResolvedValue({ data: mockUser });

        const result = await authService.getMe();

        expect(api.get).toHaveBeenCalledWith('/me');
        expect(result.username).toBe('testuser');
    });

    test('register should handle API errors', async () => {
        api.post.mockRejectedValue({
            response: {
                data: { message: 'Email already exists' },
            },
        });

        try {
            await authService.register({
                username: 'testuser',
                email: 'existing@example.com',
                password: 'password123',
            });
            fail('Should have thrown error');
        } catch (error) {
            expect(error.response.data.message).toBe('Email already exists');
        }
    });
});
