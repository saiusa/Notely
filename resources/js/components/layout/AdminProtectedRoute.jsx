/**
 * components/layout/AdminProtectedRoute.jsx
 * Protects admin routes by checking:
 * 1. User is authenticated (has token)
 * 2. User has is_admin === true
 * 
 * Redirects to /home if user is not admin, to /login if not authenticated
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import Loader from '../common/Loader';
import { useAuth } from '../../context/AuthContext';

export default function AdminProtectedRoute({ children }) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#1b1c24',
            }}>
                <Loader />
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Authenticated but not admin - redirect to home
    if (!user || user.is_admin !== true) {
        return <Navigate to="/home" replace />;
    }

    // Authenticated AND admin - render the component
    return children;
}
