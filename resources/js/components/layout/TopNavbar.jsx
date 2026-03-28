import React, { useEffect, useMemo, useState } from 'react';
import '../../../sass/components/layout/TopNavbar.scss';

function IconButton({ icon, label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`top-navbar__icon-button ${
        active ? 'top-navbar__icon-button--active' : 'top-navbar__icon-button--inactive'
      }`}
    >
      <span className="material-symbols-outlined top-navbar__icon">{icon}</span>
    </button>
  );
}

function SearchBar() {
  return (
    <label className="top-navbar__search">
      <span className="material-symbols-outlined top-navbar__search-icon">search</span>
      <input
        type="text"
        placeholder="Search Notely"
        className="top-navbar__search-input"
      />
    </label>
  );
}

function HomeTabs({ activeTab, onChange }) {
  return (
    <div className="top-navbar__tabs">
      <button
        type="button"
        onClick={() => onChange('explore')}
        className={`top-navbar__tab ${
          activeTab === 'explore' ? 'top-navbar__tab--active' : 'top-navbar__tab--inactive'
        }`}
      >
        Explore
      </button>
      <span className="top-navbar__tab-divider" aria-hidden="true" />
      <button
        type="button"
        onClick={() => onChange('community')}
        className={`top-navbar__tab ${
          activeTab === 'community' ? 'top-navbar__tab--active' : 'top-navbar__tab--inactive'
        }`}
      >
        Community
      </button>
    </div>
  );
}

function FilterDropdown({ open }) {
  if (!open) return null;

  return (
    <div className="top-navbar__filter-dropdown">
      <button className="top-navbar__filter-item">
        Recent
      </button>
      <button className="top-navbar__filter-item">
        Popular
      </button>
      <button className="top-navbar__filter-item">
        Most mood used
      </button>
    </div>
  );
}

function NotificationButton({ count, active, onClick }) {
  const normalizedCount = useMemo(() => {
    if (count > 99) return '99+';
    return String(Math.max(count, 0));
  }, [count]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Notifications"
      className={`top-navbar__icon-button ${
        active ? 'top-navbar__icon-button--active' : 'top-navbar__icon-button--inactive'
      }`}
    >
      <span className="material-symbols-outlined top-navbar__icon">notifications</span>
      {count > 0 && (
        <span className="top-navbar__notification-badge">
          {normalizedCount}
        </span>
      )}
    </button>
  );
}

function HomeNavbar({ activeTab, onTabChange, filterOpen, setFilterOpen, notificationCount, notificationActive, onNotificationClick }) {
  return (
    <>
      <div className="top-navbar__home-center">
        <HomeTabs activeTab={activeTab} onChange={onTabChange} />
      </div>

      <div className="top-navbar__right-controls">
        <div className="top-navbar__filter-wrap">
          <IconButton
            icon="tune"
            label="Filter"
            active={filterOpen}
            onClick={() => setFilterOpen((prev) => !prev)}
          />
          <FilterDropdown open={filterOpen} />
        </div>
        <SearchBar />
        <NotificationButton
          count={notificationCount}
          active={notificationActive}
          onClick={onNotificationClick}
        />
      </div>
    </>
  );
}

function DefaultNavbar({ title, showBack, onBack, notificationCount, notificationActive, onNotificationClick }) {
  return (
    <>
      <div className="top-navbar__left-controls">
        {showBack && <IconButton icon="arrow_back" label="Back" onClick={onBack} />}
        {title ? <span className="top-navbar__title">{title}</span> : null}
      </div>

      <div className="top-navbar__right-controls">
        <SearchBar />
        <NotificationButton
          count={notificationCount}
          active={notificationActive}
          onClick={onNotificationClick}
        />
      </div>
    </>
  );
}

export default function TopNavbar({
  mode = 'tabs',
  title = 'Home',
  activeTab = 'explore',
  onTabChange = () => {},
  showBack,
  onBack,
  notificationCount = 0,
  notificationActive = false,
  onNotificationClick = () => {},
}) {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (mode !== 'tabs') setFilterOpen(false);
  }, [mode]);

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
    onTabChange(tab);
  };

  const handleBack = () => {
    if (onBack) onBack();
    else if (typeof window !== 'undefined') window.history.back();
  };

  return (
    <>
      {/* Top Navbar */}
      <header
        className="top-navbar__container">
          
        {mode === 'tabs' ? (
          <HomeNavbar
            activeTab={currentTab}
            onTabChange={handleTabChange}
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            notificationCount={notificationCount}
            notificationActive={notificationActive}
            onNotificationClick={onNotificationClick}
          />
        ) : (
          <DefaultNavbar
            title={title}
            showBack={showBack}
            onBack={handleBack}
            notificationCount={notificationCount}
            notificationActive={notificationActive}
            onNotificationClick={onNotificationClick}
          />
        )}
      </header>

    </>
  );
}