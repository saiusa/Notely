import React, { useEffect, useMemo, useState } from 'react';
import notificationService from '../../services/notificationService';
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

function NotificationDropdown({ open, notifications, isLoading, onNotificationClick, onMarkAsRead }) {
  if (!open) return null;

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.is_read && onMarkAsRead) {
      await onMarkAsRead(notification.notification_id);
    }
  };

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'like_post':
        return `${notification.actor_name} liked your post`;
      case 'comment_post':
        return `${notification.actor_name} commented on your post`;
      case 'mention_post':
        return `${notification.actor_name} mentioned you`;
      default:
        return 'New notification';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like_post':
        return 'favorite';
      case 'comment_post':
        return 'comment';
      case 'mention_post':
        return 'person';
      default:
        return 'notifications';
    }
  };

  return (
    <div className="top-navbar__notification-dropdown">
      {isLoading ? (
        <div className="top-navbar__notification-loading">
          <span className="material-symbols-outlined">hourglass_empty</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="top-navbar__notification-empty">
          <span className="material-symbols-outlined">notifications_none</span>
          <p>No notifications</p>
        </div>
      ) : (
        <div className="top-navbar__notification-list">
          {notifications.map((notification) => (
            <button
              key={notification.notification_id}
              type="button"
              onClick={() => handleNotificationClick(notification)}
              className={`top-navbar__notification-item ${
                !notification.is_read ? 'top-navbar__notification-item--unread' : ''
              }`}
            >
              <span className={`material-symbols-outlined top-navbar__notification-item-icon ${getNotificationIcon(notification.type)}`}>
                {getNotificationIcon(notification.type)}
              </span>
              <span className="top-navbar__notification-item-text">
                {getNotificationMessage(notification)}
              </span>
            </button>
          ))}
        </div>
      )}
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
}) {
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
          />
        )}
      </header>
    </>
  );
}