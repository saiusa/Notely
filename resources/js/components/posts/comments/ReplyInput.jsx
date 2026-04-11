import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import '../../../../sass/components/posts/comments/ReplyInput.scss';

export default function ReplyInput({ commentId, onSubmit, onCancel, autoFocus = true }) {
    const { user } = useAuth();
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (autoFocus && inputRef.current) inputRef.current.focus();
    }, [autoFocus]);

    const handleSubmit = async () => {
        if (!text.trim()) return;
        setIsSubmitting(true);
        try {
            await onSubmit(text);
            setText('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="reply-input">
            <img 
                src={user?.profile?.avatar || user?.avatar || '/default-avatar.png'} 
                alt={user?.username} 
                className="reply-input__avatar" 
            />
            <div className="reply-input__input-wrap">
                <input 
                    ref={inputRef}
                    type="text"
                    placeholder="Write a reply..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSubmitting}
                    className="reply-input__input"
                />
            </div>
            <button 
                onClick={handleSubmit} 
                disabled={!text.trim() || isSubmitting}
                className={`reply-input__send ${text.trim() ? 'reply-input__send--active' : ''}`}
            >
                <span className="material-symbols-outlined">send</span>
            </button>
        </div>
    );
}
