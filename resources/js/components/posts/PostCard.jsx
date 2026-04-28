import React, { useMemo, useState } from 'react';
import { CommentFloatingModal, ReportModal } from './comments';
import PostDisplay from './PostDisplay';
import ComposerModal from '../layout/ComposerModal';
import RecentJournalCard from '../journal/RecentJournalCard';
import ShareModal from './ShareModal';
import postService from '../../services/postService';
import { useAuth } from '../../context/AuthContext';
import '../../../sass/components/posts/PostCard.scss';

export default function PostCard({ post, compact = false, variant = 'feed', onPostDeleted }) {
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [reacted, setReacted] = useState(post.liked_by_user || false);
    const [likesCount, setLikesCount] = useState(post.likes_count ?? post.likes ?? 0);
    const [commentsCount, setCommentsCount] = useState(post.comments_count ?? post.comments ?? 0);
    const [shared, setShared] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [localComments, setLocalComments] = useState(post.commentList || []);
    const [isEditing, setIsEditing] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [postData, setPostData] = useState(post);
    const [loadingComments, setLoadingComments] = useState(false);
    const [reportingCommentId, setReportingCommentId] = useState(null);
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);

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

    const handleShare = () => {
        setShowShareModal(true);
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
        setShowComments((prev) => !prev);
    };

    // Fetch comments from database when modal opens
    React.useEffect(() => {
        if (!showComments) return;
        
        const fetchComments = async () => {
            const postId = post.post_id || post.id;
            setLoadingComments(true);
            try {
                const response = await postService.getComments(postId);
                // Response can be paginated or direct array
                const commentsData = response.data || response || [];
                // Normalize comments to have both 'id' and 'comment_id' for consistency
                const normalized = Array.isArray(commentsData) ? commentsData.map((c) => ({
                    ...c,
                    id: c.comment_id || c.id,
                    replies: (c.replies || []).map((r) => ({
                        ...r,
                        id: r.comment_id || r.id,
                    })),
                })) : [];
                setLocalComments(normalized);
            } catch (error) {
                console.error('Failed to fetch comments:', error);
                // Keep local comments if fetch fails
            } finally {
                setLoadingComments(false);
            }
        };

        fetchComments();
    }, [showComments, post.post_id, post.id]);

    const handleAddComment = async (commentText) => {
        const postId = post.post_id || post.id;
        try {
            const newComment = await postService.createComment(postId, commentText);
            setLocalComments((prev) => [
                ...prev,
                {
                    id: newComment.comment_id,
                    user: {
                        user_id: user?.user_id,
                        username: user?.username,
                    },
                    content: commentText,
                    created_at: newComment.created_at || new Date().toISOString(),
                    replies: [],
                    user_id: user?.user_id,
                },
            ]);
            setCommentsCount((prev) => (typeof prev === 'number' ? prev : 0) + 1);
        } catch (_) {
            // Fallback: add locally with optimistic update
            setLocalComments((prev) => [
                ...prev,
                {
                    id: `${postId}-new-${Date.now()}`,
                    user: {
                        user_id: user?.user_id,
                        username: user?.username,
                    },
                    content: commentText,
                    created_at: new Date().toISOString(),
                    replies: [],
                    user_id: user?.user_id,
                },
            ]);
        }
    };

    const handleAddReply = async (parentCommentId, replyText) => {
        const postId = post.post_id || post.id;
        try {
            const newReply = await postService.createComment(postId, replyText, parentCommentId);
            setLocalComments((prev) =>
                prev.map((comment) => {
                    if ((comment.comment_id || comment.id) === parentCommentId) {
                        return {
                            ...comment,
                            replies: [
                                ...(comment.replies || []),
                                {
                                    comment_id: newReply.comment_id,
                                    id: newReply.comment_id,
                                    user: {
                                        user_id: user?.user_id,
                                        username: user?.username,
                                        profile: {
                                            profile_picture: user?.profile?.profile_picture,
                                        }
                                    },
                                    content: replyText,
                                    created_at: newReply.created_at || new Date().toISOString(),
                                    user_id: user?.user_id,
                                },
                            ],
                        };
                    }
                    return comment;
                })
            );
            setCommentsCount((prev) => (typeof prev === 'number' ? prev : 0) + 1);
        } catch (error) {
            // Fallback: add locally with optimistic update
            setLocalComments((prev) =>
                prev.map((comment) => {
                    if ((comment.comment_id || comment.id) === parentCommentId) {
                        return {
                            ...comment,
                            replies: [
                                ...(comment.replies || []),
                                {
                                    id: `reply-${Date.now()}`,
                                    user: {
                                        user_id: user?.user_id,
                                        username: user?.username,
                                    },
                                    content: replyText,
                                    created_at: new Date().toISOString(),
                                    user_id: user?.user_id,
                                },
                            ],
                        };
                    }
                    return comment;
                })
            );
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

    const handleEditPost = () => {
        setMenuOpen(false);
        setIsEditing(true);
    };

    const handleTogglePrivacy = () => {
        setMenuOpen(false);
        setShowPrivacyModal(true);
    };

    const handlePrivacyChange = async (newPrivacy) => {
        const postId = post.post_id || post.id;
        try {
            await postService.updatePost(postId, {
                privacy: newPrivacy,
            });
            setPostData((prev) => ({ ...prev, privacy: newPrivacy }));
            setShowPrivacyModal(false);
        } catch (_) {
            // Fallback: toggle locally
            const currentPrivacy = postData.privacy || 'private';
            const toggledPrivacy = currentPrivacy === 'public' ? 'private' : 'public';
            setPostData((prev) => ({ ...prev, privacy: toggledPrivacy }));
            setShowPrivacyModal(false);
        }
    };

    const handlePostEdited = async () => {
        setIsEditing(false);
        // Fetch the updated post data from the server
        try {
            const postId = post.post_id || post.id;
            const updatedPost = await postService.getPost(postId);
            if (updatedPost) {
                setPostData(updatedPost);
            }
        } catch (error) {
            console.error('Failed to refresh post after edit:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        const postId = post.post_id || post.id;
        try {
            await postService.deleteComment(postId, commentId);
            setLocalComments((prev) => {
                const updated = [];
                for (const c of prev) {
                    // Skip top-level comment if it matches
                    if ((c.comment_id || c.id) === commentId) {
                        continue;
                    }
                    // Remove nested reply if it matches, keep comment
                    if (c.replies && c.replies.length > 0) {
                        const filteredReplies = c.replies.filter((r) => (r.comment_id || r.id) !== commentId);
                        updated.push({ ...c, replies: filteredReplies });
                    } else {
                        updated.push(c);
                    }
                }
                return updated;
            });
            setCommentsCount((prev) => Math.max(0, (typeof prev === 'number' ? prev : 0) - 1));
        } catch (error) {
            console.error('Failed to delete comment:', error);
            // Fallback: remove locally anyway
            setLocalComments((prev) => {
                const updated = [];
                for (const c of prev) {
                    if ((c.comment_id || c.id) === commentId) {
                        continue;
                    }
                    if (c.replies && c.replies.length > 0) {
                        const filteredReplies = c.replies.filter((r) => (r.comment_id || r.id) !== commentId);
                        updated.push({ ...c, replies: filteredReplies });
                    } else {
                        updated.push(c);
                    }
                }
                return updated;
            });
        }
    };

    const handleReportComment = (commentId) => {
        setReportingCommentId(commentId);
    };

    const handleSubmitReport = async (reportData) => {
        const postId = post.post_id || post.id;
        setIsSubmittingReport(true);
        try {
            // Call the API to report the comment
            await postService.reportComment(postId, reportingCommentId, reportData);
            setReportingCommentId(null);
            // Show success message (could use toast notification)
            console.log('Comment reported successfully');
        } catch (error) {
            console.error('Failed to report comment:', error);
        } finally {
            setIsSubmittingReport(false);
        }
    };

    const handleSubmitEdit = async (commentId, newContent) => {
        const postId = post.post_id || post.id;
        try {
            await postService.updateComment(postId, commentId, newContent);
            setLocalComments((prev) =>
                prev.map((c) => {
                    // Update top-level comment
                    if ((c.comment_id || c.id) === commentId) {
                        return { ...c, content: newContent };
                    }
                    // Update nested reply inside this comment
                    if (c.replies && c.replies.length > 0) {
                        return {
                            ...c,
                            replies: c.replies.map((r) => {
                                if ((r.comment_id || r.id) === commentId) {
                                    return { ...r, content: newContent };
                                }
                                return r;
                            })
                        };
                    }
                    return c;
                })
            );
        } catch (error) {
            console.error('Failed to update comment:', error);
        }
    };

    const shouldTruncate = postContent.length > longTextLimit;
    const visibleBody = shouldTruncate && !expanded ? `${postContent.slice(0, longTextLimit)}...` : postContent;

    if (variant === 'recent') {
        return <RecentJournalCard post={post} />;
    }

    return (
        <article className="post-card__container">
            <PostDisplay
                post={postData}
                compact={compact}
                hideMenu={false}
                onLike={handleToggleLike}
                onShare={handleShare}
                liked={reacted}
                likesCount={likesCount}
                commentsCount={commentsCount}
                onCommentsClick={handleLoadComments}
                onMenuClick={() => setMenuOpen((prev) => !prev)}
                menuOpen={menuOpen}
                ownsPost={ownsPost}
                onDelete={handleDeletePost}
                onReport={handleReportPost}
                onEdit={handleEditPost}
                onTogglePrivacy={handleTogglePrivacy}
                shared={shared}
                onContentClick={() => setShowComments(true)}
            />

            {/* Floating Comments Modal */}
            <CommentFloatingModal
                post={post}
                comments={localComments}
                isOpen={showComments}
                onClose={() => setShowComments(false)}
                onAddComment={handleAddComment}
                onAddReply={handleAddReply}
                onDeleteComment={handleDeleteComment}
                onReportComment={handleReportComment}
                onSubmitEditComment={handleSubmitEdit}
                onShare={handleShare}
                liked={reacted}
                likesCount={likesCount}
                loadingComments={loadingComments}
            />

            {/* Edit Post Modal - Uses Same Composer as Create */}
            {isEditing && (
                <ComposerModal
                    mode={post.type || 'text'}
                    onClose={() => setIsEditing(false)}
                    onPostCreated={handlePostEdited}
                    communityId={post.community_id}
                    community={postData.community || null}
                    embedded={false}
                    initialPost={post}
                />
            )}

            {/* Privacy Toggle Modal */}
            {showPrivacyModal && (
                <div className="privacy-modal-overlay" onClick={() => setShowPrivacyModal(false)}>
                    <div className="privacy-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="privacy-modal__title">Change Privacy</h3>
                        <p className="privacy-modal__description">
                            {postData.privacy === 'public' 
                                ? 'Change this post to private?' 
                                : 'Change this post to public?'}
                        </p>
                        <div className="privacy-modal__actions">
                            <button 
                                type="button" 
                                className="privacy-modal__btn privacy-modal__btn--cancel"
                                onClick={() => setShowPrivacyModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                className="privacy-modal__btn privacy-modal__btn--confirm"
                                onClick={() => handlePrivacyChange(
                                    postData.privacy === 'public' ? 'private' : 'public'
                                )}
                            >
                                {postData.privacy === 'public' ? 'Make Private' : 'Make Public'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Comment Modal */}
            {reportingCommentId && (
                <ReportModal
                    commentId={reportingCommentId}
                    onSubmit={handleSubmitReport}
                    onClose={() => setReportingCommentId(null)}
                    isSubmitting={isSubmittingReport}
                />
            )}
            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                postId={post.post_id || post.id}
                onClose={() => setShowShareModal(false)}
            />
        </article>
    );
}
