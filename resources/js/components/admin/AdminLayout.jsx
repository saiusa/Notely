/**
 * components/admin/AdminLayout.jsx
 * Wrapper component for admin pages.
 * - Verifies user has admin access (user.is_admin === true)
 * - Provides sidebar with admin-specific navigation
 * - Redirects non-admins to /home feed
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import '../../../sass/components/admin/AdminLayout.scss';

export default function AdminLayout({ children, title = 'Admin Panel' }) {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#1b1c24',
            }}>
                <div style={{ fontSize: '18px', color: '#8a8e99' }}>Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!user || user.is_admin !== true) {
        return <Navigate to="/home" replace />;
    }

    return (
        <div className="admin-layout__wrapper">
            <AdminSidebar />

            <div className="admin-layout__main">
                <header className="admin-layout__header">
                    <div className="admin-layout__header-content">
                        <h1 className="admin-layout__title">{title}</h1>
                        <div className="admin-layout__user-info">
                            <span className="admin-layout__badge">Admin</span>
                            <span className="admin-layout__username">{user?.username}</span>
                        </div>
                    </div>
                </header>

                <main className="admin-layout__content">
                    {children}
                </main>
            </div>
        </div>
    );
}
