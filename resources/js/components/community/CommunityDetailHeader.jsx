import React from 'react';
import '../../../sass/components/community/CommunityDetailHeader.scss';

export default function CommunityDetailHeader({
    community,
    isJoined,
    showHeaderMenu,
    onToggleMenu,
    onLeaveCommunity,
    onCopyLink,
    onReport,
    onJoinCommunity,
}) {
    return (
        <article className="community-detail-header__container">
            <img src={community.coverImage} alt={community.name} className="community-detail-header__cover" />

            <div className="community-detail-header__menu-container">
                <div className="community-detail-header__menu-wrap">
                    <button
                        type="button"
                        onClick={onToggleMenu}
                        className="community-detail-header__menu-btn"
                        aria-label="Community menu"
                    >
                        <span className="material-symbols-outlined community-detail-header__menu-icon">more_horiz</span>
                    </button>

                    {showHeaderMenu ? (
                        <div className="community-detail-header__menu">
                            {isJoined ? (
                                <button
                                    type="button"
                                    onClick={onLeaveCommunity}
                                    className="community-detail-header__menu-item"
                                >
                                    Leave
                                </button>
                            ) : null}
                            <button
                                type="button"
                                onClick={onCopyLink}
                                className="community-detail-header__menu-item"
                            >
                                Copy link
                            </button>
                            <button
                                type="button"
                                onClick={onReport}
                                className="community-detail-header__menu-item"
                            >
                                Report
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="community-detail-header__bottom">
                <div className="community-detail-header__info">
                    <h2 className="community-detail-header__name">{community.name}</h2>
                    <p className="community-detail-header__description">{community.description}</p>
                </div>

                <div className="community-detail-header__actions">
                    <button
                        type="button"
                        onClick={onJoinCommunity}
                        className={`community-detail-header__join-btn ${
                            isJoined
                                ? 'community-detail-header__join-btn--joined'
                                : 'community-detail-header__join-btn--default'
                        }`}
                        disabled={isJoined}
                    >
                        {isJoined ? 'Joined' : 'Join Community'}
                    </button>
                </div>
            </div>
        </article>
    );
}
