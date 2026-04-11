import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import NotificationButton from '../notification/NotificationButton';
import NotificationDropdown from '../notification/NotificationDropdown';
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

function HomeNavbar({
  activeTab,
  onTabChange,
  filterOpen,
  setFilterOpen,
  notificationCount,
  notificationActive,
  onNotificationClick,
  notifications,
  isLoadingNotifications,
  onMarkNotificationAsRead,
  onMarkAllAsRead,
  onSettingsClick,
  onDeleteNotification,
  onCloseNotification,
}) {
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
        <div className="top-navbar__search-notification-wrap">
          <SearchBar />
          <div className="top-navbar__notification-wrap">
            <NotificationButton
              count={notificationCount}
              active={notificationActive}
              onClick={onNotificationClick}
            />
            <NotificationDropdown
              open={notificationActive}
              notifications={notifications}
              isLoading={isLoadingNotifications}
              onMarkAsRead={onMarkNotificationAsRead}
              onMarkAllAsRead={onMarkAllAsRead}
              onSettingsClick={onSettingsClick}
              onDeleteNotification={onDeleteNotification}
              onClose={onCloseNotification}
            />
          </div>
        </div>
      </div>
    </>
  );
}

function DefaultNavbar({
  title,
  showBack,
  onBack,
  notificationCount,
  notificationActive,
  onNotificationClick,
  notifications,
  isLoadingNotifications,
  onMarkNotificationAsRead,
  onMarkAllAsRead,
  onSettingsClick,
  onDeleteNotification,
  onCloseNotification,
}) {
  return (
    <>
      <div className="top-navbar__left-controls">
        {showBack && <IconButton icon="arrow_back" label="Back" onClick={onBack} />}
        {title ? <span className="top-navbar__title">{title}</span> : null}
      </div>

      <div className="top-navbar__right-controls">
        <div className="top-navbar__search-notification-wrap">
          <SearchBar />
          <div className="top-navbar__notification-wrap">
            <NotificationButton
              count={notificationCount}
              active={notificationActive}
              onClick={onNotificationClick}
            />
            <NotificationDropdown
              open={notificationActive}
              notifications={notifications}
              isLoading={isLoadingNotifications}
              onMarkAsRead={onMarkNotificationAsRead}
              onMarkAllAsRead={onMarkAllAsRead}
              onSettingsClick={onSettingsClick}
              onDeleteNotification={onDeleteNotification}
              onClose={onCloseNotification}
            />
          </div>
        </div>
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
  onSettingsClick = () => {},
}) {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [filterOpen, setFilterOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (mode !== 'tabs') setFilterOpen(false);
  }, [mode]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (notificationActive) {
      fetchNotifications();
    }
  }, [notificationActive]);

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const response = await notificationService.getNotifications(1);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  /**
   * Mark notification as read
   */
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.notification_id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  /**
   * Mark all notifications as read
   */
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  /**
   * Delete notification
   */
  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notif) => notif.notification_id !== notificationId)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  /**
   * Close notification dropdown
   */
  const handleCloseNotification = () => {
    if (notificationActive) {
      onNotificationClick();
    }
  };

  /**
   * Navigate to notification settings
   */
  const handleNavigateToSettings = () => {
    navigate('/settings/notification');
  };

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
      <header className="top-navbar__container">
        {mode === 'tabs' ? (
          <HomeNavbar
            activeTab={currentTab}
            onTabChange={handleTabChange}
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            notificationCount={notificationCount}
            notificationActive={notificationActive}
            onNotificationClick={onNotificationClick}
            notifications={notifications}
            isLoadingNotifications={isLoadingNotifications}
            onMarkNotificationAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onSettingsClick={handleNavigateToSettings}
            onDeleteNotification={handleDeleteNotification}
            onCloseNotification={handleCloseNotification}
          />
        ) : (
          <DefaultNavbar
            title={title}
            showBack={showBack}
            onBack={handleBack}
            notificationCount={notificationCount}
            notificationActive={notificationActive}
            onNotificationClick={onNotificationClick}
            notifications={notifications}
            isLoadingNotifications={isLoadingNotifications}
            onMarkNotificationAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onSettingsClick={handleNavigateToSettings}
            onDeleteNotification={handleDeleteNotification}
            onCloseNotification={handleCloseNotification}
          />
        )}
      </header>
    </>
  );
}