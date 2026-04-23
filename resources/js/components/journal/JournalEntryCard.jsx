import React from 'react';
import { getMoodColorPalette } from '../../utils/moodColorMapper';
import '../../../sass/components/journal/JournalEntryCard.scss';

export default function JournalEntryCard({ entry, isPrivate, onEdit, onTogglePrivacy, onCopyLink, onOpenDetail }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        return `${month} ${day} • ${time}`;
    };

    const getImageUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `/storage/${url}`;
    };

    // State for text truncation
    const [isExpanded, setIsExpanded] = React.useState(false);
    const maxTextLength = 350;

    const shouldTruncate = entry.text && entry.text.length > maxTextLength;
    const displayText =
        shouldTruncate && !isExpanded ? entry.text.substring(0, maxTextLength) + '...' : entry.text;

    return (
        <div className="journal-entry-card">
            {/* Timeline dot */}
            <div className="journal-entry-card__dot" />

            {/* Card content */}
            <div className="journal-entry-card__content">
                {/* Header - Only show for text type posts */}
                {entry.type === 'text' && (
                    <div className="journal-entry-card__header">
                        <h3 
                            className="journal-entry-card__title"
                            onClick={() => onOpenDetail?.(entry)}
                        >
                            {entry.title || 'Untitled'}
                        </h3>
                        <div className="journal-entry-card__meta">
                            <div className="flex items-center gap-3 text-gray-500 text-[11px] font-medium tracking-wide">
                                {/* Show stats if public */}
                                {!isPrivate && (
                                    <div className="flex items-center gap-2 mr-2">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">favorite</span>
                                            {entry.likes_count || 0}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                                            {entry.comments_count || 0}
                                        </span>
                                    </div>
                                )}
                                <span className="material-symbols-outlined text-[14px]">{isPrivate ? 'lock' : 'public'}</span>
                                <span>{formatDate(entry.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header for non-text types (quote, image) - Meta only, no title */}
                {(entry.type === 'quote' || entry.type === 'image') && (
                    <div className="journal-entry-card__meta-only">
                        <div className="flex items-center gap-3 text-gray-500 text-[11px] font-medium tracking-wide">
                            {/* Show stats if public */}
                            {!isPrivate && (
                                <div className="flex items-center gap-2 mr-2">
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">favorite</span>
                                        {entry.likes_count || 0}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                                        {entry.comments_count || 0}
                                    </span>
                                </div>
                            )}
                            <span className="material-symbols-outlined text-[14px]">{isPrivate ? 'lock' : 'public'}</span>
                            <span>{formatDate(entry.createdAt)}</span>
                        </div>
                    </div>
                )}

                {/* Body text */}
                {entry.text && (
                    <div 
                        className="journal-entry-card__body-wrapper"
                        onClick={() => onOpenDetail?.(entry)}
                    >
                        {entry.type === 'quote' ? (
                            <blockquote className="journal-entry-card__quote">{displayText}</blockquote>
                        ) : (
                            <p className="journal-entry-card__body">{displayText}</p>
                        )}

                        {/* Show More/Less Button */}
                        {shouldTruncate && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                                className="journal-entry-card__expand-btn"
                            >
                                {isExpanded ? 'Show Less' : 'Show More'}
                            </button>
                        )}
                    </div>
                )}

                {/* Image - prioritized for image type */}
                {entry.type === 'image' && entry.image && (
                    <img
                        src={getImageUrl(entry.image)}
                        alt="Entry image"
                        className="journal-entry-card__image"
                    />
                )}
                {entry.type !== 'image' && entry.image && (
                    <img
                        src={getImageUrl(entry.image)}
                        alt="Entry image"
                        className="journal-entry-card__image"
                    />
                )}

                {/* Footer: Mood & Hashtags - Using PostCard styling */}
                <div className="journal-entry-card__tags-row">
                    {entry.mood && (
                        (() => {
                            const moodColors = getMoodColorPalette(entry.mood);
                            return (
                                <span 
                                    className="journal-entry-card__mood-pill"
                                    style={{
                                        backgroundColor: moodColors.backgroundColor,
                                        color: moodColors.textColor,
                                    }}
                                >
                                    {moodColors.emoji && <span className="journal-entry-card__mood-emoji">{moodColors.emoji}</span>}
                                    {entry.mood}
                                </span>
                            );
                        })()
                    )}
                    {entry.hashtags && entry.hashtags.length > 0 && (
                        entry.hashtags.map((tag) => {
                            const tagText = typeof tag === 'string' ? tag : `#${tag.name}`;
                            return (
                                <span 
                                    key={tagText} 
                                    className="journal-entry-card__hashtag"
                                >
                                    {tagText}
                                </span>
                            );
                        })
                    )}
                </div>

                {/* Actions menu for public entries */}
                {!isPrivate && (
                    <div className="journal-entry-card__actions">
                        <button
                            type="button"
                            onClick={() => onEdit?.(entry)}
                            className="journal-entry-card__action-btn"
                            title="Edit"
                        >
                            <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onCopyLink?.(entry)}
                            className="journal-entry-card__action-btn"
                            title="Copy link"
                        >
                            <span className="material-symbols-outlined">share</span>
                        </button>
                    </div>
                )}

                {/* Privacy Toggle Button */}
                <div className="journal-entry-card__privacy-toggle">
                    <button
                        type="button"
                        onClick={() => onTogglePrivacy?.(entry.id)}
                        className="journal-entry-card__privacy-toggle-btn"
                        title={isPrivate ? 'Make Public' : 'Make Private'}
                    >
                        <span className="material-symbols-outlined">
                            {isPrivate ? 'lock' : 'lock_open'}
                        </span>
                        <span>{isPrivate ? 'Make Public' : 'Make Private'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
