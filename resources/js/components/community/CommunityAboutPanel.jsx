import React from 'react';
import { getFullImageUrl } from '../../utils/imageUrl';
import '../../../sass/components/community/CommunityAboutPanel.scss';

/**
 * SVG placeholder for missing user avatars
 */
const AVATAR_PLACEHOLDER_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%234a5568" width="48" height="48" rx="24"/%3E%3Ctext x="50%" y="50%" font-family="system-ui" font-size="20" fill="%8e92a7" text-anchor="middle" dy=".35em"%3E?%3C/text%3E%3C/svg%3E';


const handleImageError = (e) => {
    e.target.src = AVATAR_PLACEHOLDER_SVG;
};

export default function CommunityAboutPanel({ community, isCreator, getImageUrl, onEditRules }) {
    // Default placeholder rules if none exist
    const defaultRules = [
        'Be respectful to all members',
        'Keep posts relevant to the category',
        'No spam or self-promotion',
    ];
    
    const rules = community?.rules || defaultRules;
    
    // Format created date nicely (e.g., "April 2026")
    const formatCreatedDate = (dateString) => {
        if (!dateString) return 'Unknown';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="community-about-panel__wrapper">
            {/* Bento Card 1: Overview */}
            <div className="community-about-panel__card">
                {/* Stats & Metadata Grid */}
                <div className="community-about-panel__stats-grid">
                    <div className="community-about-panel__stat-item">
                        <span className="community-about-panel__stat-label">Created</span>
                        <p className="community-about-panel__stat-value">
                            {formatCreatedDate(community?.created_at)}
                        </p>
                    </div>
                    <div className="community-about-panel__stat-item">
                        <span className="community-about-panel__stat-label">Category</span>
                        <p className="community-about-panel__stat-value">
                            {community?.category?.name || 'Uncategorized'}
                        </p>
                    </div>
                </div>

                {/* Divider */}
                <div className="community-about-panel__divider"></div>

                {/* Description Section */}
                {community?.description && (
                    <div className="community-about-panel__section">
                        <h3 className="community-about-panel__section-heading">Description</h3>
                        <p className="community-about-panel__section-text">
                            {community.description}
                        </p>
                    </div>
                )}

                {/* Creator Profile Section */}
                {community?.creator && (
                    <div className="community-about-panel__section">
                        <h3 className="community-about-panel__section-heading">Created by</h3>
                        <div className="community-about-panel__creator-row">
                            <img
                                src={getFullImageUrl(community.creator.profile_picture) || AVATAR_PLACEHOLDER_SVG}
                                alt={community.creator.username}
                                className="community-about-panel__creator-avatar"
                                onError={handleImageError}
                            />
                            <div className="community-about-panel__creator-info">
                                <p className="community-about-panel__creator-name">
                                    {community.creator.username || community.creator.name}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bento Card 2: Rules */}
            <div className="community-about-panel__card">
                <div className="community-about-panel__rules-header">
                    <h3 className="community-about-panel__section-heading">Community Rules</h3>
                    {isCreator && (
                        <button
                            className="community-about-panel__edit-button"
                            onClick={() => onEditRules?.()}
                            title="Edit community rules"
                        >
                            Edit
                        </button>
                    )}
                </div>

                <ol className="community-about-panel__rules-list">
                    {rules.map((rule, index) => (
                        <li key={index} className="community-about-panel__rule-item">
                            {rule}
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
