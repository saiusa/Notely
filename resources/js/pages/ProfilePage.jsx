import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import JournalCard from '../components/journal/JournalCard';
import SocialLayout from '../components/layout/SocialLayout';
import '../../sass/pages/ProfilePage.scss';
import {
    formatBirthday,
    getCountryLabel,
} from '../components/profile/ProfileUser';
import ProfileCommunityPanel from '../components/profile/ProfileCommunityPanel';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import { useAuth } from '../context/AuthContext';
import profileService from '../services/profileService';
import postService from '../services/postService';
import communityService from '../services/communityService';

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const [showEdit, setShowEdit] = useState(false);
    const [posts, setPosts] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);

    // Build profile data from auth user
    const profileData = useMemo(() => ({
        firstName: user?.profile?.first_name || '',
        lastName: user?.profile?.last_name || '',
        username: user ? `@${user.username}` : '@user',
        birthday: user?.profile?.birthday || '',
        country: user?.profile?.location || 'south-korea',
        gender: user?.profile?.gender || '',
        description: user?.profile?.description || '',
        coverPhoto: 'https://images.unsplash.com/photo-1473643068424-cd2485f9a97f?auto=format&fit=crop&w=1400&q=80',
        profilePhoto: user?.profile?.profile_picture || 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=130&q=80',
    }), [user]);

    // Fetch user's posts
    const fetchPosts = useCallback(async () => {
        setLoadingPosts(true);
        try {
            const res = await postService.getFeed();
            const allPosts = res.data || res || [];
            // Filter to only user's own public posts
            const userPosts = allPosts
                .filter((p) => p.user_id === user?.user_id && p.privacy === 'public')
                .map((post) => ({
                    id: post.post_id || post.id,
                    date: post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
                    time: post.created_at ? new Date(post.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
                    createdAt: post.created_at || new Date().toISOString(),
                    isPublic: post.privacy === 'public',
                    text: post.content || '',
                    mood: post.mood?.name || '',
                    image: post.image || null,
                    likes: post.likes_count ?? 0,
                    comments: post.comments_count ?? 0,
                }));
            setPosts(userPosts);
        } catch (_) {
            setPosts([]);
        } finally {
            setLoadingPosts(false);
        }
    }, [user?.user_id]);

    // Fetch user's communities
    const fetchCommunities = useCallback(async () => {
        try {
            const res = await communityService.getMyCommunities();
            const data = res.data || res || [];
            setCommunities(data.map((c) => ({
                id: c.community_id || c.id,
                name: c.name,
                handle: `@${c.name.toLowerCase().replace(/\s+/g, '-')}`,
            })));
        } catch (_) {
            setCommunities([]);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
        fetchCommunities();
    }, [fetchPosts, fetchCommunities]);

    const recentPublicPosts = useMemo(() => {
        return posts
            .filter((p) => p.isPublic)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 4);
    }, [posts]);

    const handleSaveProfile = async (nextProfile) => {
        try {
            await profileService.updateProfile({
                first_name: nextProfile.firstName,
                last_name: nextProfile.lastName,
                location: nextProfile.country,
                birthday: nextProfile.birthday,
                gender: nextProfile.gender,
                description: nextProfile.description,
                profile_picture: nextProfile.profilePhoto,
            });
            await refreshUser();
        } catch (_) {
            // ignore
        }
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
                        <img src={profileData.coverPhoto} alt="cover" className="profile-card__cover" />

                        <div className="profile-card__content">
                            <img
                                src={profileData.profilePhoto}
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
                        {loadingPosts ? (
                            <p style={{ color: '#a5abb9', padding: '20px 0' }}>Loading posts...</p>
                        ) : recentPublicPosts.length === 0 ? (
                            <p style={{ color: '#a5abb9', padding: '20px 0' }}>No public posts yet.</p>
                        ) : (
                            recentPublicPosts.map((post) => (
                                <JournalCard
                                    key={`profile-overview-${post.id}`}
                                    card={post}
                                    isPublicView
                                    compact
                                    onEdit={() => {}}
                                    onTogglePrivacy={() => {}}
                                    onCopyLink={() => {}}
                                />
                            ))
                        )}
                    </div>
                </section>

                <ProfileCommunityPanel communities={communities} />
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
