import React from 'react';
import { Link } from 'react-router-dom';
import { slugify } from '../../utils/slugify';
import '../../../sass/components/community/CommunityListCard.scss';

/**
 * SVG placeholder for missing images
 */
const PLACEHOLDER_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%234a5568" width="300" height="300"/%3E%3Ctext x="50%" y="50%" font-family="system-ui" font-size="16" fill="%238e92a7" text-anchor="middle" dy=".3em"%3EImage unavailable%3C/text%3E%3C/svg%3E';

/**
 * Normalize image paths to ensure they're absolute from root
 */
const normalizeImagePath = (imagePath) => {
    if (!imagePath) return PLACEHOLDER_SVG;
    if (imagePath.startsWith('/')) return imagePath;
    return `/${imagePath}`;
};

const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_SVG;
    e.target.onerror = null;
};


export default function CommunityListCard({ community, actionLabel, to, navContext, categoryName }) {
    // Generate dynamic URL if navContext is provided
    let dynamicTo = to;
    if (navContext && community.id) {
        // Safely get category slug - prefer categoryName prop, fallback to community.category if available
        const categorySlug = categoryName 
            ? slugify(categoryName)
            : (community.category ? slugify(community.category) : 'uncategorized');
        
        const communityId = community.id;
        
        switch (navContext) {
            case 'browse':
                dynamicTo = `/community/browse/${categorySlug}/${communityId}`;
                break;
            case 'created':
                dynamicTo = `/community/my-community/created/${categorySlug}/${communityId}`;
                break;
            case 'joined':
                dynamicTo = `/community/my-community/joined/${categorySlug}/${communityId}`;
                break;
            default:
                dynamicTo = to || '#';
        }
    }

    return (
        <article className="community-list-card__container">
            <img 
                src={normalizeImagePath(community.cardImage)} 
                alt={community.name} 
                className="community-list-card__image"
                onError={handleImageError}
            />
            <div className="community-list-card__content">
                <h3 className="community-list-card__name">{community.name}</h3>
                <p className="community-list-card__description">{community.description}</p>
                <p className="community-list-card__members">
                    <span className="community-list-card__members-value">{community.members}</span>
                    <span className="community-list-card__members-label">members</span>
                </p>
                <Link
                    to={dynamicTo}
                    className="community-list-card__action"
                >
                    {actionLabel}
                </Link>
            </div>
        </article>
    );
}
