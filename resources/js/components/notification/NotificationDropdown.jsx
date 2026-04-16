import React, { useState, useRef, useEffect } from 'react';
import NotificationCard from './NotificationCard';
import { getNotificationIcon, getNotificationMessage } from './notificationHelpers';

function NotificationDropdown({ 
  open, 
  notifications, 
  isLoading, 
  onNotificationClick, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onSettingsClick, 
  onDeleteNotification, 
  onClose 
}) {
  const [filterTab, setFilterTab] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  // Close notification when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    // Use a small delay to prevent immediate closing
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;

    const handleMenuClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    // Use a small delay to prevent immediate closing
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleMenuClickOutside);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleMenuClickOutside);
    };
  }, [menuOpen]);

  if (!open) return null;

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read && onMarkAsRead) {
      await onMarkAsRead(notification.notification_id);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMenuOpen(false);
    if (onMarkAllAsRead) {
      await onMarkAllAsRead();
    }
  };

  const handleDeleteNotification = (e, notificationId) => {
    e.stopPropagation();
    if (onDeleteNotification) {
      onDeleteNotification(notificationId);
    }
  };

  // Filter notifications
  const filteredNotifications = filterTab === 'unread' 
    ? notifications.filter((n) => !n.is_read)
    : notifications;

  const hasNotifications = filteredNotifications && filteredNotifications.length > 0;

  // Group notifications by type
  const groupedNotifications = {
    like: filteredNotifications.filter((n) => n.type === 'like'),
    comment: filteredNotifications.filter((n) => n.type === 'comment'),
    community: filteredNotifications.filter((n) => n.type === 'community'),
  };

  return (
    <div className="top-navbar__notification-dropdown" ref={dropdownRef}>
      {/* Header */}
      <div className="top-navbar__notification-header">
        <h3 className="top-navbar__notification-title">Notifications</h3>
        <button
          type="button"
          className="top-navbar__notification-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Notification options"
        >
          <span className="material-symbols-outlined">more_vert</span>
        </button>
        {menuOpen && (
          <div className="top-navbar__notification-menu-dropdown" ref={menuRef}>
            <button
              type="button"
              className="top-navbar__notification-menu-item"
              onClick={handleMarkAllAsRead}
            >
              <span className="material-symbols-outlined">done_all</span>
              <span>Mark all as read</span>
            </button>
            <button
              type="button"
              className="top-navbar__notification-menu-item"
              onClick={() => {
                setMenuOpen(false);
                onSettingsClick?.();
              }}
            >
              <span className="material-symbols-outlined">settings</span>
              <span>Notification settings</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="top-navbar__notification-tabs">
        <button
          type="button"
          className={`top-navbar__notification-tab ${filterTab === 'all' ? 'top-navbar__notification-tab--active' : ''}`}
          onClick={() => setFilterTab('all')}
        >
          All
        </button>
        <button
          type="button"
          className={`top-navbar__notification-tab ${filterTab === 'unread' ? 'top-navbar__notification-tab--active' : ''}`}
          onClick={() => setFilterTab('unread')}
        >
          Unread
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="top-navbar__notification-loading">
          <span className="material-symbols-outlined">hourglass_empty</span>
          <p>Loading notifications...</p>
        </div>
      ) : !hasNotifications ? (
        <div className="top-navbar__notification-empty">
          <span className="material-symbols-outlined">notifications_none</span>
          <p className="top-navbar__notification-empty-title">
            {filterTab === 'unread' ? 'All caught up!' : 'No notifications yet'}
          </p>
          <p className="top-navbar__notification-empty-subtitle">
            {filterTab === 'unread' 
              ? 'You have no unread notifications' 
              : 'You will see notifications here when someone interacts with your posts'}
          </p>
        </div>
      ) : (
        <div className="top-navbar__notification-list">
          {/* Likes Section */}
          {groupedNotifications.like.length > 0 && (
            <div className="top-navbar__notification-section">
              <div className="top-navbar__notification-section-header">
                <span className="material-symbols-outlined top-navbar__notification-section-icon">favorite</span>
                <h4 className="top-navbar__notification-section-title">Likes</h4>
                <span className="top-navbar__notification-section-badge">{groupedNotifications.like.length}</span>
              </div>
              <div className="top-navbar__notification-section-items">
                {groupedNotifications.like.map((notification) => (
                  <NotificationCard
                    key={notification.notification_id}
                    notification={notification}
                    onNotificationClick={() => handleNotificationClick(notification)}
                    onDelete={(e) => handleDeleteNotification(e, notification.notification_id)}
                    onMarkAsRead={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(notification);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          {groupedNotifications.comment.length > 0 && (
            <div className="top-navbar__notification-section">
              <div className="top-navbar__notification-section-header">
                <span className="material-symbols-outlined top-navbar__notification-section-icon">comment</span>
                <h4 className="top-navbar__notification-section-title">Comments</h4>
                <span className="top-navbar__notification-section-badge">{groupedNotifications.comment.length}</span>
              </div>
              <div className="top-navbar__notification-section-items">
                {groupedNotifications.comment.map((notification) => (
                  <NotificationCard
                    key={notification.notification_id}
                    notification={notification}
                    onNotificationClick={() => handleNotificationClick(notification)}
                    onDelete={(e) => handleDeleteNotification(e, notification.notification_id)}
                    onMarkAsRead={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(notification);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Community Section */}
          {groupedNotifications.community.length > 0 && (
            <div className="top-navbar__notification-section">
              <div className="top-navbar__notification-section-header">
                <span className="material-symbols-outlined top-navbar__notification-section-icon">group</span>
                <h4 className="top-navbar__notification-section-title">Community</h4>
                <span className="top-navbar__notification-section-badge">{groupedNotifications.community.length}</span>
              </div>
              <div className="top-navbar__notification-section-items">
                {groupedNotifications.community.map((notification) => (
                  <NotificationCard
                    key={notification.notification_id}
                    notification={notification}
                    onNotificationClick={() => handleNotificationClick(notification)}
                    onDelete={(e) => handleDeleteNotification(e, notification.notification_id)}
                    onMarkAsRead={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(notification);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
