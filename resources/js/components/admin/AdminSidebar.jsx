/**
 * components/admin/AdminSidebar.jsx
 * Admin-specific sidebar with navigation links.
 * Links: Dashboard, Users, Moderation, Settings
 */
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../common/UserAvatar';
import '../../../sass/components/admin/AdminSidebar.scss';

export default function AdminSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const pathname = location.pathname;
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const isActive = (path) => pathname.startsWith(path);

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/admin/users', label: 'Users', icon: 'people' },
        { path: '/admin/moderation', label: 'Moderation', icon: 'security' },
        { path: '/admin/settings', label: 'Settings', icon: 'settings' },
    ];

    const displayName = user?.first_name
        ? `${user.first_name} ${user.last_name || ''}`.trim()
        : user?.username || 'Admin';

    const initial = (user?.first_name || user?.username || 'A').charAt(0).toUpperCase();

    return (
        <aside className="admin-sidebar__container">
            {/* Logo */}
            <div className="admin-sidebar__logo">
                <img src="/storage/logo/Notely-Logo.svg" alt="Notely" className="admin-sidebar__logo-image" />
            </div>

            {/* Navigation */}
            <nav className="admin-sidebar__nav">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`admin-sidebar__nav-item ${isActive(item.path)
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

            {/* User Footer — mirrors user Sidebar profile section */}
            <div className="admin-sidebar__footer">
                <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="admin-sidebar__profile-toggle"
                >
                    <div className="admin-sidebar__profile-left">
                        <UserAvatar user={user} size="sm" />
                        <div className="admin-sidebar__profile-meta">
                            <p className="admin-sidebar__user-name">{displayName}</p>
                            <p className="admin-sidebar__user-email">Admin Account</p>
                        </div>
                    </div>
                    <span className={`material-symbols-outlined admin-sidebar__profile-chevron ${menuOpen ? 'admin-sidebar__profile-chevron--open' : ''}`}>
                        chevron_right
                    </span>
                </button>

                {menuOpen && (
                    <div className="admin-sidebar__profile-menu">
                        <button
                            className="admin-sidebar__profile-menu-item"
                            onClick={handleLogout}
                        >
                            <span className="material-symbols-outlined">logout</span>
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}
