import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import postService from '../../../services/postService';
import { CommentSection } from '../comments';
import '../../../../sass/components/posts/modals/PostDetailModal.scss';

export default function PostDetailModal({ post, isOpen, onClose }) {
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [reacted, setReacted] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [shared, setShared] = useState(false);

    // Update state when post changes
    useEffect(() => {
        if (post) {
            setReacted(post?.liked_by_user || false);
            setLikesCount(post?.likes_count ?? post?.likes ?? 0);
        }
    }, [post?.id]);

    // Close modal on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, onClose]);

    if (!isOpen || !post) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleLike = async (e) => {
        e.stopPropagation();
        try {
            if (reacted) {
                await postService.unlikePost(post.id);
                setLikesCount(Math.max(0, likesCount - 1));
            } else {
                await postService.likePost(post.id);
                setLikesCount(likesCount + 1);
            }
            setReacted(!reacted);
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleShare = (e) => {
        e.stopPropagation();
        setShared(!shared);
        // Copy link or share logic here
    };

    const handleCopyLink = (e) => {
        e.stopPropagation();
        if (post.id) {
            const link = `${window.location.origin}/posts/${post.id}`;
            navigator.clipboard.writeText(link);
            alert('Link copied to clipboard!');
        }
    };

    const handleMenuClick = (e) => {
        e.stopPropagation();
        setMenuOpen(!menuOpen);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        // Handle edit logic
        console.log('Edit post');
        setMenuOpen(false);
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await postService.deletePost(post.id);
                onClose();
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
        setMenuOpen(false);
    };

    const timeDisplay = post.time || post.created_at || 'just now';
    const contentBody = post.body || post.content || '';
    const imageUrl = post.image || post.image_url || null;
    const mood = post.mood || null;
    const hashtags = post.hashtags || [];
    const commentsCount = post.comments_count ?? post.comments ?? 0;
    const isOwner = post.isOwner || (user && post.user_id === user.id);

    return (
        <div 
            className="post-detail-modal__overlay"
            onClick={handleBackdropClick}
            role="presentation"
        >
            <article className="post-detail-modal">
                {/* Close button */}
                <button
                    type="button"
                    className="post-detail-modal__close"
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>

                {/* Modal content */}
                <div className="post-detail-modal__content">
                    {/* Header with user info */}
                    <div className="post-detail-modal__header">
                        <div className="post-detail-modal__user-info">
                            <img
                                src={post.avatar || post.user?.profile?.profile_picture || ''}
                                alt={post.user?.username || post.username || ''}
                                className="post-detail-modal__avatar"
                            />
                            <div className="post-detail-modal__user-details">
                                <p className="post-detail-modal__username">
                                    {post.user?.username || post.username || ''}
                                </p>
                                <time className="post-detail-modal__time">{timeDisplay}</time>
                            </div>
                        </div>

                        {/* Menu for post owner */}
                        {isOwner && (
                            <div className="post-detail-modal__menu-wrap">
                                <button
                                    type="button"
                                    className="post-detail-modal__menu-btn"
                                    onClick={handleMenuClick}
                                    aria-label="Post menu"
                                >
                                    <span className="material-symbols-outlined">more_horiz</span>
                                </button>
                                {menuOpen && (
                                    <div className="post-detail-modal__menu-dropdown">
                                        <button
                                            type="button"
                                            className="post-detail-modal__menu-item"
                                            onClick={handleEdit}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            className="post-detail-modal__menu-item post-detail-modal__menu-item--danger"
                                            onClick={handleDelete}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Post body */}
                    <div className="post-detail-modal__body">
                        {/* Mood */}
                        {mood && (
                            <div className="post-detail-modal__mood-wrap">
                                <span className="post-detail-modal__mood">{mood}</span>
                            </div>
                        )}

                        {/* Content text */}
                        <p className="post-detail-modal__text">{contentBody}</p>

                        {/* Image if available */}
                        {imageUrl && (
                            <div className="post-detail-modal__image-wrap">
                                <img
                                    src={imageUrl}
                                    alt="post"
                                    className="post-detail-modal__image"
                                />
                            </div>
                        )}

                        {/* Hashtags */}
                        {hashtags && hashtags.length > 0 && (
                            <div className="post-detail-modal__tags">
                                {hashtags.map((tag, idx) => {
                                    // Handle both string and object hashtag formats
                                    const tagName = typeof tag === 'string' 
                                        ? tag 
                                        : tag?.name || tag?.title || '';
                                    const displayTag = tagName.startsWith('#') ? tagName : `#${tagName}`;
                                    return (
                                        <span
                                            key={`tag-${idx}`}
                                            className="post-detail-modal__tag"
                                        >
                                            {displayTag}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="post-detail-modal__divider"></div>

                    {/* Stats */}
                    <div className="post-detail-modal__stats">
                        <span className="post-detail-modal__stat">
                            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                        </span>
                        <span className="post-detail-modal__stat">
                            {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}
                        </span>
                    </div>

                    {/* Divider */}
                    <div className="post-detail-modal__divider"></div>

                    {/* Action buttons */}
                    <div className="post-detail-modal__actions">
                        <button
                            type="button"
                            className={`post-detail-modal__action ${reacted ? 'post-detail-modal__action--active' : ''}`}
                            onClick={handleLike}
                        >
                            <span className="material-symbols-outlined">
                                {reacted ? 'favorite' : 'favorite_border'}
                            </span>
                            Like
                        </button>
                        <button
                            type="button"
                            className="post-detail-modal__action"
                            onClick={handleShare}
                        >
                            <span className="material-symbols-outlined">share</span>
                            Share
                        </button>
                        {post.privacy === 'public' && (
                            <button
                                type="button"
                                className="post-detail-modal__action"
                                onClick={handleCopyLink}
                            >
                                <span className="material-symbols-outlined">link</span>
                                Copy Link
                            </button>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="post-detail-modal__divider"></div>

                    {/* Comments section */}
                    <div className="post-detail-modal__comments">
                        <CommentSection post={post} />
                    </div>
                </div>
            </article>
        </div>
    );
}
