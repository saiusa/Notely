import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatRelativeTime } from '../../../utils/timeFormatter';
import UserAvatar from '../../common/UserAvatar';
import ReplyInput from './ReplyInput';
import '../../../../sass/components/posts/comments/CommentThread.scss';

function ReplyItem({ reply, currentUserId, onDelete, onReport, onEdit, onSubmitEdit }) {
    const [replyMenuOpen, setReplyMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(reply.content || reply.text);
    const replyMenuRef = useRef(null);
    const isReplyOwner = currentUserId === reply.user_id;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (replyMenuRef.current && !replyMenuRef.current.contains(event.target)) {
                setReplyMenuOpen(false);
            }
        };

        if (replyMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [replyMenuOpen]);

    const handleEditCancel = () => {
        setEditText(reply.content || reply.text);
        setIsEditing(false);
    };

    const handleEditSave = () => {
        if (editText.trim()) {
            onSubmitEdit?.(reply.id, editText);
            setIsEditing(false);
        }
    };

    return (
        <div key={reply.id} className="comment-thread__reply">
            <Link to={`/profile/${reply.user?.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="flex-shrink-0">
                    <UserAvatar
                        user={reply.user}
                        size="xs"
                        className="comment-thread__reply-avatar"
                        style={{ width: undefined, height: undefined }}
                    />
                </div>
            </Link>
            
            <div className="comment-thread__reply-content">
                <div className="comment-thread__reply-header">
                    <div className="comment-thread__reply-meta">
                        <Link to={`/profile/${reply.user?.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <p className="comment-thread__reply-username">
                                {reply.user?.username}
                            </p>
                        </Link>
                        <span className="comment-thread__reply-time">
                            {formatRelativeTime(reply.created_at)}
                        </span>
                    </div>

                    <div className="comment-thread__reply-menu-wrap" ref={replyMenuRef}>
                        <button
                            type="button"
                            className="comment-thread__reply-menu-btn"
                            onClick={() => setReplyMenuOpen(!replyMenuOpen)}
                            aria-label="Reply options"
                        >
                            <span className="material-symbols-outlined">more_vert</span>
                        </button>

                        {replyMenuOpen && (
                            <div className="comment-thread__reply-menu-dropdown">
                            {isReplyOwner ? (
                                <>
                                    <button 
                                        type="button"
                                        className="comment-thread__reply-menu-item"
                                        onClick={() => {
                                            setReplyMenuOpen(false);
                                            setIsEditing(true);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        type="button"
                                        className="comment-thread__reply-menu-item comment-thread__reply-menu-item--danger"
                                        onClick={() => {
                                            setReplyMenuOpen(false);
                                            onDelete?.(reply.id);
                                        }}
                                    >
                                        Delete
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        type="button"
                                        className="comment-thread__reply-menu-item"
                                        onClick={() => setReplyMenuOpen(false)}
                                    >
                                        View Profile
                                    </button>
                                    <button 
                                        type="button"
                                        className="comment-thread__reply-menu-item comment-thread__reply-menu-item--danger"
                                        onClick={() => {
                                            setReplyMenuOpen(false);
                                            onReport?.(reply.id);
                                        }}
                                    >
                                        Report
                                    </button>
                                </>
                            )}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Content - Editable or Display (Same as main comment) */}
                {isEditing ? (
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="comment-thread__edit-input"
                        autoFocus
                    />
                ) : (
                    <p className="comment-thread__reply-text">
                        {reply.content || reply.text}
                    </p>
                )}

                {/* Edit Actions */}
                {isEditing && (
                    <div className="comment-thread__reply-actions">
                        <button
                            type="button"
                            className="comment-thread__action-btn"
                            onClick={handleEditCancel}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="comment-thread__action-btn"
                            onClick={handleEditSave}
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CommentThread({ 
    comment, 
    onReply, 
    onDelete,
    onReport,
    onEdit,
    onSubmitEdit,
    currentUserId 
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content || comment.text);
    const menuRef = useRef(null);

    const repliesCount = comment.replies?.length || 0;
    const isOwner = currentUserId === comment.user_id;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isMenuOpen]);

    const handleDeleteComment = () => {
        setIsMenuOpen(false);
        onDelete?.(comment.id);
    };

    const handleReportComment = () => {
        setIsMenuOpen(false);
        onReport?.(comment.id);
    };

    const handleEditComment = () => {
        setIsEditing(true);
        setIsMenuOpen(false);
    };

    const handleEditSave = () => {
        if (editText.trim()) {
            onSubmitEdit?.(comment.id, editText);
            setIsEditing(false);
        }
    };

    const handleEditCancel = () => {
        setEditText(comment.content || comment.text);
        setIsEditing(false);
    };

    return (
        <div className="comment-thread">
            {/* Main Comment */}
            <div className="comment-thread__main">
                <Link to={`/profile/${comment.user?.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="flex-shrink-0">
                        <UserAvatar
                            user={comment.user}
                            size="sm"
                            className="comment-thread__avatar"
                            style={{ width: undefined, height: undefined }}
                        />
                    </div>
                </Link>
                
                <div className="comment-thread__content">
                    {/* Text Box */}
                    <div className="comment-thread__text-box">
                        {/* Header */}
                        <div className="comment-thread__header">
                            <div className="comment-thread__meta">
                                <Link to={`/profile/${comment.user?.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <p className="comment-thread__username">
                                        {comment.user?.username}
                                    </p>
                                </Link>
                                <span className="comment-thread__time">
                                    {formatRelativeTime(comment.created_at)}
                                </span>
                            </div>

                            {/* Menu Button */}
                            <div className="comment-thread__menu-wrap" ref={menuRef}>
                                <button
                                    type="button"
                                    className="comment-thread__menu-btn"
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    aria-label="Comment options"
                                >
                                    <span className="material-symbols-outlined">more_vert</span>
                                </button>

                                {isMenuOpen && (
                                    <div className="comment-thread__menu-dropdown">
                                {isOwner ? (
                                    <>
                                        <button 
                                            type="button"
                                            className="comment-thread__menu-item"
                                            onClick={handleEditComment}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            type="button"
                                            className="comment-thread__menu-item comment-thread__menu-item--danger"
                                            onClick={handleDeleteComment}
                                        >
                                            Delete
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            type="button"
                                            className="comment-thread__menu-item"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            View Profile
                                        </button>
                                        <button 
                                            type="button"
                                            className="comment-thread__menu-item comment-thread__menu-item--danger"
                                            onClick={handleReportComment}
                                        >
                                            Report
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                            </div>
                        </div>

                        {/* Content - Editable or Display */}
                        {isEditing ? (
                            <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="comment-thread__edit-input"
                                autoFocus
                            />
                        ) : (
                            <p className="comment-thread__text">
                                {comment.content || comment.text}
                            </p>
                        )}
                    </div>

                    {/* Actions - Reply + Expand/Collapse */}
                    <div className="comment-thread__actions">
                        {isEditing && (
                            <>
                                <button
                                    type="button"
                                    className="comment-thread__action-btn"
                                    onClick={handleEditCancel}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="comment-thread__action-btn"
                                    onClick={handleEditSave}
                                >
                                    Save
                                </button>
                            </>
                        )}
                        {!isEditing && (
                            <>
                                <button 
                                    type="button"
                                    className="comment-thread__action-btn"
                                    onClick={() => setShowReplyInput(!showReplyInput)}
                                >
                                    <span className="material-symbols-outlined">reply</span>
                                    Reply
                                </button>

                                {repliesCount > 0 && (
                                    <button 
                                        type="button"
                                        className="comment-thread__expand-btn"
                                        onClick={() => setIsExpanded(!isExpanded)}
                                    >
                                        <span className="material-symbols-outlined">
                                            {isExpanded ? 'expand_less' : 'expand_more'}
                                        </span>
                                        {isExpanded ? 'Hide' : `Show ${repliesCount}`} {repliesCount === 1 ? 'reply' : 'replies'}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Reply Input */}
            {showReplyInput && (
                <ReplyInput
                    commentId={comment.id}
                    onSubmit={(text) => {
                        onReply?.(comment.id, text);
                        setShowReplyInput(false);
                    }}
                    onCancel={() => setShowReplyInput(false)}
                    autoFocus
                />
            )}

            {/* Replies List */}
            {isExpanded && repliesCount > 0 && (
                <div className="comment-thread__replies">
                    {comment.replies?.map((reply) => (
                        <ReplyItem
                            key={reply.id}
                            reply={reply}
                            currentUserId={currentUserId}
                            onDelete={onDelete}
                            onReport={onReport}
                            onEdit={onEdit}
                            onSubmitEdit={onSubmitEdit}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
