/**
 * components/admin/AdminModeration.jsx
 * Admin Moderation & Reports — User-Centric Queue
 *
 * Layout:
 *   - Search bar to filter reported users
 *   - List of UserTriageCard (accordion) — one per offending user
 *   - Each card expands to show "Flagged Posts" + "Flagged Comments" tabs
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import ModerationCard from './ModerationCard';
import '../../../sass/components/admin/AdminModeration.scss';

// ─── Skeleton: triage card placeholder ───────────────────────────────────────
function TriageSkeleton() {
    return (
        <div className="animate-pulse rounded-xl mb-3" aria-hidden="true"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                {/* Avatar */}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.09)', flexShrink: 0 }} />
                {/* Meta lines */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <div style={{ height: 13, width: '35%', borderRadius: 4, background: 'rgba(255,255,255,0.09)' }} />
                    <div style={{ height: 10, width: '55%', borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
                </div>
                {/* Badge */}
                <div style={{ width: 90, height: 22, borderRadius: 9999, background: 'rgba(239,68,68,0.15)', flexShrink: 0 }} />
                {/* Suspend btn */}
                <div style={{ width: 72, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
            </div>
        </div>
    );
}

// ─── ModerationCommentCard ────────────────────────────────────────────────────
function ModerationCommentCard({ comment, onDismiss, onDelete, isDismissing, isDeleting }) {
    if (!comment) return null;

    const [isExpanded, setIsExpanded] = useState(false);

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <div className="moderation-card moderation-card--comment">
            {/* Reports badge */}
            {comment.reports_count > 0 ? (
                <div className="moderation-card__flag-badge moderation-card__flag-badge--flagged">
                    <span className="flag-icon">🚩</span>
                    <span className="flag-count">
                        {comment.reports_count} Report{comment.reports_count !== 1 ? 's' : ''}
                    </span>
                </div>
            ) : (
                <div className="moderation-card__flag-badge moderation-card__flag-badge--muted">
                    <span className="flag-count">Cleared</span>
                </div>
            )}

            {/* Header */}
            <div className="moderation-card__header">
                <div className="author-info">
                    <div className="author-avatar">
                        {comment.user?.username?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="author-details">
                        <p className="author-username">{comment.user?.username || 'Unknown User'}</p>
                        <p className="author-email comment-context">
                            💬 Comment on: <em>{comment.post?.title || `Post #${comment.post?.post_id}`}</em>
                        </p>
                    </div>
                </div>
                <div className="post-date">{formatDate(comment.created_at)}</div>
            </div>

            {/* Comment text */}
            <div className="moderation-card__content">
                <p className={`post-text${isExpanded ? '' : ' post-text--clamped'}`}>
                    {comment.content}
                </p>
                {comment.content?.length > 180 && (
                    <button className="post-text-toggle" onClick={() => setIsExpanded(p => !p)}>
                        {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                )}

                {/* Parent post excerpt for context */}
                {comment.post?.content && (
                    <div className="comment-post-excerpt">
                        <span className="comment-post-excerpt__label">Original post:</span>
                        <p className="comment-post-excerpt__text">
                            {comment.post.content.slice(0, 120)}{comment.post.content.length > 120 ? '…' : ''}
                        </p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="moderation-card__actions">
                <button
                    className="action-btn dismiss-btn"
                    onClick={onDismiss}
                    disabled={isDismissing || isDeleting}
                    title="Clear reports on this comment"
                >
                    {isDismissing
                        ? <><span className="btn-spinner" /><span>Dismissing...</span></>
                        : <><span className="material-symbols-outlined btn-material-icon">check_circle</span><span>Dismiss</span></>
                    }
                </button>
                <button
                    className="action-btn delete-btn"
                    onClick={onDelete}
                    disabled={isDeleting || isDismissing}
                    title="Delete this comment"
                >
                    {isDeleting
                        ? <><span className="btn-spinner" /><span>Deleting...</span></>
                        : <><span className="material-symbols-outlined btn-material-icon">delete</span><span>Delete Comment</span></>
                    }
                </button>
            </div>
        </div>
    );
}

// ─── UserTriageCard (accordion) ───────────────────────────────────────────────
function UserTriageCard({ user, onPostDismiss, onPostDelete, onCommentDismiss, onCommentDelete, onSuspend }) {
    const [isOpen,        setIsOpen]        = useState(false);
    const [activeTab,     setActiveTab]     = useState('posts'); // 'posts' | 'comments'
    const [actionLoading, setActionLoading] = useState(null);
    const [suspending,    setSuspending]    = useState(false);
    const [avatarError,   setAvatarError]   = useState(false);

    const posts    = user.reported_posts    ?? [];
    const comments = user.reported_comments ?? [];

    const totalFlagged = posts.reduce((s, p) => s + (p.reports_count ?? 0), 0)
                       + comments.reduce((s, c) => s + (c.reports_count ?? 0), 0);

    const initials = (user.username ?? user.name ?? '?')
        .split(/[\s._-]+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');

    // Post actions ─────────────────────────────────────────────────────────────
    const handlePostDismiss = async (postId) => {
        setActionLoading(`dismiss-post-${postId}`);
        try {
            const res = await api.post(`/admin/posts/${postId}/dismiss-reports`);
            if (res.data?.success) onPostDismiss(user.id, postId);
        } catch (err) { console.error('Post dismiss failed:', err); }
        finally { setActionLoading(null); }
    };

    const handlePostDelete = async (postId) => {
        setActionLoading(`delete-post-${postId}`);
        try {
            const res = await api.delete(`/admin/posts/${postId}`);
            if (res.data?.success) onPostDelete(user.id, postId);
        } catch (err) { console.error('Post delete failed:', err); }
        finally { setActionLoading(null); }
    };

    // Comment actions ──────────────────────────────────────────────────────────
    const handleCommentDismiss = async (commentId) => {
        setActionLoading(`dismiss-comment-${commentId}`);
        try {
            const res = await api.post(`/admin/comments/${commentId}/dismiss-reports`);
            if (res.data?.success) onCommentDismiss(user.id, commentId);
        } catch (err) { console.error('Comment dismiss failed:', err); }
        finally { setActionLoading(null); }
    };

    const handleCommentDelete = async (commentId) => {
        setActionLoading(`delete-comment-${commentId}`);
        try {
            const res = await api.delete(`/admin/comments/${commentId}`);
            if (res.data?.success) onCommentDelete(user.id, commentId);
        } catch (err) { console.error('Comment delete failed:', err); }
        finally { setActionLoading(null); }
    };

    // Suspend ──────────────────────────────────────────────────────────────────
    const handleSuspend = async (e) => {
        e.stopPropagation();
        if (!window.confirm(`Suspend @${user.username}? They will be locked out until reinstated.`)) return;
        setSuspending(true);
        try {
            await api.post(`/admin/users/${user.id}/suspend`);
            onSuspend(user.id);
        } catch (err) { console.error('Suspend failed:', err); }
        finally { setSuspending(false); }
    };

    return (
        <div className={`triage-card${isOpen ? ' triage-card--open' : ''}`}>

            {/* ── Header ── */}
            <div
                className="triage-card__header"
                onClick={() => setIsOpen(prev => !prev)}
                role="button"
                aria-expanded={isOpen}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setIsOpen(p => !p)}
            >
                {user.avatar && !avatarError ? (
                    <img
                        src={user.avatar}
                        alt={user.username}
                        className="triage-card__avatar"
                        onError={() => setAvatarError(true)}
                    />
                ) : (
                    <div className="triage-card__avatar-fallback">{initials}</div>
                )}

                <div className="triage-card__user-info">
                    <span className="triage-card__username">{user.username ?? user.name ?? 'Unknown'}</span>
                    <span className="triage-card__email">{user.email ?? '—'}</span>
                </div>

                <div className="triage-card__controls">
                    <span className="triage-card__flag-badge">
                        🚩 {totalFlagged} Flagged
                    </span>

                    <button
                        className="triage-card__suspend-btn"
                        onClick={handleSuspend}
                        disabled={suspending || user.status === 'suspended'}
                        title={user.status === 'suspended' ? 'Already suspended' : 'Suspend this user'}
                    >
                        {suspending ? (
                            <span className="btn-spinner btn-spinner--sm" />
                        ) : (
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                                {user.status === 'suspended' ? 'block' : 'person_off'}
                            </span>
                        )}
                        {user.status === 'suspended' ? 'Suspended' : 'Suspend'}
                    </button>

                    <span className={`triage-card__chevron material-symbols-outlined${isOpen ? ' triage-card__chevron--open' : ''}`}>
                        expand_more
                    </span>
                </div>
            </div>

            {/* ── Expandable body ── */}
            {isOpen && (
                <div className="triage-card__body">

                    {/* Tab switcher */}
                    <div className="triage-card__tabs">
                        <button
                            className={`triage-card__tab${activeTab === 'posts' ? ' triage-card__tab--active' : ''}`}
                            onClick={() => setActiveTab('posts')}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>article</span>
                            Flagged Posts
                            {posts.length > 0 && (
                                <span className="triage-card__tab-count">{posts.length}</span>
                            )}
                        </button>
                        <button
                            className={`triage-card__tab${activeTab === 'comments' ? ' triage-card__tab--active' : ''}`}
                            onClick={() => setActiveTab('comments')}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>chat_bubble</span>
                            Flagged Comments
                            {comments.length > 0 && (
                                <span className="triage-card__tab-count">{comments.length}</span>
                            )}
                        </button>
                    </div>

                    {/* Posts panel */}
                    {activeTab === 'posts' && (
                        posts.length === 0 ? (
                            <p className="triage-card__no-posts">No flagged posts for this user.</p>
                        ) : (
                            posts.map(post => (
                                <ModerationCard
                                    key={post.post_id ?? post.id}
                                    post={post}
                                    onDismissReports={() => handlePostDismiss(post.post_id ?? post.id)}
                                    onDeletePost={() => handlePostDelete(post.post_id ?? post.id)}
                                    isDismissing={actionLoading === `dismiss-post-${post.post_id ?? post.id}`}
                                    isDeleting={actionLoading === `delete-post-${post.post_id ?? post.id}`}
                                />
                            ))
                        )
                    )}

                    {/* Comments panel */}
                    {activeTab === 'comments' && (
                        comments.length === 0 ? (
                            <p className="triage-card__no-posts">No flagged comments for this user.</p>
                        ) : (
                            comments.map(comment => (
                                <ModerationCommentCard
                                    key={comment.comment_id ?? comment.id}
                                    comment={comment}
                                    onDismiss={() => handleCommentDismiss(comment.comment_id ?? comment.id)}
                                    onDelete={() => handleCommentDelete(comment.comment_id ?? comment.id)}
                                    isDismissing={actionLoading === `dismiss-comment-${comment.comment_id ?? comment.id}`}
                                    isDeleting={actionLoading === `delete-comment-${comment.comment_id ?? comment.id}`}
                                />
                            ))
                        )
                    )}
                </div>
            )}
        </div>
    );
}

// ─── AdminModeration (page) ───────────────────────────────────────────────────
export default function AdminModeration() {
    const [users,   setUsers]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');
    const [search,  setSearch]  = useState('');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/admin/moderation/users');
            setUsers(res.data?.data ?? (Array.isArray(res.data) ? res.data : []));
        } catch (err) {
            setError(err.response?.data?.message ?? 'Failed to load flagged users. Please try again.');
            console.error('Moderation fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // Post actions ─────────────────────────────────────────────────────────────
    // Dismiss: remove the post from the moderation queue.
    // Keep the user row as long as they still have flagged comments.
    const handlePostDismiss = useCallback((userId, postId) => {
        setUsers(prev => prev
            .map(u => {
                if (u.id !== userId) return u;
                return {
                    ...u,
                    reported_posts: u.reported_posts.filter(
                        p => (p.post_id ?? p.id) !== postId
                    ),
                };
            })
            // Only remove the user row if BOTH queues are now empty
            .filter(u => u.reported_posts.length > 0 || u.reported_comments.length > 0)
        );
    }, []);

    const handlePostDelete = useCallback((userId, postId) => {
        setUsers(prev => prev
            .map(u => {
                if (u.id !== userId) return u;
                return { ...u, reported_posts: u.reported_posts.filter(p => (p.post_id ?? p.id) !== postId) };
            })
            .filter(u => u.reported_posts.length > 0 || u.reported_comments.length > 0)
        );
    }, []);

    // Comment actions ──────────────────────────────────────────────────────────
    // Dismiss: remove comment from queue. Keep user row if they still have flagged posts.
    const handleCommentDismiss = useCallback((userId, commentId) => {
        setUsers(prev => prev
            .map(u => {
                if (u.id !== userId) return u;
                return {
                    ...u,
                    reported_comments: u.reported_comments.filter(
                        c => (c.comment_id ?? c.id) !== commentId
                    ),
                };
            })
            .filter(u => u.reported_posts.length > 0 || u.reported_comments.length > 0)
        );
    }, []);

    const handleCommentDelete = useCallback((userId, commentId) => {
        setUsers(prev => prev
            .map(u => {
                if (u.id !== userId) return u;
                return { ...u, reported_comments: u.reported_comments.filter(c => (c.comment_id ?? c.id) !== commentId) };
            })
            .filter(u => u.reported_posts.length > 0 || u.reported_comments.length > 0)
        );
    }, []);

    // Suspend ──────────────────────────────────────────────────────────────────
    const handleSuspend = useCallback((userId) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'suspended', is_suspended: true } : u));
    }, []);

    // Search filter ────────────────────────────────────────────────────────────
    const filteredUsers = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return users;
        return users.filter(u =>
            u.username?.toLowerCase().includes(q) ||
            u.name?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
        );
    }, [users, search]);

    const totalFlagged = users.reduce(
        (sum, u) => sum + (u.reported_posts?.length ?? 0) + (u.reported_comments?.length ?? 0), 0
    );

    return (
        <div className="admin-moderation__container">

            {/* ── Page header ─────────────────────────────────────────── */}
            <div className="admin-moderation__header">
                <p className="admin-moderation__subtitle">Review flagged posts and comments grouped by user</p>
                {!loading && (
                    <span className="admin-moderation__count-badge">
                        <span className={`admin-moderation__pulse-dot${totalFlagged > 0 ? ' admin-moderation__pulse-dot--active' : ''}`} />
                        {totalFlagged} flagged item{totalFlagged !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* ── Search bar ──────────────────────────────────────────── */}
            <div className="admin-moderation__search-wrap">
                <span className="material-symbols-outlined admin-moderation__search-icon">search</span>
                <input
                    type="text"
                    className="admin-moderation__search"
                    placeholder="Search reported users..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    aria-label="Search reported users"
                />
                {search && (
                    <button
                        className="admin-moderation__search-clear"
                        onClick={() => setSearch('')}
                        aria-label="Clear search"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                    </button>
                )}
            </div>

            {/* ── Error banner ────────────────────────────────────────── */}
            {error && (
                <div className="admin-moderation__error">
                    <p>{error}</p>
                    <button className="admin-moderation__error-dismiss" onClick={() => setError('')} aria-label="Dismiss">✕</button>
                </div>
            )}

            {/* ── Loading skeletons ───────────────────────────────────── */}
            {loading && (
                <div className="admin-moderation__feed">
                    {[...Array(4)].map((_, i) => <TriageSkeleton key={i} />)}
                </div>
            )}

            {/* ── User triage list ────────────────────────────────────── */}
            {!loading && (
                <div className="admin-moderation__feed">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <UserTriageCard
                                key={user.id}
                                user={user}
                                onPostDismiss={handlePostDismiss}
                                onPostDelete={handlePostDelete}
                                onCommentDismiss={handleCommentDismiss}
                                onCommentDelete={handleCommentDelete}
                                onSuspend={handleSuspend}
                            />
                        ))
                    ) : (
                        <div className="admin-moderation__empty">
                            <span className="admin-moderation__empty-icon">{search ? '🔍' : '✨'}</span>
                            <p>{search ? 'No users match your search.' : 'No flagged content'}</p>
                            {!search && <span>All posts and comments are following community guidelines</span>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
