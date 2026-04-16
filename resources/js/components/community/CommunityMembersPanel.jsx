import React from 'react';
import { Link } from 'react-router-dom';
import '../../../sass/components/community/CommunityMembersPanel.scss';

/**
 * SVG placeholder for missing user avatars
 */
const AVATAR_PLACEHOLDER_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect fill="%234a5568" width="48" height="48" rx="24"/%3E%3Ctext x="50%" y="50%" font-family="system-ui" font-size="20" fill="%8e92a7" text-anchor="middle" dy=".35em"%3E?%3C/text%3E%3C/svg%3E';

const handleImageError = (e) => {
    e.target.src = AVATAR_PLACEHOLDER_SVG;
};

export default function CommunityMembersPanel({ memberSearch, onSearchChange, visibleMembers, memberCount, getImageUrl }) {
    const formatMemberCount = (value) => {
        if (typeof value === 'number') {
            return value.toLocaleString('en-US');
        }

        if (typeof value !== 'string') {
            return '0';
        }

        const trimmed = value.trim().toLowerCase();
        const multiplier = trimmed.endsWith('k') ? 1000 : 1;
        const numeric = Number.parseFloat(trimmed.replace(/k$/, ''));

        if (Number.isNaN(numeric)) {
            return value;
        }

        return Math.round(numeric * multiplier).toLocaleString('en-US');
    };

    return (
        <div className="community-members-panel__container">
            <div className="community-members-panel__header">
                <p className="community-members-panel__title">{formatMemberCount(memberCount)} Members</p>
                <label className="community-members-panel__search-wrap">
                    <span className="material-symbols-outlined community-members-panel__search-icon">search</span>
                    <input
                        value={memberSearch}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Search Community Members"
                        className="community-members-panel__search-input"
                    />
                </label>
            </div>

            <div className="community-members-panel__list">
                {visibleMembers.map((member) => (
                    <Link key={member.id} to={`/profile/${member.name}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <article className="community-members-panel__item">
                            <img
                                src={getImageUrl(member.avatar) || AVATAR_PLACEHOLDER_SVG}
                                alt={member.name}
                                className="community-members-panel__avatar"
                                onError={handleImageError}
                            />
                            <div className="community-members-panel__info">
                                <p className="community-members-panel__name">{member.name}</p>
                                <p className="community-members-panel__handle">@{member.name?.toLowerCase().replace(/\s+/g, '-') || 'user'}</p>
                            </div>
                        </article>
                    </Link>
                ))}
            </div>
        </div>
    );
}
