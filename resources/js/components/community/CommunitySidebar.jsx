import React from 'react';
import '../../../sass/components/community/CommunitySidebar.scss';

export default function CommunityRightSidebar({ community, activeTab, onTabChange }) {
    return (
        <aside className="community-sidebar__container">
            <div className="community-sidebar__header">
                <img src={community.cardImage} alt={community.name} className="community-sidebar__image" />
                <div className="community-sidebar__info">
                    <p className="community-sidebar__name">{community.name}</p>
                    <p className="community-sidebar__username">{community.username}</p>
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
