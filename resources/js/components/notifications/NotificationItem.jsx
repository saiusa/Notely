import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import '../../../sass/components/notifications/NotificationItem.scss';

export default function NotificationItem({ notification, onNotificationRead, onNotificationDeleted }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Get notification message based on type
   */
  const getNotificationMessage = () => {
    switch (notification.type) {
      case 'like_post':
        return `${notification.actor_name} liked your post`;
      case 'comment_post':
        return `${notification.actor_name} commented on your post`;
      case 'mention_post':
        return `${notification.actor_name} mentioned you in a post`;
      default:
        return 'You have a new notification';
    }
  };

  /**
   * Get icon based on notification type
   */
  const getNotificationIcon = () => {
    switch (notification.type) {
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

  /**
   * Format time since notification was created
   */
  const formatTimeAgo = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const seconds = Math.floor((now - created) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  /**
   * Handle notification click to navigate to related resource
   */
  const handleNotificationClick = async () => {
    if (!notification.is_read) {
      try {
        setIsLoading(true);
        await notificationService.markAsRead(notification.notification_id);
        if (onNotificationRead) {
          onNotificationRead(notification.notification_id);
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      } finally {
        setIsLoading(false);
      }
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'like_post':
      case 'comment_post':
      case 'mention_post':
        navigate(`/post/${notification.reference_id}`);
        break;
      default:
        break;
    }
  };

  /**
   * Handle delete notification
   */
  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      setIsLoading(true);
      await notificationService.deleteNotification(notification.notification_id);
      if (onNotificationDeleted) {
        onNotificationDeleted(notification.notification_id);
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`notification-item ${!notification.is_read ? 'notification-item--unread' : ''}`}
      onClick={handleNotificationClick}
    >
      <div className="notification-item__avatar">
        <img
          src={notification.actor_avatar || 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=120&q=80'}
          alt={notification.actor_name}
          className="notification-item__avatar-img"
        />
        <span className={`notification-item__icon material-symbols-outlined ${getNotificationIcon()}`}>
          {getNotificationIcon()}
        </span>
      </div>

      <div className="notification-item__content">
        <p className="notification-item__message">
          {getNotificationMessage()}
        </p>
        <time className="notification-item__time">
          {formatTimeAgo(notification.created_at)}
        </time>
      </div>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isLoading}
        className="notification-item__delete-btn"
        aria-label="Delete notification"
      >
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  );
}
