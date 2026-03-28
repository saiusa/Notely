import React from 'react';
import '../../../sass/components/community/Community.scss';

export default function CommunityAboutPanel({ community }) {
    return (
        <article className="community-about-panel__container">
            <h3 className="community-about-panel__title">About this community</h3>
            <p className="community-about-panel__meta">Created: {community.createdAt}</p>
            <p
                className="community-about-panel__description"
                style={{
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 14,
                }}
            >
                {community.about}
            </p>
        </article>
    );
}
