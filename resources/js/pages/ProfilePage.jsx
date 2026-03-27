import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JournalCard from '../components/journal/JournalCard';
import SocialLayout from '../components/layout/SocialLayout';
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
            <div className="mx-auto grid grid-cols-1 gap-6 xl:grid-cols-[760px_315px] xl:justify-center mb-10">
                <section className="w-full max-w-[760px]">
                    <article className="overflow-hidden rounded-[10px] bg-[#212633]">
                        <img src={profileData.coverPhoto || defaultProfile.coverPhoto} alt="cover" className="h-[200px] w-full object-cover" />

                        <div className="relative p-8 pt-16">
                            <img
                                src={profileData.profilePhoto || defaultProfile.profilePhoto}
                                alt="avatar"
                                className="absolute -top-[44px] left-8 h-[88px] w-[88px] rounded-full border-2 border-[#212633] object-cover"
                            />

                            <button
                                type="button"
                                onClick={() => setShowEdit(true)}
                                className="absolute right-8 top-4 h-[38px] rounded-full bg-[#343b4f] px-5 text-[16px] font-medium leading-none hover:bg-[#46506a]"
                            >
                                Edit Profile
                            </button>

                            <h2 className="text-[24px] font-medium leading-[1.15]">{`${profileData.firstName} ${profileData.lastName}`}</h2>
                            <p className="mt-1 text-[14px] font-normal leading-[1.2] text-[#a2a7b7]">{profileData.username}</p>

                            <div className="mt-6 flex flex-wrap items-center gap-6 text-[14px] font-normal leading-[1.25] text-[#d4d8e3]">
                                <p className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                                    {getCountryLabel(profileData.country)}
                                </p>
                                <p className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[20px]">cake</span>
                                    {formatBirthday(profileData.birthday)}
                                </p>
                            </div>

                            <p className="mt-6 max-w-[92%] text-[16px] font-normal leading-[1.5]">{profileData.description}</p>
                        </div>
                    </article>

                    <div className="mt-10 flex items-center justify-between">
                        <h3 className="ml-2 text-[24px] font-semibold leading-[1.1]">Post</h3>
                        <Link to="/profile/posts" className="flex items-center gap-1 text-[14px] leading-[1.2] text-[#cacddd] hover:text-[#785EBF]">
                            Show all
                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        </Link>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
