/**
 * context/AuthContext.jsx
 * Global authentication state: user, token, login/register/logout actions.
 * Wraps the entire app so any component can call useAuth().
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
    const [loading, setLoading] = useState(true);

    // ── On mount: if a token exists, fetch current user ──
    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }
        authService.getMe()
            .then((userData) => setUser(userData))
            .catch(() => {
                // Token is invalid / expired
                localStorage.removeItem('auth_token');
                setToken(null);
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /** Persist token to localStorage and state */
    const saveToken = useCallback((newToken) => {
        localStorage.setItem('auth_token', newToken);
        setToken(newToken);
    }, []);

    /** Login with email + password → stores token, sets user */
    const login = useCallback(async (email, password) => {
        const data = await authService.login({ email, password });
        saveToken(data.token);
        // Fetch full user profile (includes profile, setting, communities)
        const userData = await authService.getMe();
        setUser(userData);
        return data;
    }, [saveToken]);

    /** Register a new account → stores token, sets user */
    const register = useCallback(async (payload) => {
        const data = await authService.register(payload);
        saveToken(data.token);
        const userData = await authService.getMe();
        setUser(userData);
        return data;
    }, [saveToken]);

    /** Logout → clears token + user */
    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch (_) {
            // Even if the API call fails, clear local state
        }
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
    }, []);

    /** Refresh user data from API (e.g., after profile edit) */
    const refreshUser = useCallback(async () => {
        const userData = await authService.getMe();
        setUser(userData);
        return userData;
    }, []);

    const value = useMemo(() => ({
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        refreshUser,
    }), [user, token, loading, login, register, logout, refreshUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/** Hook to access auth state from any component */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
