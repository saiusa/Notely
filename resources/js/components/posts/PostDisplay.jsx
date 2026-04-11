import React, { useState } from 'react';
import { formatRelativeTime } from '../../utils/timeFormatter';
import { getMoodColorPalette } from '../../utils/moodColorMapper';
import PostContent from './PostContent';
import '../../../sass/components/posts/PostCard.scss';

/**
 * PostDisplay - Pure presentation component for post content
 * Reusable in PostCard, CommentFloatingModal, and other contexts
 * No modal logic, no menu logic - just display
 */
export default function PostDisplay({ 
    post, 
    compact = false,
    hideMenu = false,
    onLike,
    onShare,
    liked = false,
    likesCount = 0,
    commentsCount = 0,
    onCommentsClick,
    onMenuClick,
    menuOpen = false,
    ownsPost = false,
    onDelete,
    onReport,
    onEdit,
    onTogglePrivacy,
    shared = false
}) {
    // Normalize data fields — supports both mock and API shapes
    const postUsername = post.user?.username || post.username || '';
    const postAvatar = post.user?.profile?.profile_picture || post.avatar || '';
    const postContent = post.content || post.body || '';
    const postTime = post.created_at || post.time || '';
    const postTitle = post.title || '';
    const postMood = post.mood?.name || post.mood || '';
    const postHashtags = post.hashtags?.map((h) => (typeof h === 'string' ? h : `#${h.name}`)) || [];
    const postImage = post.image || null;
    const isQuote = post.quote || false;

    return (
        <>
            {/* Header with Author Info */}
            <div className="post-card__header">
                <div className="post-card__author-wrap">
                    <img src={postAvatar} alt={postUsername} className="post-card__author-avatar" />
                    <div className="post-card__author-meta">
                        <p className="post-card__author-name">{postUsername}</p>
                        <p className="post-card__author-time">• {formatRelativeTime(postTime)}</p>
                    </div>
                </div>

                {!hideMenu && (
                    <div className="post-card__menu-wrap">
                        <button
                            type="button"
                            onClick={onMenuClick}
                            className="post-card__menu-btn"
                            aria-label="Post options"
                        >
                            <span className="material-symbols-outlined post-card__menu-icon">more_vert</span>
                        </button>

                        {menuOpen && (
                            <div className="post-card__menu-dropdown">
                                {ownsPost ? (
                                    <>
                                        <button 
                                            type="button" 
                                            className="post-card__menu-item"
                                            onClick={onEdit}
                                        >
                                            Edit Post
                                        </button>
                                        <button 
                                            type="button" 
                                            className="post-card__menu-item"
                                            onClick={onTogglePrivacy}
                                        >
                                            Change Privacy
                                        </button>
                                        <button type="button" className="post-card__menu-item post-card__menu-item--danger" onClick={onDelete}>
                                            Delete Post
                                        </button>
                                    </>
                                ) : (
                                    <button type="button" className="post-card__menu-item post-card__menu-item--danger" onClick={onReport}>
                                        Report Post
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Title */}
            {!compact && postTitle && <h3 className="post-card__title">{postTitle}</h3>}

            {/* Content - Text, Quote, and Image */}
            <PostContent
                title={postTitle}
                content={postContent}
                image={postImage}
                isQuote={isQuote}
                compact={compact}
            />

            {/* Mood & Hashtags */}
            <div className="post-card__tags-row">
                {postMood && (
                    (() => {
                        const moodColors = getMoodColorPalette(postMood);
                        return (
                            <span 
                                className="post-card__mood-pill"
                                style={{
                                    backgroundColor: moodColors.backgroundColor,
                                    color: moodColors.textColor,
                                }}
                            >
                                {moodColors.emoji && <span className="post-card__mood-emoji">{moodColors.emoji}</span>}
                                {postMood}
                            </span>
                        );
                    })()
                )}
                {postHashtags.map((tag) => (
                    <span key={tag} className="post-card__hashtag">{tag}</span>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="post-card__actions-wrap">
                <div className="post-card__actions-grid">
                    <button
                        type="button"
                        onClick={onLike}
                        className={`post-card__action-btn ${
                            liked ? 'post-card__action-btn--active' : ''
                        }`}
                    >
                        <span className={`material-symbols-outlined post-card__action-icon ${liked ? 'post-card__action-icon--active' : ''}`}>
                            {liked ? 'favorite' : 'favorite_border'}
                        </span>
                        {likesCount}
                    </button>

                    <button
                        type="button"
                        onClick={onCommentsClick}
                        className="post-card__action-btn"
                    >
                        <span className="material-symbols-outlined post-card__action-icon">chat_bubble_outline</span>
                        {commentsCount}
                    </button>

                    <button
                        type="button"
                        onClick={onShare}
                        className={`post-card__action-btn ${
                            shared ? 'post-card__action-btn--active' : ''
                        }`}
                    >
                        <span className="material-symbols-outlined post-card__action-icon">share</span>
                        <span className="post-card__share-label">{shared ? 'Copied' : 'Share'}</span>
                    </button>
                </div>
            </div>
        </>
    );
}
