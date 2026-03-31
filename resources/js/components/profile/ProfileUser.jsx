import React from 'react';
import { countryOptions } from './countries';
import '../../../sass/components/profile/ProfileUser.scss';

export const defaultProfile = {
    firstName: 'Jungkook',
    lastName: 'Jeon',
    username: '@jungkook.bts',
    birthday: '1997-09-01',
    country: 'south-korea',
    gender: 'Male',
    description: 'Anyeong hasaeyeo jeoneun bangtan sonyeondan hwangeum maknae jeon jungkook imnida.',
    coverPhoto:
        'https://images.unsplash.com/photo-1473643068424-cd2485f9a97f?auto=format&fit=crop&w=1400&q=80',
    profilePhoto:
        'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=130&q=80',
};

export function formatBirthday(dateString) {
    if (!dateString) {
        return '';
    }

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

export function getCountryLabel(countryValue) {
    const country = countryOptions.find((item) => item.value === countryValue);
    return country?.label || countryOptions[0].label;
}

export { countryOptions };

function trimPostText(text, limit) {
    if (!text) {
        return '';
    }

    if (text.length <= limit) {
        return text;
    }

    return `${text.slice(0, limit)}...`;
}

export function getPublicJournalPosts(journalCards) {
    return journalCards
        .filter((card) => card.isPublic)
        .map((card, index) => ({
            ...card,
            id: card.id || `public-journal-${index}`,
            createdAt:
                card.createdAt ||
                `${new Date().getFullYear()}-01-01T00:${String(index).padStart(2, '0')}:00Z`,
            user: 'jin.bts',
            avatar: defaultProfile.profilePhoto,
            username: 'jin.bts',
            handle: '@jin.bts',
            time: card.time || '1 hour',
        }));
}

export function ProfilePostFeedCard({ post }) {
    const body = trimPostText(post.text, post.image ? 120 : 180);

    return (
        <article className="profile-feed-card">
            <div className="profile-feed-card__header">
                <div className="profile-feed-card__user">
                    <img src={post.avatar} alt={post.username} className="profile-feed-card__avatar" />
                    <div className="profile-feed-card__identity">
                        <p className="profile-feed-card__username">{post.username}</p>
                        <p className="profile-feed-card__time">{post.time}</p>
                    </div>
                </div>
                <button
                    type="button"
                    className="profile-feed-card__menu-button"
                    aria-label="Post options"
                >
                    <span className="material-symbols-outlined profile-feed-card__menu-icon">more_vert</span>
                </button>
            </div>

            {body ? <p className="profile-feed-card__body">{body}</p> : null}

            {post.image ? (
                <img src={post.image} alt="journal" className="profile-feed-card__image" />
            ) : null}

            <div className="profile-feed-card__mood-row">
                {post.mood ? (
                    <span className="profile-feed-card__mood-pill">{post.mood}</span>
                ) : null}
            </div>

            <div className="profile-feed-card__actions-wrap">
                <div className="profile-feed-card__actions-grid">
                    <button type="button" className="profile-feed-card__action-button">
                        <span className="material-symbols-outlined profile-feed-card__action-icon">favorite_border</span>
                        {post.likes || '77k'}
                    </button>
                    <button type="button" className="profile-feed-card__action-button">
                        <span className="material-symbols-outlined profile-feed-card__action-icon">chat_bubble_outline</span>
                        {post.comments || '700'}
                    </button>
                    <button type="button" className="profile-feed-card__action-button">
                        <span className="material-symbols-outlined profile-feed-card__action-icon">share</span>
                    </button>
                </div>
            </div>
        </article>
    );
}

