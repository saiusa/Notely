import React, { useState } from 'react';
import '../../../sass/components/journal/JournalCard.scss';
import { formatRelativeTime } from '../../utils/timeFormatter';

export default function JournalCard({
    card,
    isPublicView,
    onEdit,
    onTogglePrivacy,
    onCopyLink,
    compact = false,
}) {
    const [menuOpen, setMenuOpen] = useState(false);

    // Extract data with fallbacks for different field names
    const mood = card.mood || null;
    const hashtags = card.hashtags || [];
    const createdAt = card.created_at || card.createdAt || '';
    const timeDisplay = formatRelativeTime(createdAt);
    const imageUrl = card.image || card.image_url || null;
    const textContent = card.text || card.body || card.content || '';
    const textLimit = isPublicView ? 120 : 140;
    const displayText = textContent.length > textLimit ? `${textContent.slice(0, textLimit)}...` : textContent;
    const isPublic = isPublicView || card.isPublic || card.privacy === 'public';

    return (
        <article className="journal-card">
            {/* Header with date and menu */}
            <div className="journal-card__header">
                <p className="journal-card__time">
                    {timeDisplay}
                </p>

                <div className="journal-card__menu">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen((prev) => !prev);
                        }}
                        className="journal-card__menu-btn"
                        aria-label="Journal options"
                    >
                        <span className="material-symbols-outlined">more_vert</span>
                    </button>

                    {menuOpen && (
                        <div className="journal-card__dropdown">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(card);
                                    setMenuOpen(false);
                                }}
                                className="journal-card__dropdown-btn"
                            >
                                Edit Post
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onTogglePrivacy(card.id);
                                    setMenuOpen(false);
                                }}
                                className="journal-card__dropdown-btn"
                            >
                                {isPublic ? 'Change to Private' : 'Change to Public'}
                            </button>
                            {isPublic && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCopyLink(card);
                                        setMenuOpen(false);
                                    }}
                                    className="journal-card__dropdown-btn"
                                >
                                    Copy Link
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content section */}
            <div className="journal-card__content">
                {displayText ? <p className="journal-card__text">{displayText}</p> : null}

                {imageUrl ? (
                    <img src={imageUrl} alt="journal" className="journal-card__image" />
                ) : null}
            </div>

            {/* Mood and edit button */}
            <div className="journal-card__footer">
                {mood && (
                    <span className="journal-card__mood">
                        {typeof mood === 'string' ? mood : mood.name || mood.title || ''}
                    </span>
                )}
                <button
                    type="button"
                    onClick={() => onEdit(card)}
                    className="journal-card__edit-btn"
                    aria-label="Edit journal"
                >
                    <span className="material-symbols-outlined">edit</span>
                </button>
            </div>

            {/* Hashtags */}
            {hashtags && hashtags.length > 0 && (
                <div className="journal-card__tags">
                    {hashtags.slice(0, 2).map((tag, idx) => {
                        const tagName = typeof tag === 'string' 
                            ? tag 
                            : tag?.name || tag?.title || '';
                        const displayTag = tagName.startsWith('#') ? tagName : `#${tagName}`;
                        return (
                            <span key={`tag-${idx}`}>
                                {displayTag}
                            </span>
                        );
                    })}
                    {hashtags.length > 2 && (
                        <span>
                            +{hashtags.length - 2}
                        </span>
                    )}
                </div>
            )}
        </article>
    );
}
