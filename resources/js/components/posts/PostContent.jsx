import React, { useState } from 'react';
import { getFullImageUrl } from '../../utils/imageUrl';
import '../../../sass/components/posts/PostContent.scss';

/**
 * PostContent - Specialized component for displaying post body content
 * Handles: text, quotes, and images with proper visual hierarchy
 */
export default function PostContent({ 
    content = '', 
    title = '', 
    image = null,
    type = 'text',
    isQuote = false,
    compact = false 
}) {
    const [expanded, setExpanded] = useState(false);
    const [imgError, setImgError] = useState(false);
    const longTextLimit = 280;

    // Determine post type (support both explicit type and isQuote flag for backward compatibility)
    const postType = isQuote ? 'quote' : (type || 'text');

    if (!content && !title && !image) {
        return null;
    }

    const shouldTruncate = content.length > longTextLimit && postType !== 'quote';
    const visibleContent = shouldTruncate && !expanded 
        ? `${content.slice(0, longTextLimit)}...` 
        : content;

    // TEXT POST: Title + content
    if (postType === 'text') {
        return (
            <div className="post-content__text-wrapper">
                {title && title !== 'null' && <h3 className="post-content__title">{title}</h3>}
                {content && <p className="post-content__body">{visibleContent}</p>}
                {shouldTruncate && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setExpanded(!expanded);
                        }}
                        className="post-content__expand-btn"
                    >
                        {expanded ? 'Show less' : 'Show more'}
                    </button>
                )}
            </div>
        );
    }

    // QUOTE POST: Centered, italic, bold
    if (postType === 'quote') {
        return (
            <div className="post-content__quote-wrapper">
                <blockquote className="post-content__quote">
                    "{content}"
                </blockquote>
            </div>
        );
    }

    // IMAGE POST: Caption + Image
    if (postType === 'image') {
        return (
            <div className="post-content__image-wrapper">
                {content && (
                    <div>
                        <p className="post-content__body">{visibleContent}</p>
                        {shouldTruncate && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExpanded(!expanded);
                                }}
                                className="post-content__expand-btn"
                            >
                                {expanded ? 'Show less' : 'Show more'}
                            </button>
                        )}
                    </div>
                )}
                {image ? (
                    !imgError ? (
                        <img 
                            src={getFullImageUrl(image)} 
                            alt="Post attachment" 
                            className="post-content__image"
                            onError={(e) => { 
                                setImgError(true);
                                e.target.style.display = 'none'; 
                            }} 
                        />
                    ) : (
                        <div className="p-4 bg-red-500/10 text-red-400 text-sm rounded border border-red-500/20">
                            Image failed to upload or is missing from database.
                        </div>
                    )
                ) : null}
            </div>
        );
    }

    // Fallback for unknown types
    return (
        <div className="post-content__text-wrapper">
            {title && title !== 'null' && <h3 className="post-content__title">{title}</h3>}
            {content && <p className="post-content__body">{visibleContent}</p>}
        </div>
    );
}
