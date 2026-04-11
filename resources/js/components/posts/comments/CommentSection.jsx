import React from 'react';
import CommentThread from './CommentThread';

export default function CommentSection({ comments = [], onReply, onDelete, onReport, onEdit, currentUserId }) {
    if (!comments.length) {
        return (
            <div className="comment-section__empty">
                <span className="material-symbols-outlined comment-section__empty-icon">chat_bubble_outline</span>
                <p className="comment-section__empty-text">No comments yet</p>
                <p className="comment-section__empty-subtext">Be the first to share your thoughts</p>
            </div>
        );
    }

    return (
        <div className="comment-section__list">
            {comments.map((comment) => (
                <CommentThread
                    key={comment.id}
                    comment={comment}
                    onReply={onReply}
                    onDelete={onDelete}
                    onReport={onReport}
                    onEdit={onEdit}
                    currentUserId={currentUserId}
                />
            ))}
        </div>
    );
}
