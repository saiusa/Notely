/**
 * components/admin/AdminSidebar.jsx
 * Admin-specific sidebar with navigation links.
 * Links: Dashboard, Users, Moderation, Settings
 */
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../../sass/components/admin/AdminSidebar.scss';

export default function AdminSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const pathname = location.pathname;

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    // Determine active nav item based on current pathname
    const isActive = (path) => pathname.startsWith(path);

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/admin/users', label: 'Users', icon: 'people' },
        { path: '/admin/moderation', label: 'Moderation', icon: 'security' },
        { path: '/admin/settings', label: 'Settings', icon: 'settings' },
    ];

    return (
        <aside className="admin-sidebar__container">
            {/* Logo */}
            <div className="admin-sidebar__logo">
                <img src="/storage/logo/Notely-Logo.svg" alt="Notely" className="admin-sidebar__logo-image" />
                <span className="admin-sidebar__badge">Admin</span>
            </div>

            {/* Navigation */}
            <nav className="admin-sidebar__nav">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`admin-sidebar__nav-item ${
                            isActive(item.path)
                                ? 'admin-sidebar__nav-item--active'
                                : 'admin-sidebar__nav-item--inactive'
                        }`}
                    >
                        <span className="material-symbols-outlined admin-sidebar__nav-icon">
                            {item.icon}
                        </span>
                        <span className="admin-sidebar__nav-label">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* User Section at Bottom */}
            <div className="admin-sidebar__footer">
                <div className="admin-sidebar__user-card">
                    <div className="admin-sidebar__user-info">
                        <p className="admin-sidebar__user-name">
                            {user?.profile
                                ? `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim() ||
                                  user?.username
                                : user?.username || 'Admin'}
                        </p>
                        <p className="admin-sidebar__user-email">{user?.email}</p>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    type="button"
                    onClick={handleLogout}
                    className="admin-sidebar__logout-btn"
                    aria-label="Logout"
                >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="admin-sidebar__logout-label">Logout</span>
                </button>
            </div>
        </aside>
    );
}
