import React, { useState, useRef, useEffect } from 'react';
import NotificationCard from './NotificationCard';
import { getNotificationIcon, getNotificationMessage } from './notificationHelpers';
import notificationService from '../../services/notificationService';

/**
 * Extract base notification type from full class name
 * E.g., 'App\Notifications\PostLiked' => 'like'
 */
function getNotificationCategory(type) {
  if (!type) return 'other';
  
  const baseType = type.split('\\').pop().toLowerCase();
  
  if (baseType.includes('like')) return 'like';
  if (baseType.includes('comment')) return 'comment';
  if (baseType.includes('reply')) return 'reply';
  if (baseType.includes('mention')) return 'mention';
  if (baseType.includes('community') || baseType.includes('member')) return 'community';
  
  return 'other';
}

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

  // Filter notifications: unread = read_at is null
  const filteredNotifications = filterTab === 'unread' 
    ? notifications.filter((n) => !n.read_at)
    : notifications;

  const hasNotifications = filteredNotifications && filteredNotifications.length > 0;

  // Group notifications by category
  const groupedNotifications = {
    like: filteredNotifications.filter((n) => getNotificationCategory(n.type) === 'like'),
    comment: filteredNotifications.filter((n) => getNotificationCategory(n.type) === 'comment'),
    community: filteredNotifications.filter((n) => getNotificationCategory(n.type) === 'community'),
    other: filteredNotifications.filter((n) => !['like', 'comment', 'community'].includes(getNotificationCategory(n.type))),
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'like':
        return 'favorite';
      case 'comment':
        return 'chat_bubble';
      case 'community':
        return 'group';
      default:
        return 'notifications';
    }
  };

  const getCategoryTitle = (category) => {
    switch (category) {
      case 'like':
        return 'Likes';
      case 'comment':
        return 'Comments';
      case 'community':
        return 'Communities';
      default:
        return 'Other';
    }
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
            {filterTab === 'unread' ? 'All caught up!' : 'No new notifications'}
          </p>
        </div>
      ) : (
        <div className="top-navbar__notification-list">
          {/* Likes Section */}
          {groupedNotifications.like.length > 0 && (
            <div className="top-navbar__notification-section">
              <div className="top-navbar__notification-section-header">
                <span className="material-symbols-outlined top-navbar__notification-section-icon">{getCategoryIcon('like')}</span>
                <h4 className="top-navbar__notification-section-title">{getCategoryTitle('like')}</h4>
                <span className="top-navbar__notification-section-badge">{groupedNotifications.like.length}</span>
              </div>
              <div className="top-navbar__notification-section-items">
                {groupedNotifications.like.map((notification) => (
                  <NotificationCard
                    key={notification.notification_id}
                    notification={notification}
                    onNotificationClick={onNotificationClick}
                    onDelete={(e) => handleDeleteNotification(e, notification.notification_id)}
                    onMarkAsRead={(e) => {
                      e.stopPropagation();
                      onMarkAsRead?.(notification.notification_id);
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
                <span className="material-symbols-outlined top-navbar__notification-section-icon">{getCategoryIcon('comment')}</span>
                <h4 className="top-navbar__notification-section-title">{getCategoryTitle('comment')}</h4>
                <span className="top-navbar__notification-section-badge">{groupedNotifications.comment.length}</span>
              </div>
              <div className="top-navbar__notification-section-items">
                {groupedNotifications.comment.map((notification) => (
                  <NotificationCard
                    key={notification.notification_id}
                    notification={notification}
                    onNotificationClick={onNotificationClick}
                    onDelete={(e) => handleDeleteNotification(e, notification.notification_id)}
                    onMarkAsRead={(e) => {
                      e.stopPropagation();
                      onMarkAsRead?.(notification.notification_id);
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
                <span className="material-symbols-outlined top-navbar__notification-section-icon">{getCategoryIcon('community')}</span>
                <h4 className="top-navbar__notification-section-title">{getCategoryTitle('community')}</h4>
                <span className="top-navbar__notification-section-badge">{groupedNotifications.community.length}</span>
              </div>
              <div className="top-navbar__notification-section-items">
                {groupedNotifications.community.map((notification) => (
                  <NotificationCard
                    key={notification.notification_id}
                    notification={notification}
                    onNotificationClick={onNotificationClick}
                    onDelete={(e) => handleDeleteNotification(e, notification.notification_id)}
                    onMarkAsRead={(e) => {
                      e.stopPropagation();
                      onMarkAsRead?.(notification.notification_id);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Other Section */}
          {groupedNotifications.other.length > 0 && (
            <div className="top-navbar__notification-section">
              <div className="top-navbar__notification-section-header">
                <span className="material-symbols-outlined top-navbar__notification-section-icon">{getCategoryIcon('other')}</span>
                <h4 className="top-navbar__notification-section-title">{getCategoryTitle('other')}</h4>
                <span className="top-navbar__notification-section-badge">{groupedNotifications.other.length}</span>
              </div>
              <div className="top-navbar__notification-section-items">
                {groupedNotifications.other.map((notification) => (
                  <NotificationCard
                    key={notification.notification_id}
                    notification={notification}
                    onNotificationClick={onNotificationClick}
                    onDelete={(e) => handleDeleteNotification(e, notification.notification_id)}
                    onMarkAsRead={(e) => {
                      e.stopPropagation();
                      onMarkAsRead?.(notification.notification_id);
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
