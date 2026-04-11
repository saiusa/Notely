import React, { useState } from 'react';
import { formatRelativeTime } from '../../utils/timeFormatter';
import '../../../sass/components/journal/SmallPostCard.scss';

export default function SmallPostCard({ 
    post, 
    onCardClick, 
    onEdit,
    onTogglePrivacy,
    onCopyLink
}) {
    const [menuOpen, setMenuOpen] = useState(false);

    const handleMenuClick = (e) => {
        e.stopPropagation();
        setMenuOpen(!menuOpen);
    };

    const handleCardClick = () => {
        if (onCardClick) {
            onCardClick(post);
        }
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        setMenuOpen(false);
        if (onEdit) onEdit(post);
    };

    const handleTogglePrivacy = (e) => {
        e.stopPropagation();
        setMenuOpen(false);
        if (onTogglePrivacy) onTogglePrivacy(post.id);
    };

    const handleCopyLink = (e) => {
        e.stopPropagation();
        setMenuOpen(false);
        if (onCopyLink) onCopyLink(post);
    };

    // Extract data from post
    const mood = post.mood || null;
    const hashtags = post.hashtags || [];
    const createdAt = post.created_at || post.createdAt || '';
    const timeDisplay = formatRelativeTime(createdAt);
    const imageUrl = post.image || post.image_url || null;
    const contentPreview = (post.body || post.content || '').substring(0, 140);
    const isPublic = post.isPublic || post.privacy === 'public';

    return (
        <article 
            className="small-post-card"
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleCardClick();
                }
            }}
        >
            {/* Image if available */}
            {imageUrl && (
                <div className="small-post-card__image-wrap">
                    <img 
                        src={imageUrl} 
                        alt="post" 
                        className="small-post-card__image"
                    />
                </div>
            )}

            {/* Content section */}
            <div className="small-post-card__content">
                {/* Date and menu */}
                <div className="small-post-card__header">
                    <time className="small-post-card__date">{timeDisplay}</time>
                    <div className="small-post-card__menu-wrap">
                        <button
                            type="button"
                            className="small-post-card__menu-btn"
                            aria-label="Post menu"
                            onClick={handleMenuClick}
                        >
                            <span className="material-symbols-outlined">more_vert</span>
                        </button>
                        {menuOpen && (
                            <div className="small-post-card__menu-dropdown">
                                <button 
                                    type="button" 
                                    className="small-post-card__menu-item"
                                    onClick={handleEdit}
                                >
                                    Edit Post
                                </button>
                                <button 
                                    type="button" 
                                    className="small-post-card__menu-item"
                                    onClick={handleTogglePrivacy}
                                >
                                    {isPublic ? 'Change to Private' : 'Change to Public'}
                                </button>
                                {isPublic && (
                                    <button 
                                        type="button" 
                                        className="small-post-card__menu-item"
                                        onClick={handleCopyLink}
                                    >
                                        Copy Link
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Title/Content */}
                <p className="small-post-card__title">
                    {contentPreview}
                    {contentPreview.length === 150 && '...'}
                </p>

                {/* Mood and Tags */}
                <div className="small-post-card__meta">
                    {mood && (
                        <span className="small-post-card__mood">{mood}</span>
                    )}
                    {hashtags && hashtags.length > 0 && (
                        <div className="small-post-card__tags">
                            {hashtags.slice(0, 2).map((tag, idx) => {
                                const tagName = typeof tag === 'string' 
                                    ? tag 
                                    : tag?.name || tag?.title || '';
                                const displayTag = tagName.startsWith('#') ? tagName : `#${tagName}`;
                                return (
                                    <span 
                                        key={`tag-${idx}`}
                                        className="small-post-card__tag"
                                    >
                                        {displayTag}
                                    </span>
                                );
                            })}
                            {hashtags.length > 2 && (
                                <span className="small-post-card__tag-more">
                                    +{hashtags.length - 2}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
