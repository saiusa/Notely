import React, { useMemo, useCallback } from 'react';

function NotificationButton({ count, active, onClick }) {
  const normalizedCount = useMemo(() => {
    if (count > 99) return '99+';
    return String(Math.max(count, 0));
  }, [count]);

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <button
      type="button"
      onClick={handleClick}
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

export default NotificationButton;
