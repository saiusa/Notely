/**
 * components/layout/ProtectedRoute.jsx
 * Redirects unauthenticated users to /login.
 * Shows a loading spinner while the initial auth check is running.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#1b1c24',
                color: '#a5abb9',
                fontFamily: 'Roboto, sans-serif',
                fontSize: '16px',
            }}>
                <span className="material-symbols-outlined" style={{ marginRight: 8 }}>hourglass_top</span>
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
