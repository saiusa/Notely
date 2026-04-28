import React, { useState, useRef, useEffect } from 'react';
import NotificationCard from './NotificationCard';
import notificationService from '../../services/notificationService';

function NotificationDropdown({
  open,
  notifications,
  isLoading,
  onNotificationClick,
  onMarkAsRead,
  onMarkAllAsRead,
  onSettingsClick,
  onDeleteNotification,
  onClose,
}) {
  const [filterTab, setFilterTab] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose?.();
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
  }, [open, onClose]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(timer); document.removeEventListener('mousedown', handler); };
  }, [menuOpen]);

  if (!open) return null;

  const handleMarkAllAsRead = async () => {
    setMenuOpen(false);
    await onMarkAllAsRead?.();
  };

  const handleDeleteNotification = (e, notificationId) => {
    e.stopPropagation();
    onDeleteNotification?.(notificationId);
  };

  // Unified list — filter by unread if the tab demands it
  const filteredNotifications = filterTab === 'unread'
    ? notifications.filter((n) => !n.read_at && !n.is_read)
    : notifications;

  const hasNotifications = filteredNotifications && filteredNotifications.length > 0;
  const unreadCount = notifications.filter((n) => !n.read_at && !n.is_read).length;

  return (
    <div className="notif-dropdown" ref={dropdownRef}>
      {/* ── Header ── */}
      <div className="notif-dropdown__header">
        <h3 className="notif-dropdown__title">Notifications</h3>
        <div className="notif-dropdown__header-actions">
          {unreadCount > 0 && (
            <span className="notif-dropdown__badge">{unreadCount}</span>
          )}
          <div className="notif-dropdown__menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="notif-dropdown__menu-btn"
              onClick={() => setMenuOpen((p) => !p)}
              aria-label="Notification options"
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>
            {menuOpen && (
              <div className="notif-dropdown__menu">
                <button
                  type="button"
                  className="notif-dropdown__menu-item"
                  onClick={handleMarkAllAsRead}
                >
                  <span className="material-symbols-outlined">done_all</span>
                  Mark all as read
                </button>
                <button
                  type="button"
                  className="notif-dropdown__menu-item"
                  onClick={() => { setMenuOpen(false); onSettingsClick?.(); }}
                >
                  <span className="material-symbols-outlined">settings</span>
                  Notification settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="notif-dropdown__tabs">
        {['all', 'unread'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`notif-dropdown__tab ${filterTab === tab ? 'notif-dropdown__tab--active' : ''}`}
            onClick={() => setFilterTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="notif-dropdown__state">
          <span className="material-symbols-outlined">hourglass_empty</span>
          <p>Loading notifications…</p>
        </div>
      ) : !hasNotifications ? (
        <div className="notif-dropdown__state">
          <span className="material-symbols-outlined">notifications_none</span>
          <p>{filterTab === 'unread' ? 'All caught up!' : 'No notifications yet'}</p>
        </div>
      ) : (
        <div className="notif-dropdown__list">
          {filteredNotifications.map((notification) => (
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
      )}
    </div>
  );
}

export default NotificationDropdown;
