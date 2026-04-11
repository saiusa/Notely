/**
 * Format time to relative string (e.g., "2h ago", "just now")
 */
export function formatTimeAgo(createdAt) {
  const now = new Date();
  const created = new Date(createdAt);
  const seconds = Math.floor((now - created) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Get notification icon based on notification type
 */
export function getNotificationIcon(type) {
  switch (type) {
    case 'like_post':
      return 'favorite-icon';
    case 'comment_post':
      return 'comment-icon';
    case 'reply_comment':
      return 'reply-icon';
    case 'mention_post':
      return 'mention-icon';
    default:
      return 'notification-icon';
  }
}

/**
 * Get notification message based on notification type
 */
export function getNotificationMessage(notification) {
  switch (notification.type) {
    case 'like_post':
      return `${notification.actor_name} liked your post`;
    case 'comment_post':
      return `${notification.actor_name} commented on your post`;
    case 'reply_comment':
      return `${notification.actor_name} replied to your comment`;
    case 'mention_post':
      return `${notification.actor_name} mentioned you`;
    default:
      return 'New notification';
  }
}
