import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import ProfileLayout from '../components/layout/ProfileLayout';
import Loader from '../components/common/Loader';
import '../../sass/pages/ProfilePage.scss';
import {
    formatBirthday,
    getCountryLabel,
} from '../components/profile/ProfileUser';
import ProfileCommunityPanel from '../components/profile/ProfileCommunityPanel';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import PostCard from '../components/posts/PostCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import profileService from '../services/profileService';
import postService from '../services/postService';
import communityService from '../services/communityService';
import { getFullImageUrl } from '../utils/imageUrl';

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    const { username: paramUsername } = useParams();
    const [showEdit, setShowEdit] = useState(false);
    const [posts, setPosts] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [loadingCommunities, setLoadingCommunities] = useState(true);
    const [viewedUser, setViewedUser] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Determine if viewing own profile or another user's
    const isOwnProfile = !paramUsername || paramUsername === user?.username;
    const displayUser = viewedUser || user;

    // Build profile data from auth user or viewed user
    const profileData = useMemo(() => ({
        firstName: displayUser?.profile?.first_name || '',
        lastName: displayUser?.profile?.last_name || '',
        username: displayUser ? `@${displayUser.username}` : '@user',
        birthday: displayUser?.profile?.birthday || '',
        country: displayUser?.profile?.location || 'south-korea',
        gender: displayUser?.profile?.gender || '',
        description: displayUser?.profile?.description || '',
        coverPhoto: displayUser?.profile?.cover_photo || 'https://images.unsplash.com/photo-1473643068424-cd2485f9a97f?auto=format&fit=crop&w=1400&q=80',
        profilePhoto: displayUser?.profile?.profile_picture || 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=130&q=80',
    }), [displayUser]);

    // Load profile of other user if username is provided in URL
    useEffect(() => {
        if (!paramUsername || paramUsername === user?.username) {
            setViewedUser(null);
            setLoadingProfile(false);
            return;
        }

        setLoadingProfile(true);
        profileService.getUserProfile(paramUsername)
            .then((data) => {
                setViewedUser(data);
                setLoadingProfile(false);
            })
            .catch((err) => {
                console.error('Failed to load user profile:', err);
                setLoadingProfile(false);
            });
    }, [paramUsername, user?.username]);

    // Fetch user's posts
    const fetchPosts = useCallback(async () => {
        setLoadingPosts(true);
        try {
            const res = await postService.getFeed();
            const allPosts = res.data || res || [];
            // Filter to only the viewed user's public posts
            const targetUserId = displayUser?.user_id;
            const userPosts = allPosts
                .filter((p) => p.user_id === targetUserId && p.privacy === 'public')
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
    }, [displayUser?.user_id]);

    // Fetch user's communities
    const fetchCommunities = useCallback(async () => {
        setLoadingCommunities(true);
        try {
            const res = await communityService.getMyCommunities();
            console.log('Communities API response:', res);
            
            // The API returns { created: [...], joined: [...] }
            // Only display joined communities to avoid duplicates
            let data = [];
            if (res.joined) {
                data = res.joined;
            } else if (res.data) {
                const responseData = res.data;
                data = responseData.joined || [];
            } else if (Array.isArray(res)) {
                data = res;
            }
            
            console.log('Processed communities data:', data);
            
            if (Array.isArray(data) && data.length > 0) {
                // Deduplicate by ID just in case
                const uniqueIds = new Set();
                const mappedCommunities = data
                    .filter((c) => {
                        const id = c.community_id || c.id;
                        if (uniqueIds.has(id)) return false;
                        uniqueIds.add(id);
                        return true;
                    })
                    .map((c) => ({
                        id: c.community_id || c.id,
                        name: c.name,
                        handle: `@${c.name.toLowerCase().replace(/\s+/g, '-')}`,
                        image: c.image || c.card_image || '',
                        categorySlug: c.category?.slug || '',
                    }));
                console.log('Mapped communities:', mappedCommunities);
                setCommunities(mappedCommunities);
            } else {
                console.log('No communities found in response');
                setCommunities([]);
            }
        } catch (err) {
            console.error('Failed to fetch communities:', err);
            setCommunities([]);
        } finally {
            setLoadingCommunities(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
        // Only fetch communities when viewing own profile
        if (isOwnProfile) {
            fetchCommunities();
        } else {
            setCommunities([]);
        }
    }, [fetchPosts, fetchCommunities, isOwnProfile]);

    const recentPublicPosts = useMemo(() => {
        return posts
            .filter((p) => p.isPublic)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 4);
    }, [posts]);

    const handleSaveProfile = async (nextProfile, profilePhotoFile, coverPhotoFile) => {
        try {
            // Create FormData for file uploads
            const formData = new FormData();
            formData.append('first_name', nextProfile.firstName);
            formData.append('last_name', nextProfile.lastName);
            formData.append('location', nextProfile.country);
            formData.append('birthday', nextProfile.birthday);
            formData.append('gender', nextProfile.gender);
            formData.append('description', nextProfile.description);
            
            // Append files only if they were selected
            if (profilePhotoFile) {
                formData.append('profile_picture', profilePhotoFile);
            }
            if (coverPhotoFile) {
                formData.append('cover_photo', coverPhotoFile);
            }
            
            // Send the request with FormData
            await api.post('/me/profile-with-files', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            await refreshUser();
        } catch (err) {
            console.error('Failed to save profile:', err);
        }
        setShowEdit(false);
    };

    return (
        <ProfileLayout
            activeNav="profile"
            navbarMode="title"
            title="Profile"
        >
            <div className="profile-page-layout">
                <section className="profile-page-layout__main">
                    <article className="profile-card">
                        <img src={getFullImageUrl(profileData.coverPhoto)} alt="cover" className="profile-card__cover" />

                        <div className="profile-card__content">
                            <img
                                src={getFullImageUrl(profileData.profilePhoto)}
                                alt="avatar"
                                className="profile-card__avatar"
                            />

                            {isOwnProfile && (
                                <button
                                    type="button"
                                    onClick={() => setShowEdit(true)}
                                    className="profile-card__edit-button"
                                >
                                    Edit Profile
                                </button>
                            )}

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
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', gridColumn: '1 / -1' }}>
                                <Loader />
                            </div>
                        ) : recentPublicPosts.length === 0 ? (
                            <p style={{ color: '#a5abb9', padding: '20px 0' }}>No public posts yet.</p>
                        ) : (
                            recentPublicPosts.map((post) => (
                                <PostCard
                                    key={`profile-overview-${post.id}`}
                                    post={post}
                                    compact={true}
                                    variant="feed"
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
        </ProfileLayout>
    );
}
