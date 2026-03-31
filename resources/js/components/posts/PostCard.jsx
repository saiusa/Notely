import React, { useMemo, useState } from 'react';
import CommentSection from './CommentSection';
import postService from '../../services/postService';
import { useAuth } from '../../context/AuthContext';
import '../../../sass/components/posts/PostCard.scss';

function RecentJournalCard({ post }) {
    return (
        <article className="post-card__recent-item">
            <div className="post-card__recent-header">
                <img
                    src={post.avatar || post.user?.profile?.profile_picture || ''}
                    alt={post.user?.username || post.username || ''}
                    className="post-card__recent-avatar"
                />
                <p className="post-card__recent-meta">
                    {post.user?.username || post.username || ''} • {post.time || post.created_at || ''}
                </p>
            </div>

            <div className="post-card__recent-body">
                <p className="post-card__recent-text">{post.body || post.content || ''}</p>
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

export default function PostCard({ post, compact = false, variant = 'feed', onPostDeleted }) {
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [reacted, setReacted] = useState(post.liked_by_user || false);
    const [likesCount, setLikesCount] = useState(post.likes_count ?? post.likes ?? 0);
    const [commentsCount, setCommentsCount] = useState(post.comments_count ?? post.comments ?? 0);
    const [shared, setShared] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [commentInput, setCommentInput] = useState('');
    const [localComments, setLocalComments] = useState(post.commentList || []);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentsLoaded, setCommentsLoaded] = useState(false);

    const longTextLimit = 270;

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

    const ownsPost = useMemo(() => {
        if (typeof post.isOwner === 'boolean') return post.isOwner;
        if (user) return (post.user_id === user.user_id) || (postUsername === user.username);
        return false;
    }, [user, post.isOwner, post.user_id, postUsername]);

    const handleShare = async () => {
        const shareLink = post.link || `${window.location.origin}/#/post/${post.post_id || post.id}`;
        try {
            await navigator.clipboard.writeText(shareLink);
            setShared(true);
            setTimeout(() => setShared(false), 1600);
        } catch (_) {
            setShared(false);
        }
    };

    const handleToggleLike = async () => {
        const postId = post.post_id || post.id;
        try {
            if (reacted) {
                await postService.unlikePost(postId);
                setReacted(false);
                setLikesCount((prev) => Math.max(0, (typeof prev === 'number' ? prev : 0) - 1));
            } else {
                await postService.likePost(postId);
                setReacted(true);
                setLikesCount((prev) => (typeof prev === 'number' ? prev : 0) + 1);
            }
        } catch (_) {
            // Silently fail — optimistic UI will revert on next load
        }
    };

    const handleLoadComments = async () => {
        if (commentsLoaded) {
            setShowComments((prev) => !prev);
            return;
        }
        setShowComments(true);
        setLoadingComments(true);
        try {
            const postId = post.post_id || post.id;
            const res = await postService.getComments(postId);
            const apiComments = (res.data || res || []).map((c) => ({
                id: c.comment_id || c.id,
                username: c.user?.username || c.username || '',
                avatar: c.user?.profile?.profile_picture || c.avatar || '',
                text: c.content || c.text || '',
            }));
            setLocalComments(apiComments);
            setCommentsLoaded(true);
        } catch (_) {
            // Fall back to existing local comments
        } finally {
            setLoadingComments(false);
        }
    };

    const handleAddComment = async () => {
        const trimmed = commentInput.trim();
        if (!trimmed) return;

        const postId = post.post_id || post.id;
        try {
            const newComment = await postService.createComment(postId, trimmed);
            setLocalComments((prev) => [
                ...prev,
                {
                    id: newComment.comment_id || `${postId}-new-${Date.now()}`,
                    username: user?.username || '',
                    avatar: user?.profile?.profile_picture || '',
                    text: trimmed,
                },
            ]);
            setCommentInput('');
            setCommentsCount((prev) => (typeof prev === 'number' ? prev : 0) + 1);
        } catch (_) {
            // Fallback: add locally
            setLocalComments((prev) => [
                ...prev,
                {
                    id: `${postId}-new-${Date.now()}`,
                    username: user?.username || 'you',
                    avatar: '',
                    text: trimmed,
                },
            ]);
            setCommentInput('');
        }
    };

    const handleDeletePost = async () => {
        const postId = post.post_id || post.id;
        try {
            await postService.deletePost(postId);
            setMenuOpen(false);
            if (onPostDeleted) onPostDeleted(postId);
        } catch (_) {
            // ignore
        }
    };

    const handleReportPost = async () => {
        const postId = post.post_id || post.id;
        try {
            await postService.reportPost(postId, 'Reported by user');
            setMenuOpen(false);
        } catch (_) {
            // ignore
        }
    };

    const shouldTruncate = postContent.length > longTextLimit;
    const visibleBody = shouldTruncate && !expanded ? `${postContent.slice(0, longTextLimit)}...` : postContent;

    if (variant === 'recent') {
        return <RecentJournalCard post={post} />;
    }

    return (
        <article className="post-card__container">
            <div className="post-card__header">
                <div className="post-card__author-wrap">
                    <img src={postAvatar} alt={postUsername} className="post-card__author-avatar" />
                    <div className="post-card__author-meta">
                        <p className="post-card__author-name">{postUsername}</p>
                        <p className="post-card__author-time">• {postTime}</p>
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
                                    <button type="button" className="post-card__menu-item post-card__menu-item--danger" onClick={handleDeletePost}>
                                        Delete Post
                                    </button>
                                </>
                            ) : (
                                <button type="button" className="post-card__menu-item" onClick={handleReportPost}>
                                    Report Post
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {!compact && postTitle && <h3 className="post-card__title">{postTitle}</h3>}

            <p
                className={`post-card__body ${
                    isQuote
                        ? 'post-card__body--quote'
                        : 'post-card__body--default'
                }`}
            >
                {isQuote ? `"${visibleBody}"` : visibleBody}
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

            {postImage && <img src={postImage} alt="post media" className="post-card__image" />}

            <div className="post-card__tags-row">
                {postMood && (
                    <span className="post-card__mood-pill">
                        {postMood}
                    </span>
                )}
                {postHashtags.map((tag) => (
                    <span key={tag}>{tag}</span>
                ))}
            </div>

            <div className="post-card__actions-wrap">
                <div className="post-card__actions-grid">
                    <button
                        type="button"
                        onClick={handleToggleLike}
                        className={`post-card__action-btn ${
                            reacted ? 'post-card__action-btn--active' : ''
                        }`}
                    >
                        <span className={`material-symbols-outlined post-card__action-icon ${reacted ? 'post-card__action-icon--active' : ''}`}>
                            {reacted ? 'favorite' : 'favorite_border'}
                        </span>
                        {likesCount}
                    </button>

                    <button
                        type="button"
                        onClick={handleLoadComments}
                        className={`post-card__action-btn ${
                            showComments ? 'post-card__action-btn--active' : ''
                        }`}
                    >
                        <span className="material-symbols-outlined post-card__action-icon">chat_bubble_outline</span>
                        {commentsCount}
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
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
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

                    {loadingComments ? (
                        <p style={{ color: '#a5abb9', fontSize: '13px', padding: '8px 0' }}>Loading comments...</p>
                    ) : (
                        <CommentSection comments={localComments} />
                    )}
                </div>
            )}
        </article>
    );
}
