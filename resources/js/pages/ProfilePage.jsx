import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JournalCard from '../components/journal/JournalCard';
import SocialLayout from '../components/layout/SocialLayout';
import '../../sass/pages/ProfilePage.scss';
import {
    defaultProfile,
    formatBirthday,
    getCountryLabel,
    getPublicJournalPosts,
} from '../components/profile/ProfileUser';
import ProfileCommunityPanel from '../components/profile/ProfileCommunityPanel';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import { journalCards, profileCommunities } from '../utils/socialMockData';

export default function ProfilePage() {
    const [profileData, setProfileData] = useState(defaultProfile);
    const [showEdit, setShowEdit] = useState(false);

    const recentPublicPosts = useMemo(() => {
        return getPublicJournalPosts(journalCards)
            .slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 4);
    }, []);

    const handleSaveProfile = (nextProfile) => {
        setProfileData(nextProfile);
        setShowEdit(false);
    };

    return (
        <SocialLayout
            activeNav="profile"
            navbarMode="title"
            title="Profile"
        >
            <div className="profile-page-layout">
                <section className="profile-page-layout__main">
                    <article className="profile-card">
                        <img src={profileData.coverPhoto || defaultProfile.coverPhoto} alt="cover" className="profile-card__cover" />

                        <div className="profile-card__content">
                            <img
                                src={profileData.profilePhoto || defaultProfile.profilePhoto}
                                alt="avatar"
                                className="profile-card__avatar"
                            />

                            <button
                                type="button"
                                onClick={() => setShowEdit(true)}
                                className="profile-card__edit-button"
                            >
                                Edit Profile
                            </button>

                            <h2 className="profile-card__name">{`${profileData.firstName} ${profileData.lastName}`}</h2>
                            <p className="profile-card__username">{profileData.username}</p>

                            <div className="profile-card__meta-row">
                                <p className="profile-card__meta-item">
                                    <span className="material-symbols-outlined profile-card__meta-icon">location_on</span>
                                    {getCountryLabel(profileData.country)}
                                </p>
                                <p className="profile-card__meta-item">
                                    <span className="material-symbols-outlined profile-card__meta-icon">cake</span>
                                    {formatBirthday(profileData.birthday)}
                                </p>
                            </div>

                            <p className="profile-card__description">{profileData.description}</p>
                        </div>
                    </article>

                    <div className="profile-page-layout__posts-header">
                        <h3 className="profile-page-layout__posts-title">Post</h3>
                        <Link to="/profile/posts" className="profile-page-layout__show-all-link">
                            Show all
                            <span className="material-symbols-outlined profile-page-layout__show-all-icon">chevron_right</span>
                        </Link>
                    </div>

                    <div className="profile-page-layout__posts-grid">
                        {recentPublicPosts.map((post) => (
                            <JournalCard
                                key={`profile-overview-${post.id}`}
                                card={post}
                                isPublicView
                                compact
                                onEdit={() => {}}
                                onTogglePrivacy={() => {}}
                                onCopyLink={() => {}}
                            />
                        ))}
                    </div>
                </section>

                <ProfileCommunityPanel communities={profileCommunities} />
            </div>

            {showEdit ? (
                <ProfileEditModal
                    profile={profileData}
                    onSave={handleSaveProfile}
                    onClose={() => setShowEdit(false)}
                />
            ) : null}
        </SocialLayout>
    );
}
