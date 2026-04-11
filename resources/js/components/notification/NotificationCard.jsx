import React, { useState } from 'react';
import { formatTimeAgo, getNotificationIcon, getNotificationMessage } from './notificationHelpers';

function NotificationCard({ notification, onNotificationClick, onDelete, onMarkAsRead }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onNotificationClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`top-navbar__notification-card ${
        !notification.is_read ? 'top-navbar__notification-card--unread' : ''
      }`}
    >
      <div className="top-navbar__notification-card-avatar">
        <img 
          src={notification.actor_avatar || '/default-avatar.png'} 
          alt={notification.actor_name}
          className="top-navbar__notification-card-avatar-img"
        />
        <span className={`material-symbols-outlined top-navbar__notification-card-badge ${getNotificationIcon(notification.type)}`}>
          {getNotificationIcon(notification.type)}
        </span>
      </div>
      
      <div className="top-navbar__notification-card-content">
        <p className="top-navbar__notification-card-text">
          <strong>{notification.actor_name}</strong> {getNotificationMessage(notification).split(notification.actor_name)[1]}
        </p>
        <span className="top-navbar__notification-card-time">
          {formatTimeAgo(notification.created_at)}
        </span>
      </div>

      {isHovered && (
        <div className="top-navbar__notification-card-actions">
          {!notification.is_read && (
            <button
              type="button"
              className="top-navbar__notification-card-action-btn"
              onClick={onMarkAsRead}
              title="Mark as read"
            >
              <span className="material-symbols-outlined">done</span>
            </button>
          )}
          <button
            type="button"
            className="top-navbar__notification-card-action-btn top-navbar__notification-card-action-btn--delete"
            onClick={onDelete}
            title="Delete"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {!notification.is_read && (
        <span className="top-navbar__notification-card-unread-indicator"></span>
      )}
    </button>
  );
}

export default NotificationCard;
