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
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 604800)}w ago`;
}

/**
 * Extract notification type class name to determine notification kind
 * E.g., 'App\Notifications\PostLiked' => 'postliked'
 */
function extractNotificationType(fullType) {
  if (!fullType) return 'notification';
  return fullType.split('\\').pop().toLowerCase();
}

/**
 * Get notification icon based on notification type
 */
export function getNotificationIcon(type) {
  const notifType = extractNotificationType(type);
  
  if (notifType.includes('like')) {
    return 'favorite';
  } else if (notifType.includes('comment') || notifType.includes('reply')) {
    return 'chat_bubble';
  } else if (notifType.includes('mention')) {
    return 'alternate_email';
  } else if (notifType.includes('community') || notifType.includes('member')) {
    return 'group';
  }
  
  return 'notifications';
}

/**
 * Get notification message based on notification type and data
 */
export function getNotificationMessage(notification) {
  if (!notification || !notification.data) return 'New notification';
  
  const data = notification.data;
  const userName = data.user?.username || data.actor_name || 'Someone';
  const notifType = extractNotificationType(notification.type);
  
  if (notifType.includes('like')) {
    return `${userName} liked your post`;
  } else if (notifType.includes('comment')) {
    return `${userName} commented on your post`;
  } else if (notifType.includes('reply')) {
    return `${userName} replied to your comment`;
  } else if (notifType.includes('mention')) {
    return `${userName} mentioned you`;
  } else if (notifType.includes('community')) {
    const communityName = data.community_name || 'a community';
    return `${userName} invited you to ${communityName}`;
  }
  
  return 'New notification from ' + userName;
}
