import React, { useMemo, useState } from 'react';
import '../../../sass/components/profile/ProfileCommunityPanel.scss';

export default function ProfileCommunityPanel({ communities }) {
    const [expanded, setExpanded] = useState(false);

    const visibleCommunities = useMemo(() => {
        if (expanded) {
            return communities;
        }
        return communities.slice(0, 6);
    }, [communities, expanded]);

    return (
        <aside className="profile-community-panel">
            <h4 className="profile-community-panel__title">COMMUNITIES</h4>

            <div className="profile-community-panel__list">
                {visibleCommunities.map((community) => (
                    <div key={community.id} className="profile-community-panel__item">
                        <img
                            src="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=110&q=80"
                            alt={community.name}
                            className="profile-community-panel__image"
                        />
                        <div className="profile-community-panel__item-text">
                            <p className="profile-community-panel__name">{community.name}</p>
                            <p className="profile-community-panel__handle">{community.handle}</p>
                        </div>
                    </div>
                ))}
            </div>

            {communities.length > 4 ? (
                <button
                    type="button"
                    onClick={() => setExpanded((prev) => !prev)}
                    className="profile-community-panel__toggle"
                >
                    {expanded ? 'Show less' : 'Show more'}
                    <span className={`material-symbols-outlined profile-community-panel__toggle-icon ${expanded ? 'profile-community-panel__toggle-icon--expanded' : ''}`}>
                        chevron_right
                    </span>
                </button>
            ) : null}
        </aside>
    );
}
