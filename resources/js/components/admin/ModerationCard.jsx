/**
 * components/admin/ModerationCard.jsx
 * Individual moderation card for displaying a flagged post
 * - Shows post author, content, image
 * - Displays reports badge
 * - Provides dismiss reports and delete post actions
 */
import React, { useState } from 'react';
import UserAvatar from '../common/UserAvatar';
import '../../../sass/components/admin/ModerationCard.scss';

export default function ModerationCard({
    post,
    onDismissReports,
    onDeletePost,
    isDismissing = false,
    isDeleting = false,
}) {
    if (!post) return null;

    // Local state
    const [isExpanded, setIsExpanded]   = useState(false);
    const [imageError, setImageError]   = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL ?? '';

    // Format the creation date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="moderation-card">
            {/* Flag badge — red when flagged, muted when cleared */}
            {post.reports_count > 0 ? (
                <div className="moderation-card__flag-badge moderation-card__flag-badge--flagged">
                    <span className="flag-icon">🚩</span>
                    <span className="flag-count">{post.reports_count} Report{post.reports_count !== 1 ? 's' : ''}</span>
                </div>
            ) : (
                <div className="moderation-card__flag-badge moderation-card__flag-badge--muted">
                    <span className="flag-count">Public Post</span>
                </div>
            )}

            {/* Header: Author Info */}
            <div className="moderation-card__header">
                <div className="author-info">
                    <div className="author-avatar" style={{ border: 'none', background: 'transparent' }}>
                        <UserAvatar user={post.user} size="sm" />
                    </div>
                    <div className="author-details">
                        <p className="author-username">{post.user?.username || 'Unknown User'}</p>
                    </div>
                </div>
                <div className="post-date">{formatDate(post.created_at)}</div>
            </div>

            {/* Content */}
            <div className="moderation-card__content">
                {post.title && <h3 className="post-title">{post.title}</h3>}

                {/* Text with expand / collapse */}
                <p className={`post-text${isExpanded ? '' : ' post-text--clamped'}`}>
                    {post.content}
                </p>
                {post.content?.length > 240 && (
                    <button
                        className="post-text-toggle"
                        onClick={() => setIsExpanded(prev => !prev)}
                    >
                        {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                )}

                {/* Image — only render if URL resolves */}
                {post.image && !imageError && (
                    <div className="post-image-container">
                        <img
                            src={`${backendUrl}/storage/${post.image}`}
                            alt="Post content"
                            className="post-image"
                            loading="lazy"
                            onError={() => setImageError(true)}
                        />
                    </div>
                )}
            </div>

            {/* Actions — right-aligned, compact */}
            <div className="moderation-card__actions">
                <button
                    className="action-btn dismiss-btn"
                    onClick={onDismissReports}
                    disabled={isDismissing || isDeleting}
                    title="Clear reports and keep the post visible"
                >
                    {isDismissing ? (
                        <><span className="btn-spinner"></span><span>Dismissing...</span></>
                    ) : (
                        <><span className="material-symbols-outlined btn-material-icon">check_circle</span><span>Dismiss Reports</span></>
                    )}
                </button>

                <button
                    className="action-btn delete-btn"
                    onClick={onDeletePost}
                    disabled={isDeleting || isDismissing}
                    title="Permanently delete this post"
                >
                    {isDeleting ? (
                        <><span className="btn-spinner"></span><span>Deleting...</span></>
                    ) : (
                        <><span className="material-symbols-outlined btn-material-icon">delete</span><span>Delete Post</span></>
                    )}
                </button>
            </div>
        </div>
    );
}
