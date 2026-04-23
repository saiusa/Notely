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

    // ── On mount: try remember_token first, then check API token ──
    useEffect(() => {
        const tryAutoLogin = async () => {
            const rememberToken = localStorage.getItem('remember_token');
            
            // Try auto-login with remember_token first
            if (rememberToken && !token) {
                try {
                    const data = await authService.validateRememberToken({ remember_token: rememberToken });
                    saveToken(data.token);
                    localStorage.setItem('remember_token', data.remember_token);
                    const userData = await authService.getMe();
                    setUser(userData);
                    setLoading(false);
                    return;
                } catch (_) {
                    // Remember token is invalid, clear it
                    localStorage.removeItem('remember_token');
                }
            }

            // Fall back to API token validation
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
        };

        tryAutoLogin();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /** Persist token to localStorage and state */
    const saveToken = useCallback((newToken) => {
        localStorage.setItem('auth_token', newToken);
        setToken(newToken);
    }, []);

    /** Login with email + password → stores token, sets user */
    const login = useCallback(async (email, password, rememberMe = false) => {
        const data = await authService.login({ email, password, remember_me: rememberMe });
        saveToken(data.token);
        
        // Store remember_token if provided and remember_me was checked
        if (rememberMe && data.remember_token) {
            localStorage.setItem('remember_token', data.remember_token);
        } else {
            localStorage.removeItem('remember_token');
        }
        
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

    /** Logout → clears token + user + remember_token */
    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch (_) {
            // Even if the API call fails, clear local state
        }
        localStorage.removeItem('auth_token');
        localStorage.removeItem('remember_token');
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
