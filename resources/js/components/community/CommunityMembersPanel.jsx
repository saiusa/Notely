import React from 'react';
import '../../../sass/components/community/Community.scss';

export default function CommunityMembersPanel({ memberSearch, onSearchChange, visibleMembers, memberCount }) {
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
                    <article key={member.id} className="community-members-panel__item">
                        <img src={member.avatar} alt={member.name} className="community-members-panel__avatar" />
                        <div className="community-members-panel__info">
                            <p className="community-members-panel__name">{member.name}</p>
                            <p className="community-members-panel__joined">{member.joinedDate}</p>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
