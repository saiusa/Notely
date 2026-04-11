import React, { useState } from 'react';
import PostDisplay from '../PostDisplay';
import CommentThread from './CommentThread';
import Loader from '../../common/Loader';
import { useAuth } from '../../../context/AuthContext';
import '../../../../sass/components/posts/comments/CommentFloatingModal.scss';

export default function CommentFloatingModal({ 
    post, 
    comments = [], 
    isOpen, 
    onClose, 
    onAddComment, 
    onAddReply,
    onDeleteComment,
    onReportComment,
    onEditComment,
    onSubmitEditComment,
    onShare,
    liked = false,
    likesCount = 0,
    loadingComments = false
}) {
    const { user } = useAuth();
    const [mainCommentInput, setMainCommentInput] = useState('');
    const [expandedReplies, setExpandedReplies] = useState(new Set());
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyInput, setReplyInput] = useState('');
    const [sortBy, setSortBy] = useState('new');

    React.useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Close on Escape key
    React.useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const toggleExpandReplies = (commentId) => {
        setExpandedReplies((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(commentId)) newSet.delete(commentId);
            else newSet.add(commentId);
            return newSet;
        });
    };

    const handleReply = (commentId, parentComment) => {
        setReplyingTo({ id: commentId, parentComment });
    };

    const sendReply = (commentId) => {
        if (!replyInput.trim()) return;
        onAddReply?.(commentId, replyInput);
        setReplyInput('');
        setReplyingTo(null);
    };

    const handleAddComment = () => {
        if (!mainCommentInput.trim()) return;
        onAddComment(mainCommentInput);
        setMainCommentInput('');
    };

    // Calculate total comments + replies for display
    const totalCommentCount = comments.reduce((acc, comment) => {
        return acc + 1 + (comment.replies?.length || 0);
    }, 0);

    // Sort comments
    const sortedComments = [...comments].sort((a, b) => {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return sortBy === 'new' ? timeB - timeA : timeA - timeB;
    });

    if (!isOpen) return null;

    return (
        <div className="comment-floating-modal__overlay" onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className="comment-floating-modal__container">
                {/* Single Scrollable Content Area - Post + Comments */}
                <div className="comment-floating-modal__content">
                    {/* Post Section */}
                    <div className="comment-floating-modal__post-section">
                        <PostDisplay
                            post={post}
                            compact={false}
                            hideMenu={true}
                            onShare={onShare}
                            liked={liked}
                            likesCount={likesCount}
                            commentsCount={totalCommentCount}
                            onCommentsClick={() => {}}
                            onMenuClick={() => {}}
                            menuOpen={false}
                            ownsPost={false}
                            shared={false}
                        />
                        <button onClick={onClose} className="comment-floating-modal__close-btn" aria-label="Close">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Comments Section */}
                    {loadingComments ? (
                        <div className="comment-floating-modal__loading-state">
                            <Loader />
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="comment-floating-modal__empty-state">
                            <span className="material-symbols-outlined comment-floating-modal__empty-icon">
                                chat_bubble_outline
                            </span>
                            <p className="comment-floating-modal__empty-title">No comments yet</p>
                            <p className="comment-floating-modal__empty-subtitle">Be the first to share your thoughts!</p>
                        </div>
                    ) : (
                        <>
                            <div className="comment-floating-modal__sort-controls">
                                <p className="comment-floating-modal__sort-label">Sort:</p>
                                <button 
                                    className={`comment-floating-modal__sort-button ${sortBy === 'new' ? 'comment-floating-modal__sort-button--active' : ''}`}
                                    onClick={() => setSortBy('new')}
                                >
                                    Newest
                                </button>
                                <button 
                                    className={`comment-floating-modal__sort-button ${sortBy === 'old' ? 'comment-floating-modal__sort-button--active' : ''}`}
                                    onClick={() => setSortBy('old')}
                                >
                                    Oldest
                                </button>
                            </div>
                            <div className="comment-floating-modal__comments-list">
                                {sortedComments.map((comment) => (
                                    <CommentThread
                                        key={comment.id}
                                        comment={comment}
                                        onReply={(commentId, text) => onAddReply?.(commentId, text)}
                                        onDelete={onDeleteComment}
                                        onReport={onReportComment}
                                        onEdit={onEditComment}
                                        onSubmitEdit={onSubmitEditComment}
                                        currentUserId={user?.user_id || user?.id}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Comment Input Footer */}
                <div className="comment-floating-modal__footer">
                    <img 
                        src={user?.profile?.avatar || user?.avatar || '/default-avatar.png'} 
                        alt={user?.username} 
                        className="comment-floating-modal__avatar" 
                    />
                    <div className="comment-floating-modal__input-wrap">
                        <input 
                            type="text"
                            placeholder="Add a comment..."
                            value={mainCommentInput}
                            onChange={(e) => setMainCommentInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                            className="comment-floating-modal__input"
                        />
                    </div>
                    <button 
                        onClick={handleAddComment} 
                        disabled={!mainCommentInput.trim()}
                        className={`comment-floating-modal__send ${mainCommentInput.trim() ? 'comment-floating-modal__send--active' : ''}`}
                    >
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
