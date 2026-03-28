import React, { useState } from 'react';

export default function CommentSection({ comments = [] }) {
    const [openMenuId, setOpenMenuId] = useState(null);

    if (!comments.length) {
        return (
            <div className="post-card__comment-empty">
                No comments yet
            </div>
        );
    }

    return (
        <div className="post-card__comment-list">
            {comments.map((comment) => {
                const isOpen = openMenuId === comment.id;

                return (
                    <article key={comment.id} className="post-card__comment-item">
                        <div className="post-card__comment-item-row">
                            <div className="post-card__comment-main">
                                <img
                                    src={comment.avatar}
                                    alt={comment.username}
                                    className="post-card__comment-avatar"
                                />
                                <div className="post-card__comment-text-wrap">
                                    <p className="post-card__comment-username">
                                        {comment.username}
                                    </p>
                                    <p className="post-card__comment-text">
                                        {comment.text}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpenMenuId(isOpen ? null : comment.id)}
                                className="post-card__comment-menu-btn"
                                aria-label="Comment options"
                            >
                                <span className="material-symbols-outlined post-card__comment-menu-icon">more_vert</span>
                            </button>
                        </div>

                        {isOpen && (
                            <div className="post-card__comment-menu-dropdown">
                                <button
                                    type="button"
                                    className="post-card__comment-menu-item"
                                >
                                    View Profile
                                </button>
                                <button
                                    type="button"
                                    className="post-card__comment-menu-item"
                                >
                                    Report Comment
                                </button>
                            </div>
                        )}
                    </article>
                );
            })}
        </div>
    );
}
