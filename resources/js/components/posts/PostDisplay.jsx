import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatRelativeTime } from '../../utils/timeFormatter';
import { getMoodColorPalette } from '../../utils/moodColorMapper';
import { getFullImageUrl } from '../../utils/imageUrl';
import PostContent from './PostContent';
import UserAvatar from '../common/UserAvatar';
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

    // Anonymous post handling
    const isAnonymous = post.is_anonymous === true;
    const displayName = post.is_anonymous ? (post.anonymous_name || "Anonymous") : post.user?.username;
    const displayAvatar = isAnonymous ? 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Cpath d=%22M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z%22 fill=%22%23999%22/%3E%3C/svg%3E' : getFullImageUrl(postAvatar);

    // User settings checks (post.settings is the POST OWNER's settings, not current user's)
    const hideReactionCounts = post.settings?.show_reaction_counts === false;
    const hideComments = post.settings?.hide_comments === true;

    return (
        <>
            {/* Header with Author Info */}
            <div className="post-card__header">
                <div className="post-card__author-wrap">
                    {/* Avatar - link only if not anonymous */}
                    {isAnonymous ? (
                        <img 
                            src={displayAvatar} 
                            alt="Anonymous" 
                            className="post-card__author-avatar" 
                        />
                    ) : (
                        <Link to={`/profile/${postUsername}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <UserAvatar
                                user={post.user}
                                size="sm"
                                className="post-card__author-avatar"
                                style={{ width: undefined, height: undefined }}
                            />
                        </Link>
                    )}
                    <div className="post-card__author-meta">
                        {hasCommunity ? (
                            // Community Post Header: username ▸ Community Name • timestamp
                            <>
                                <div className="post-card__author-name-row">
                                    {isAnonymous ? (
                                        <span className="post-card__author-name">{displayName}</span>
                                    ) : (
                                        <Link 
                                            to={`/profile/${postUsername}`} 
                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                        >
                                            <span className="post-card__author-name">{displayName}</span>
                                        </Link>
                                    )}
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
                                {isAnonymous ? (
                                    <p className="post-card__author-name">{displayName}</p>
                                ) : (
                                    <Link 
                                        to={`/profile/${postUsername}`} 
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <p className="post-card__author-name">{displayName}</p>
                                    </Link>
                                )}
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
                            <Link 
                                to={`/search?q=${encodeURIComponent(postMood)}`}
                                onClick={(e) => e.stopPropagation()}
                                className="post-card__mood-pill"
                                style={{
                                    backgroundColor: moodColors.backgroundColor,
                                    color: moodColors.textColor,
                                    textDecoration: 'none'
                                }}
                            >
                                {moodColors.emoji && <span className="post-card__mood-emoji">{moodColors.emoji}</span>}
                                {postMood}
                            </Link>
                        );
                    })()
                )}
                {postHashtags.map((tag) => (
                    <Link 
                        key={tag} 
                        to={`/search?q=${encodeURIComponent(tag)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="post-card__hashtag"
                    >
                        {tag}
                    </Link>
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
                        {!hideReactionCounts && likesCount}
                    </button>

                    {!hideComments && (
                        <button
                            type="button"
                            onClick={onCommentsClick}
                            className="post-card__action-btn"
                        >
                            <span className="material-symbols-outlined post-card__action-icon">chat_bubble_outline</span>
                            {commentsCount}
                        </button>
                    )}

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

                {/* Comments Disabled Message */}
                {hideComments && (
                    <p className="post-card__comments-disabled">
                        <em>The author has disabled comments for this post.</em>
                    </p>
                )}
            </div>
        </>
    );
}
