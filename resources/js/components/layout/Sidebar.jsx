import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { sidebarUser } from '../../utils/socialMockData';
import NotelyLogo from './Notely-Logo.svg';
import '../../../sass/components/layout/Sidebar.scss';

const navItems = [
  { key: 'home', label: 'Home', icon: 'home', to: '/home' },
  { key: 'community', label: 'Community', icon: 'groups', to: '/community' },
  { key: 'journal', label: 'Journal', icon: 'book_2', to: '/journal' },
  { key: 'profile', label: 'Profile', icon: 'person', to: '/profile' },
  { key: 'settings', label: 'Settings', icon: 'settings', to: '/settings' },
];

export default function Sidebar({ active = 'home', onActiveChange = () => {} }) {
  const location = useLocation();
  const pathname = location.pathname;

  const isCommunityBrowse = pathname.startsWith('/community/browse');
  const isCommunityMy = pathname.startsWith('/community/my-community');

  const [menuOpen, setMenuOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(pathname.startsWith('/community'));

  
  useEffect(() => {
    if (pathname.startsWith('/community')) {
      setCommunityOpen(true);
    }
  }, [pathname]);

  return (
    <aside className="sidebar__container">
      
      {/* Logo */}
      <div className="sidebar__logo">
        <img src={NotelyLogo} alt="Notely" className="sidebar__logo-image" />
      </div>

      <nav className="sidebar__nav">
        
        {/* Home */}
        <Link
          to="/home"
          onClick={() => onActiveChange('home')}
          className={`sidebar__nav-item ${
            active === 'home'
              ? 'sidebar__nav-item--active'
              : 'sidebar__nav-item--inactive'
          }`}
        >
          <span className="material-symbols-outlined sidebar__nav-icon">home</span>
          Home
        </Link>

        {/* Community */}
        <Link
          to="/community/browse"
          onClick={() => setCommunityOpen(true)}
          className="sidebar__community-toggle"
        >
          <span className="sidebar__community-left">
            <span className="material-symbols-outlined sidebar__nav-icon">groups</span>
            Community
          </span>
          <span
            className={`material-symbols-outlined sidebar__chevron ${
              communityOpen ? 'sidebar__chevron--open' : ''
            }`}
          >
            chevron_right
          </span>
        </Link>

        {/* Community Dropdown */}
        <div className={`sidebar__community-dropdown ${communityOpen ? 'sidebar__community-dropdown--open' : ''}`}>
          <div className="sidebar__community-menu">
            <Link
              to="/community/browse"
              className={`sidebar__community-link ${
                isCommunityBrowse
                  ? 'sidebar__community-link--active'
                  : 'sidebar__community-link--inactive'
              }`}
            >
              Browse
            </Link>

            <Link
              to="/community/my-community"
              className={`sidebar__community-link ${
                isCommunityMy
                  ? 'sidebar__community-link--active'
                  : 'sidebar__community-link--inactive'
              }`}
            >
              My Community
            </Link>
          </div>
        </div>

        {/* Journal */}
        <Link
          to="/journal"
          onClick={() => onActiveChange('journal')}
          className={`sidebar__nav-item ${
            active === 'journal'
              ? 'sidebar__nav-item--active'
              : 'sidebar__nav-item--inactive'
          }`}
        >
          <span className="material-symbols-outlined sidebar__nav-icon">book_2</span>
          Journal
        </Link>

        <div className="sidebar__divider" />

        {/* Profile */}
        <Link
          to="/profile"
          onClick={() => onActiveChange('profile')}
          className={`sidebar__nav-item ${
            active === 'profile'
              ? 'sidebar__nav-item--active'
              : 'sidebar__nav-item--inactive'
          }`}
        >
          <span className="material-symbols-outlined sidebar__nav-icon">person</span>
          Profile
        </Link>

        {/* Settings */}
        <Link
          to="/settings"
          onClick={() => onActiveChange('settings')}
          className={`sidebar__nav-item ${
            active === 'settings'
              ? 'sidebar__nav-item--active'
              : 'sidebar__nav-item--inactive'
          }`}
        >
          <span className="material-symbols-outlined sidebar__nav-icon">settings</span>
          Settings
        </Link>
      </nav>

      {/* Write Button */}
      <button
        type="button"
        className="sidebar__write-btn"
      >
        Write
      </button>

      {/* Profile Section */}
      <div className="sidebar__profile-section">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="sidebar__profile-toggle"
        >
          <div className="sidebar__profile-left">
            <img
              src={sidebarUser.avatar}
              alt={sidebarUser.name}
              className="sidebar__profile-avatar"
            />
            <div className="sidebar__profile-meta">
              <p className="sidebar__profile-name">
                {sidebarUser.name}
              </p>
              <p className="sidebar__profile-username">
                {sidebarUser.username}
              </p>
            </div>
          </div>

          <span
            className={`material-symbols-outlined sidebar__profile-chevron ${
              menuOpen ? 'sidebar__profile-chevron--open' : ''
            }`}
          >
            chevron_right
          </span>
        </button>

        {menuOpen && (
          <div className="sidebar__profile-menu">
            <button className="sidebar__profile-menu-item">
              <span className="material-symbols-outlined sidebar__profile-menu-icon">
                person
              </span>
              View Profile
            </button>

            <button className="sidebar__profile-menu-item">
              <span className="material-symbols-outlined sidebar__profile-menu-icon">
                logout
              </span>
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}