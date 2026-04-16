import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import NotificationButton from '../notification/NotificationButton';
import NotificationDropdown from '../notification/NotificationDropdown';
import SearchBar from '../common/SearchBar';
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

function FilterDropdown({ open, currentFilter, onFilterChange }) {
  if (!open) return null;

  const handleFilterClick = (filter) => {
    onFilterChange(filter);
  };

  return (
    <div className="top-navbar__filter-dropdown">
      <button 
        className={`top-navbar__filter-item ${currentFilter === 'recent' ? 'top-navbar__filter-item--active' : ''}`}
        onClick={() => handleFilterClick('recent')}
      >
        Recent
      </button>
      <button 
        className={`top-navbar__filter-item ${currentFilter === 'popular' ? 'top-navbar__filter-item--active' : ''}`}
        onClick={() => handleFilterClick('popular')}
      >
        Popular
      </button>
      <button 
        className={`top-navbar__filter-item ${currentFilter === 'mood' ? 'top-navbar__filter-item--active' : ''}`}
        onClick={() => handleFilterClick('mood')}
      >
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
  currentFilter,
  onFilterChange,
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
          <FilterDropdown open={filterOpen} currentFilter={currentFilter} onFilterChange={onFilterChange} />
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
  onFilterChange = () => {},
  currentFilter = 'recent',
  showBack,
  onBack,
  notificationCount = 0,
  notificationActive = false,
  onNotificationClick = () => {},
  onCloseNotification = () => {},
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

  /**
   * Fetch notifications from API (memoized)
   */
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoadingNotifications(true);
      const response = await notificationService.getNotifications(1);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (notificationActive) {
      fetchNotifications();
    }
  }, [notificationActive, fetchNotifications]);

  /**
   * Mark notification as read (memoized)
   */
  const handleMarkAsRead = useCallback(async (notificationId) => {
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
  }, []);

  /**
   * Mark all notifications as read (memoized)
   */
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  /**
   * Delete notification (memoized)
   */
  const handleDeleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prevNotifications) =>
        prevNotifications.filter((notif) => notif.notification_id !== notificationId)
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, []);

  /**
   * Close notification dropdown
   */
  const handleCloseNotification = useCallback(() => {
    onNotificationClick();
  }, [onNotificationClick]);

  /**
   * Navigate to notification settings
   */
  const handleNavigateToSettings = useCallback(() => {
    navigate('/settings/notification');
  }, [navigate]);

  const handleTabChange = useCallback((tab) => {
    setCurrentTab(tab);
    onTabChange(tab);
  }, [onTabChange]);

  const handleBack = useCallback(() => {
    if (onBack) onBack();
    else if (typeof window !== 'undefined') window.history.back();
  }, [onBack]);

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
            currentFilter={currentFilter}
            onFilterChange={onFilterChange}
            notificationCount={notificationCount}
            notificationActive={notificationActive}
            onNotificationClick={onNotificationClick}
            notifications={notifications}
            isLoadingNotifications={isLoadingNotifications}
            onMarkNotificationAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onSettingsClick={handleNavigateToSettings}
            onDeleteNotification={handleDeleteNotification}
            onCloseNotification={onCloseNotification || handleCloseNotification}
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