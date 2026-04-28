import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTimeAgo } from './notificationHelpers';
import UserAvatar from '../common/UserAvatar';
import notificationService from '../../services/notificationService';

function NotificationCard({ notification, onNotificationClick, onDelete, onMarkAsRead }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const navigate = useNavigate();

  const data = notification.data || {};

  // ── Canonical payload keys (causer_*) with legacy fallbacks ─────────────────
  const causerName   = data.causer_name   || data.name   || data.username || 'Someone';
  const causerAvatar = data.causer_avatar || data.avatar || null;
  const causerId     = data.causer_id     || data.user_id || 0;
  const action       = data.action        || data.message || 'interacted with your content';
  const snippet      = data.snippet       || null;
  const targetUrl    = data.target_url    || (data.post_id ? `/posts/${data.post_id}` : null);

  const isUnread = !notification.read_at && !notification.is_read;

  // Build the minimal object UserAvatar needs
  const avatarUser = {
    user_id: causerId,
    username: causerName,
    avatar:   causerAvatar,
  };

  // ── Mark as read ──────────────────────────────────────────────────────────
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

  // ── Main click: mark read, close dropdown, navigate ───────────────────────
  const handleClick = async () => {
    if (isUnread) {
      try {
        await notificationService.markAsRead(notification.notification_id);
      } catch (_) { /* silent */ }
    }
    // Close dropdown first (parent callback)
    onNotificationClick?.();
    // Navigate to the linked content if we have a URL
    if (targetUrl) navigate(targetUrl);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`notif-card ${isUnread ? 'notif-card--unread' : ''}`}
    >
      {/* Left unread stripe */}
      {isUnread && <span className="notif-card__stripe" />}

      {/* Avatar */}
      <div className="notif-card__avatar">
        <UserAvatar user={avatarUser} size="sm" />
      </div>

      {/* Content */}
      <div className="notif-card__body">
        <p className="notif-card__text">
          <span className="notif-card__actor">{causerName}</span>{' '}
          <span className="notif-card__action">{action}</span>
        </p>

        {snippet && (
          <div className="notif-card__snippet">{snippet}</div>
        )}

        <span className="notif-card__time">
          {formatTimeAgo(notification.created_at)}
        </span>
      </div>

      {/* Hover actions */}
      {isHovered && (
        <div className="notif-card__actions" onClick={(e) => e.stopPropagation()}>
          {isUnread && (
            <button
              type="button"
              className="notif-card__action-btn"
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
            className="notif-card__action-btn notif-card__action-btn--delete"
            onClick={onDelete}
            title="Dismiss"
            aria-label="Dismiss notification"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}
    </button>
  );
}

export default NotificationCard;
