import React from 'react';
import '../../../sass/components/community/CommunitySidebar.scss';

/**
 * SVG placeholder for missing images
 */
const PLACEHOLDER_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="120"%3E%3Crect fill="%234a5568" width="120" height="120"/%3E%3Ctext x="50%" y="50%" font-family="system-ui" font-size="12" fill="%238e92a7" text-anchor="middle" dy=".3em"%3ENo image%3C/text%3E%3C/svg%3E';

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

export default function CommunityRightSidebar({ community, activeTab, onTabChange }) {
    // Use slug from backend, fallback to generated slug if not available
    const communitySlug = community.slug || `@${community.name?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
        <aside className="community-sidebar__container">
            <div className="community-sidebar__header">
                <img 
                    src={normalizeImagePath(community.cardImage)} 
                    alt={community.name} 
                    className="community-sidebar__image"
                    onError={handleImageError}
                />
                <div className="community-sidebar__info">
                    <p className="community-sidebar__name">{community.name}</p>
                    <p className="community-sidebar__slug">{communitySlug}</p>
                </div>
            </div>

            <button
                type="button"
                onClick={() => onTabChange('posts')}
                className={`community-sidebar__tab-btn ${
                    activeTab === 'posts' ? 'community-sidebar__tab-btn--active' : 'community-sidebar__tab-btn--inactive'
                }`}
            >
                <span className="community-sidebar__tab-left">
                    <span className="material-symbols-outlined community-sidebar__tab-icon">article</span>
                    <span className="community-sidebar__tab-label">Post</span>
                </span>
                <span className="community-sidebar__tab-count">{community.posts}</span>
            </button>
            <button
                type="button"
                onClick={() => onTabChange('members')}
                className={`community-sidebar__tab-btn ${
                    activeTab === 'members' ? 'community-sidebar__tab-btn--active' : 'community-sidebar__tab-btn--inactive'
                }`}
            >
                <span className="community-sidebar__tab-left">
                    <span className="material-symbols-outlined community-sidebar__tab-icon">people</span>
                    <span className="community-sidebar__tab-label">Members</span>
                </span>
            </button>
            <button
                type="button"
                onClick={() => onTabChange('about')}
                className={`community-sidebar__tab-btn ${
                    activeTab === 'about' ? 'community-sidebar__tab-btn--active' : 'community-sidebar__tab-btn--inactive'
                }`}
            >
                <span className="community-sidebar__tab-left">
                    <span className="material-symbols-outlined community-sidebar__tab-icon">info</span>
                    <span className="community-sidebar__tab-label">About this community</span>
                </span>
            </button>
        </aside>
    );
}
