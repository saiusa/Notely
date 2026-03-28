import React from 'react';
import { Link } from 'react-router-dom';
import '../../../sass/components/community/Community.scss';


export default function CommunityListCard({ community, actionLabel, to }) {
    return (
        <article className="community-list-card__container">
            <img src={community.cardImage} alt={community.name} className="community-list-card__image" />
            <div className="community-list-card__content">
                <h3 className="community-list-card__name">{community.name}</h3>
                <p className="community-list-card__description">{community.description}</p>
                <p className="community-list-card__members">
                    <span className="community-list-card__members-value">{community.members}</span>
                    <span className="community-list-card__members-label">members</span>
                </p>
                <Link
                    to={to}
                    className="community-list-card__action"
                >
                    {actionLabel}
                </Link>
            </div>
        </article>
    );
}
