import React, { useState } from 'react';
import { formatTimeAgo, getNotificationIcon, getNotificationMessage } from './notificationHelpers';
import notificationService from '../../services/notificationService';

function NotificationCard({ notification, onNotificationClick, onDelete, onMarkAsRead }) {
  const [isHovered, setIsHovered] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  // Extract user data from notification.data
  const userData = notification.data?.user || {};
  const actorName = userData.username || userData.name || 'Unknown';
  const actorAvatar = userData.avatar;

  // Extract initials from actor name
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
  };

  // Get a consistent color based on the actor name
  const getAvatarColor = (name) => {
    if (!name) return '#785ebf';
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  const avatarUrl = actorAvatar ? `${backendUrl}${actorAvatar}` : null;

  const message = getNotificationMessage(notification);
  const icon = getNotificationIcon(notification.type);
  const initials = getInitials(actorName);
  const avatarColor = getAvatarColor(actorName);
  const isUnread = !notification.read_at;

  // Handle marking notification as read
  const handleMarkAsReadClick = async (e) => {
    e.stopPropagation();
    if (isMarking) return;
    
    setIsMarking(true);
    try {
      await notificationService.markAsRead(notification.notification_id);
      onMarkAsRead?.(e);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    } finally {
      setIsMarking(false);
    }
  };

  // Handle notification click
  const handleClick = async () => {
    if (isUnread && onNotificationClick) {
      try {
        await notificationService.markAsRead(notification.notification_id);
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    }
    onNotificationClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`top-navbar__notification-card ${
        isUnread ? 'top-navbar__notification-card--unread' : ''
      }`}
      title={message}
    >
      {/* Left: Avatar */}
      <div className="top-navbar__notification-card-avatar">
        {avatarUrl && !avatarFailed ? (
          <img 
            src={avatarUrl}
            alt={actorName}
            className="top-navbar__notification-card-avatar-img"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <div 
            className="top-navbar__notification-card-avatar-fallback"
            style={{ backgroundColor: avatarColor }}
            title={actorName}
          >
            {initials}
          </div>
        )}
        
        {/* Badge with notification icon */}
        <div className="top-navbar__notification-card-badge">
          <span className="material-symbols-outlined">
            {icon}
          </span>
        </div>
      </div>

      {/* Middle: Content */}
      <div className="top-navbar__notification-card-content">
        <p className="top-navbar__notification-card-text">
          {message}
        </p>
        <span className="top-navbar__notification-card-time">
          {formatTimeAgo(notification.created_at)}
        </span>
      </div>

      {/* Right: Actions (on hover) */}
      {isHovered && (
        <div className="top-navbar__notification-card-actions">
          {isUnread && (
            <button
              type="button"
              className="top-navbar__notification-card-action-btn"
              onClick={handleMarkAsReadClick}
              title="Mark as read"
              aria-label="Mark as read"
              disabled={isMarking}
            >
              <span className="material-symbols-outlined">done</span>
            </button>
          )}
          <button
            type="button"
            className="top-navbar__notification-card-action-btn top-navbar__notification-card-action-btn--delete"
            onClick={onDelete}
            title="Delete notification"
            aria-label="Delete notification"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Unread indicator line */}
      {isUnread && (
        <span className="top-navbar__notification-card-unread-indicator"></span>
      )}
    </button>
  );
}

export default NotificationCard;
