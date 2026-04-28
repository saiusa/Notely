import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFullImageUrl } from '../../utils/imageUrl';
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
                {visibleCommunities.length === 0 ? (
                    <p style={{ color: '#a5abb9', padding: '20px 0', fontSize: '14px' }}>
                        No communities yet
                    </p>
                ) : (
                    visibleCommunities.map((community) => (
                        community.categorySlug && community.id ? (
                            <Link
                                key={community.id}
                                to={`/community/browse/${community.categorySlug}/${community.id}`}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <div className="profile-community-panel__item">
                                    <img
                                        src={getFullImageUrl(community.image) || 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=110&q=80'}
                                        alt={community.name}
                                        className="profile-community-panel__image"
                                    />
                                    <div className="profile-community-panel__item-text">
                                        <p className="profile-community-panel__name">{community.name}</p>
                                        <p className="profile-community-panel__handle">{community.handle}</p>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div key={community.id} className="profile-community-panel__item">
                                <img
                                    src={getFullImageUrl(community.image) || 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=110&q=80'}
                                    alt={community.name}
                                    className="profile-community-panel__image"
                                />
                                <div className="profile-community-panel__item-text">
                                    <p className="profile-community-panel__name">{community.name}</p>
                                    <p className="profile-community-panel__handle">{community.handle}</p>
                                </div>
                            </div>
                        )
                    ))
                )}
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
