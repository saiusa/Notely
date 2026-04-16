import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SocialLayout from '../layout/SocialLayout';
import PostCard from '../posts/PostCard';
import ProfileCommunityPanel from './ProfileCommunityPanel';
import postService from '../../services/postService';
import communityService from '../../services/communityService';
import { useAuth } from '../../context/AuthContext';
import '../../../sass/components/profile/ProfilePosts.scss';

function formatRelativeTime(dateInput) {
    const createdTime = new Date(dateInput).getTime();
    if (Number.isNaN(createdTime)) {
        return 'just now';
    }

    const seconds = Math.max(0, Math.floor((Date.now() - createdTime) / 1000));
    if (seconds < 60) {
        return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}

export default function ProfilePostsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [sortBy, setSortBy] = useState('recent');
    const [filterOpen, setFilterOpen] = useState(false);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [communities, setCommunities] = useState([]);
    const filterMenuRef = useRef(null);

    // Click-outside listener for filter menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
                setFilterOpen(false);
            }
        };

        if (filterOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [filterOpen]);

    // Fetch current user's public posts from API
    const fetchUserPosts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await postService.getFeed();
            const data = response.data || response || [];
            // Filter for current user's public posts only
            const userPublicPosts = data.filter((post) => 
                post.user_id === user?.user_id && post.privacy === 'public'
            );
            // Sort based on selection
            const sorted = sortBy === 'recent' 
                ? userPublicPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                : userPublicPosts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            setPosts(sorted);
            console.log(`Fetched ${sorted.length} user's public posts`);
        } catch (error) {
            console.error('Failed to fetch user posts:', error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [sortBy, user?.user_id]);

    // Fetch user's communities from API
    const fetchUserCommunities = useCallback(async () => {
        try {
            const res = await communityService.getMyCommunities();
            console.log('Communities API response:', res);
            
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
        } catch (error) {
            console.error('Failed to fetch user communities:', error);
            setCommunities([]);
        }
    }, []);

    useEffect(() => {
        fetchUserPosts();
        fetchUserCommunities();
    }, [fetchUserPosts, fetchUserCommunities]);

    const handleDeletePost = (postId) => {
        setPosts((prev) => prev.filter((p) => (p.post_id || p.id) !== postId));
    };

    return (
        <SocialLayout
            activeNav="profile"
            navbarMode="title"
            title=""
            showBack
            onBack={() => navigate(-1)}
        >
            <div className="profile-posts-layout">
                <section className="profile-posts-layout__main">
                    <div className="profile-posts-layout__header">
                        <h2 className="profile-posts-layout__title">Post</h2>
                        <div className="profile-posts-layout__filter-wrap" ref={filterMenuRef}>
                            <button
                                type="button"
                                onClick={() => setFilterOpen((prev) => !prev)}
                                className="profile-posts-layout__filter-toggle"
                                aria-label="Filter public posts"
                            >
                                <span className="material-symbols-outlined profile-posts-layout__filter-icon">tune</span>
                            </button>

                    {filterOpen ? (
                        <div className="profile-posts-layout__filter-menu">
                            <button
                                type="button"
                                onClick={() => {
                                    setSortBy('recent');
                                    setFilterOpen(false);
                                }}
                                className="profile-posts-layout__filter-item"
                            >
                                Most Recent
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSortBy('oldest');
                                    setFilterOpen(false);
                                }}
                                className="profile-posts-layout__filter-item"
                            >
                                Oldest
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="profile-posts-layout__list">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#a5abb9' }}>
                        Loading posts...
                    </div>
                ) : posts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#a5abb9' }}>
                        No posts yet. Create your first post!
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard 
                            key={`profile-public-${post.post_id || post.id}`} 
                            post={post}
                            onPostDeleted={handleDeletePost}
                        />
                    ))
                )}
            </div>
        </section>

        <ProfileCommunityPanel communities={communities} />
            </div>
        </SocialLayout>
    );
}
