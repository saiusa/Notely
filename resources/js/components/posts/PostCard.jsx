import React, { useMemo, useState } from 'react';
import CommentSection from './CommentSection';
import '../../../sass/components/posts/PostCard.scss';

function RecentJournalCard({ post }) {
    return (
        <article className="post-card__recent-item">
            <div className="post-card__recent-header">
                <img
                    src={post.avatar}
                    alt={post.user}
                    className="post-card__recent-avatar"
                />
                <p className="post-card__recent-meta">
                    {post.user} • {post.time}
                </p>
            </div>

            <div className="post-card__recent-body">
                <p className="post-card__recent-text">{post.body}</p>
                {post.image && (
                    <img
                        src={post.image}
                        alt="journal"
                        className="post-card__recent-image"
                    />
                )}
            </div>
        </article>
    );
}

export default function PostCard({ post, compact = false, variant = 'feed', currentUserUsername = 'jin.bts' }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [reacted, setReacted] = useState(false);
    const [shared, setShared] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [commentInput, setCommentInput] = useState('');
    const [localComments, setLocalComments] = useState(post.commentList || []);

    const longTextLimit = 270;

    const ownsPost = useMemo(() => {
        if (typeof post.isOwner === 'boolean') {
            return post.isOwner;
        }
        return post.username === currentUserUsername;
    }, [currentUserUsername, post.isOwner, post.username]);

    const handleShare = async () => {
        const shareLink = post.link || `${window.location.origin}/#/post/${post.id}`;

        try {
            await navigator.clipboard.writeText(shareLink);
            setShared(true);
            setTimeout(() => setShared(false), 1600);
        } catch (error) {
            setShared(false);
        }
    };

    const bodyText = post.body || '';
    const shouldTruncate = bodyText.length > longTextLimit;
    const visibleBody = shouldTruncate && !expanded ? `${bodyText.slice(0, longTextLimit)}...` : bodyText;

    const handleAddComment = () => {
        const trimmed = commentInput.trim();

        if (!trimmed) {
            return;
        }

        setLocalComments((prev) => [
            ...prev,
            {
                id: `${post.id}-new-${Date.now()}`,
                username: currentUserUsername,
                avatar: post.avatar,
                text: trimmed,
            },
        ]);
        setCommentInput('');
    };

    if (variant === 'recent') {
        return <RecentJournalCard post={post} />;
    }

    return (
        <article className="post-card__container">
            <div className="post-card__header">
                <div className="post-card__author-wrap">
                    <img src={post.avatar} alt={post.user} className="post-card__author-avatar" />
                    <div className="post-card__author-meta">
                        <p className="post-card__author-name">{post.user}</p>
                        <p className="post-card__author-time">• {post.time}</p>
                    </div>
                </div>

                <div className="post-card__menu-wrap">
                    <button
                        type="button"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="post-card__menu-btn"
                        aria-label="Post options"
                    >
                        <span className="material-symbols-outlined post-card__menu-icon">more_vert</span>
                    </button>

                    {menuOpen && (
                        <div className="post-card__menu-dropdown">
                            {ownsPost ? (
                                <>
                                    <button type="button" className="post-card__menu-item">
                                        Edit Post
                                    </button>
                                    <button type="button" className="post-card__menu-item">
                                        Change Privacy
                                    </button>
                                    <button type="button" className="post-card__menu-item post-card__menu-item--danger">
                                        Delete Post
                                    </button>
                                </>
                            ) : (
                                <button type="button" className="post-card__menu-item">
                                    Report Post
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {!compact && post.title && <h3 className="post-card__title">{post.title}</h3>}

            <p
                className={`post-card__body ${
                    post.quote
                        ? 'post-card__body--quote'
                        : 'post-card__body--default'
                }`}
            >
                {post.quote ? `"${visibleBody}"` : visibleBody}
            </p>

            {shouldTruncate && (
                <button
                    type="button"
                    onClick={() => setExpanded((prev) => !prev)}
                    className="post-card__expand-btn"
                >
                    {expanded ? 'Show less' : 'Show more'}
                </button>
            )}

            {post.image && <img src={post.image} alt="post media" className="post-card__image" />}

            <div className="post-card__tags-row">
                {post.mood && (
                    <span className="post-card__mood-pill">
                        {post.mood}
                    </span>
                )}
                {post.hashtags?.map((tag) => (
                    <span key={tag}>{tag}</span>
                ))}
            </div>

            <div className="post-card__actions-wrap">
                <div className="post-card__actions-grid">
                    <button
                        type="button"
                        onClick={() => setReacted((prev) => !prev)}
                        className={`post-card__action-btn ${
                            reacted ? 'post-card__action-btn--active' : ''
                        }`}
                    >
                        <span className={`material-symbols-outlined post-card__action-icon ${reacted ? 'post-card__action-icon--active' : ''}`}>
                            {reacted ? 'favorite' : 'favorite_border'}
                        </span>
                        {post.likes}
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowComments((prev) => !prev)}
                        className={`post-card__action-btn ${
                            showComments ? 'post-card__action-btn--active' : ''
                        }`}
                    >
                        <span className="material-symbols-outlined post-card__action-icon">chat_bubble_outline</span>
                        {post.comments}
                    </button>

                    <button
                        type="button"
                        onClick={handleShare}
                        className={`post-card__action-btn ${
                            shared ? 'post-card__action-btn--active' : ''
                        }`}
                    >
                        <span className="material-symbols-outlined post-card__action-icon">share</span>
                        <span className="post-card__share-label">{shared ? 'Copied' : 'Share'}</span>
                    </button>
                </div>
            </div>

            {showComments && (
                <div className="post-card__comments-section">
                    <div className="post-card__comment-input-row">
                        <input
                            value={commentInput}
                            onChange={(event) => setCommentInput(event.target.value)}
                            placeholder="Write a comment..."
                            className="post-card__comment-input"
                        />
                        <button
                            type="button"
                            onClick={handleAddComment}
                            className="post-card__comment-send"
                            aria-label="Send comment"
                        >
                            <span className="material-symbols-outlined post-card__comment-send-icon">send</span>
                        </button>
                    </div>

                    <CommentSection comments={localComments} />
                </div>
            )}
        </article>
    );
}
