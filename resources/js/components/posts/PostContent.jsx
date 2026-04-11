import React, { useState } from 'react';
import '../../../sass/components/posts/PostContent.scss';

/**
 * PostContent - Specialized component for displaying post body content
 * Handles: text, quotes, and images with proper visual hierarchy
 */
export default function PostContent({ 
    content = '', 
    title = '', 
    image = null,
    isQuote = false,
    compact = false 
}) {
    const [expanded, setExpanded] = useState(false);
    const longTextLimit = 280;

    if (!content && !title && !image) {
        return null;
    }

    const shouldTruncate = content.length > longTextLimit;
    const visibleContent = shouldTruncate && !expanded 
        ? `${content.slice(0, longTextLimit)}...` 
        : content;

    return (
        <div className="post-content">
            {/* Title Section */}
            {title && !compact && (
                <h3 className="post-content__title">
                    {title}
                </h3>
            )}

            {/* Body Text Section */}
            {content && (
                <div className="post-content__body-section">
                    <p className={`post-content__text ${isQuote ? 'post-content__text--quote' : ''}`}>
                        {isQuote ? `"${visibleContent}"` : visibleContent}
                    </p>

                    {shouldTruncate && (
                        <button
                            type="button"
                            onClick={() => setExpanded(!expanded)}
                            className="post-content__expand-btn"
                        >
                            {expanded ? 'Show less' : 'Show more'}
                        </button>
                    )}
                </div>
            )}

            {/* Image Section */}
            {image && (
                <div className="post-content__image-section">
                    <img 
                        src={image} 
                        alt="post media" 
                        className="post-content__image"
                    />
                </div>
            )}
        </div>
    );
}
