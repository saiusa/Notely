import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ComposerModal from './ComposerModal';
import '../../../sass/components/layout/Sidebar.scss';

export default function Sidebar({ active = 'home', onActiveChange = () => {} }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const pathname = location.pathname;

  const isCommunityBrowse = pathname.startsWith('/community/browse');
  const isCommunityMy = pathname.startsWith('/community/my-community');

  const [menuOpen, setMenuOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(pathname.startsWith('/community'));
  const [writeMenuOpen, setWriteMenuOpen] = useState(false);
  const [composerMode, setComposerMode] = useState(null);
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    if (pathname.startsWith('/community')) {
      setCommunityOpen(true);
    }
  }, [pathname]);

  // Derive display values from auth user (fallback to defaults)
  const displayName = user?.profile
    ? `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim() || user.username
    : user?.username || 'User';
  const displayUsername = user ? `@${user.username}` : '@user';
  const displayAvatar = user?.profile?.profile_picture
    || 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=120&q=80';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleWriteMenuSelect = (mode) => {
    setComposerMode(mode);
    setShowComposer(true);
    setWriteMenuOpen(false);
  };

  const handleCloseComposer = () => {
    setShowComposer(false);
    setComposerMode(null);
  };

  return (
    <aside className="sidebar__container">
      {/* Logo */}
      <div className="sidebar__logo">
        <img src="/dist/assets/Notely-Logo.svg" alt="Notely" className="sidebar__logo-image" />
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
            <span className="material-symbols-outlined sidebar__nav-icon" style={{fontVariationSettings: '"FILL" 0'}}>groups</span>
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

      {/* Write Button with Menu */}
      <div className="sidebar__write-section">
        <button
          type="button"
          className="sidebar__write-btn"
          onClick={() => setWriteMenuOpen(!writeMenuOpen)}
        >
          Write
        </button>

        {writeMenuOpen && (
          <div className="sidebar__write-menu">
            <button
              type="button"
              className="sidebar__write-menu-item"
              onClick={() => handleWriteMenuSelect('text')}
            >
              <span className="sidebar__write-menu-label">Text</span>
            </button>

            <button
              type="button"
              className="sidebar__write-menu-item"
              onClick={() => handleWriteMenuSelect('quote')}
            >
              <span className="sidebar__write-menu-label">Quote</span>
            </button>

            <button
              type="button"
              className="sidebar__write-menu-item"
              onClick={() => handleWriteMenuSelect('image')}
            >
              <span className="sidebar__write-menu-label">Image</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div className="sidebar__profile-section">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="sidebar__profile-toggle"
        >
          <div className="sidebar__profile-left">
            <img
              src={displayAvatar}
              alt={displayName}
              className="sidebar__profile-avatar"
            />
            <div className="sidebar__profile-meta">
              <p className="sidebar__profile-name">
                {displayName}
              </p>
              <p className="sidebar__profile-username">
                {displayUsername}
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
            <button
              className="sidebar__profile-menu-item"
              onClick={() => { setMenuOpen(false); navigate('/profile'); }}
            >
              <span className="material-symbols-outlined sidebar__profile-menu-icon">
                person
              </span>
              View Profile
            </button>

            <button className="sidebar__profile-menu-item" onClick={handleLogout}>
              <span className="material-symbols-outlined sidebar__profile-menu-icon">
                logout
              </span>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Composer Modal */}
      {showComposer && composerMode && (
        <ComposerModal
          mode={composerMode}
          onClose={handleCloseComposer}
        />
      )}
    </aside>
  );
}