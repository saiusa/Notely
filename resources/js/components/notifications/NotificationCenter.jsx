import React, { useState, useEffect } from 'react';
import notificationService from '../../services/notificationService';
import NotificationItem from './NotificationItem';
import '../../../sass/components/notifications/NotificationCenter.scss';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  /**
   * Fetch notifications from API
   */
  const fetchNotifications = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      const response = await notificationService.getNotifications(pageNum);
      setNotifications(response.data || []);
      setHasMore(response.has_more || false);
      setPage(pageNum);
      setError('');
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch unread count
   */
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.unread_count || 0);
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  /**
   * Handle notification read
   */
  const handleNotificationRead = (notificationId) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.notification_id === notificationId
          ? { ...notif, is_read: true }
          : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  /**
   * Handle notification deleted
   */
  const handleNotificationDeleted = (notificationId) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notif) => notif.notification_id !== notificationId)
    );
  };

  /**
   * Mark all as read
   */
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  /**
   * Delete all notifications
   */
  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) {
      return;
    }
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to delete all notifications:', err);
    }
  };

  /**
   * Load more notifications
   */
  const handleLoadMore = () => {
    fetchNotifications(page + 1);
  };

  if (isLoading && notifications.length === 0) {
    return (
      <div className="notification-center notification-center--loading">
        <div className="notification-center__spinner">
          <span className="material-symbols-outlined">hourglass_empty</span>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className="notification-center notification-center--error">
        <div className="notification-center__error-message">
          <span className="material-symbols-outlined">error</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-center">
      <div className="notification-center__header">
        <h1 className="notification-center__title">Notifications</h1>
        {unreadCount > 0 && (
          <span className="notification-center__unread-badge">{unreadCount}</span>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="notification-center__actions">
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            className="notification-center__action-btn"
            disabled={unreadCount === 0}
          >
            <span className="material-symbols-outlined">done_all</span>
            Mark all as read
          </button>
          <button
            type="button"
            onClick={handleDeleteAll}
            className="notification-center__action-btn notification-center__action-btn--danger"
          >
            <span className="material-symbols-outlined">delete</span>
            Delete all
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="notification-center__empty">
          <span className="material-symbols-outlined">notifications_none</span>
          <p>No notifications yet</p>
        </div>
      ) : (
        <>
          <div className="notification-center__list">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.notification_id}
                notification={notification}
                onNotificationRead={handleNotificationRead}
                onNotificationDeleted={handleNotificationDeleted}
              />
            ))}
          </div>

          {hasMore && (
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoading}
              className="notification-center__load-more"
            >
              {isLoading ? 'Loading...' : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
