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
import UserAvatar from '../components/common/UserAvatar';
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
    // No Unsplash fallbacks — UserAvatar handles missing images with letter initials,
    // and the cover photo conditional rendering shows a gradient fallback.
    const profileData = useMemo(() => ({
        firstName: displayUser?.profile?.first_name || '',
        lastName: displayUser?.profile?.last_name || '',
        username: displayUser ? `@${displayUser.username}` : '@user',
        birthday: displayUser?.profile?.birthday || '',
        country: displayUser?.profile?.location || 'south-korea',
        gender: displayUser?.profile?.gender || '',
        description: displayUser?.profile?.description || '',
        coverPhoto: displayUser?.profile?.cover_photo || null,
        profilePhoto: displayUser?.profile?.profile_picture || null,
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
            if (!isOwnProfile && viewedUser?.posts) {
                // Other user's profile — posts are already eager-loaded from the API
                const userPosts = viewedUser.posts.map((post) => ({
                    ...post,
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
            } else if (isOwnProfile) {
                // Own profile — fetch all own posts (public + private) via dedicated endpoint
                const res = await api.get('/me/posts').catch(() => postService.getFeed());
                const allPosts = res.data?.data || res.data || res || [];
                const targetUserId = displayUser?.user_id;
                const userPosts = (Array.isArray(allPosts) ? allPosts : [])
                    .filter((p) => !targetUserId || p.user_id === targetUserId)
                    .map((post) => ({
                        ...post,
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
            }
        } catch (_) {
            setPosts([]);
        } finally {
            setLoadingPosts(false);
        }
    }, [displayUser?.user_id, isOwnProfile, viewedUser]);

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
        if (isOwnProfile) {
            fetchCommunities();
        } else if (viewedUser?.communities) {
            // Public profile — map eager-loaded communities from the API
            const mapped = (viewedUser.communities || []).map((c) => ({
                id: c.community_id || c.id,
                name: c.name,
                handle: `@${c.name.toLowerCase().replace(/\s+/g, '-')}`,
                image: c.image || c.card_image || '',
                categorySlug: c.category?.slug || '',
            }));
            setCommunities(mapped);
        } else {
            setCommunities([]);
        }
    }, [fetchPosts, fetchCommunities, isOwnProfile, viewedUser]);

    const displayPosts = useMemo(() => {
        return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
            // Method spoofing for Laravel PUT with multipart/form-data
            formData.append('_method', 'PUT');

            // Send the request with FormData using POST + _method=PUT spoofing
            // The api interceptor auto-handles Content-Type for FormData
            await api.post('/me/profile', formData);

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
                        {displayUser?.profile?.cover_photo ? (
                            <img src={getFullImageUrl(profileData.coverPhoto)} alt="cover" className="profile-card__cover" />
                        ) : (
                            <div
                                className="profile-card__cover"
                                style={{ background: 'linear-gradient(to right, #1f2937, #581c87)', borderRadius: '10px 10px 0 0' }}
                            ></div>
                        )}

                        <div className="profile-card__content">
                            <UserAvatar
                                user={displayUser}
                                size="xl"
                                className="profile-card__avatar"
                                style={{ width: undefined, height: undefined }}
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
                        <h3 className="profile-page-layout__posts-title">Posts</h3>
                    </div>

                    <div
                        className="profile-page-layout__posts-feed"
                        style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '600px', margin: '0 auto', width: '100%' }}
                    >
                        {loadingPosts ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                                <Loader />
                            </div>
                        ) : displayPosts.length === 0 ? (
                            <p style={{ color: '#a5abb9', padding: '20px 0' }}>No posts yet.</p>
                        ) : (
                            displayPosts.map((post) => (
                                <PostCard
                                    key={`profile-overview-${post.id}`}
                                    post={post}
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
