import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/timeFormatter';
import { getMoodColorPalette } from '../../utils/moodColorMapper';
import PostContent from './PostContent';
import '../../../sass/components/posts/PostCard.scss';

/**
 * Helper function to normalize image URLs for deep routing compatibility
 * Ensures images resolve correctly regardless of current URL depth
 * Handles storage paths by adding /storage/ prefix if needed
 */
const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/storage/')) return url;
    if (url.startsWith('/')) return url;
    // For relative paths like 'posts/filename.jpg', add /storage/ prefix
    return `/storage/${url}`;
};

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
    shared = false,
    onContentClick
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
    const postType = post.type || 'text';
    const isQuote = post.quote || postType === 'quote' || false;
    
    // Community info extraction
    const postCommunity = post.community || null;
    const communityId = postCommunity?.community_id || postCommunity?.id;
    const communityName = postCommunity?.name || '';
    const categorySlug = postCommunity?.category?.slug || '';
    const hasCommunity = Boolean(postCommunity && communityId && categorySlug);

    return (
        <>
            {/* Header with Author Info */}
            <div className="post-card__header">
                <div className="post-card__author-wrap">
                    <Link to={`/profile/${postUsername}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <img 
                            src={getImageUrl(postAvatar) || ''} 
                            alt={postUsername} 
                            className="post-card__author-avatar" 
                        />
                    </Link>
                    <div className="post-card__author-meta">
                        {hasCommunity ? (
                            // Community Post Header: username ▸ Community Name • timestamp
                            <>
                                <div className="post-card__author-name-row">
                                    <Link 
                                        to={`/profile/${postUsername}`} 
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <span className="post-card__author-name">{postUsername}</span>
                                    </Link>
                                    <span className="post-card__author-separator">▸</span>
                                    <Link 
                                        to={`/community/browse/${categorySlug}/${communityId}`}
                                        className="post-card__community-link"
                                    >
                                        {communityName}
                                    </Link>
                                </div>
                                <p className="post-card__author-time">• {formatRelativeTime(postTime)}</p>
                            </>
                        ) : (
                            // Individual Post Header: username • timestamp
                            <>
                                <Link 
                                    to={`/profile/${postUsername}`} 
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <p className="post-card__author-name">{postUsername}</p>
                                </Link>
                                <p className="post-card__author-time">• {formatRelativeTime(postTime)}</p>
                            </>
                        )}
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

            {/* Content - Text, Quote, and Image - Clickable */}
            <div 
                onClick={onContentClick}
                className="cursor-pointer"
            >
                <PostContent
                    title={postTitle}
                    content={postContent}
                    image={postImage}
                    type={postType}
                    isQuote={isQuote}
                    compact={compact}
                />
            </div>

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
