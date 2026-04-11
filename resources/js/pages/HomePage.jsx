import React, { useCallback, useEffect, useState } from 'react';
import SocialLayout from '../components/layout/SocialLayout';
import PostCard from '../components/posts/PostCard';
import ComposerModal from '../components/layout/ComposerModal';
import Loader from '../components/common/Loader';
import postService from '../services/postService';
import notificationService from '../services/notificationService';
import '../../sass/pages/HomePage.scss';

export default function HomePage() {
    const [activeTab, setActiveTab] = useState('explore');
    const [composerMode, setComposerMode] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifCount, setNotifCount] = useState(0);
    const [recentJournals, setRecentJournals] = useState([]);

    // Mock posts for demo
    const MOCK_POSTS = [
        {
            id: 1,
            post_id: 1,
            user_id: 1,
            content: 'Just launched my new portfolio website! Check it out and let me know what you think.',
            mood_id: 2,
            privacy: 'public',
            allow_comments: true,
            is_anonymous: false,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            user: {
                id: 1,
                username: 'seokim',
                profile: { first_name: 'Seokin', last_name: 'Kim', profile_picture: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=120&q=80' }
            },
            mood: { id: 2, name: 'Happy', color: '#FFD700' },
            likes_count: 12,
            comments_count: 3,
            is_liked: false,
            hashtags: ['portfolio', 'webdesign']
        },
        {
            id: 2,
            post_id: 2,
            user_id: 2,
            content: 'Loving this new minimalist design trend in UI/UX.',
            mood_id: 3,
            privacy: 'public',
            allow_comments: true,
            is_anonymous: false,
            created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            user: {
                id: 2,
                username: 'designlover',
                profile: { first_name: 'Alex', last_name: 'Chen', profile_picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' }
            },
            mood: { id: 3, name: 'Inspired', color: '#9370DB' },
            likes_count: 28,
            comments_count: 5,
            is_liked: false,
            hashtags: ['design', 'uiux', 'trends']
        },
        {
            id: 3,
            post_id: 3,
            user_id: 3,
            content: 'Finally finished my React learning journey! Built a full-stack app from scratch.',
            mood_id: 1,
            privacy: 'public',
            allow_comments: true,
            is_anonymous: false,
            created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            user: {
                id: 3,
                username: 'techninja',
                profile: { first_name: 'Jordan', last_name: 'Tech', profile_picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' }
            },
            mood: { id: 1, name: 'Excited', color: '#FF6B6B' },
            likes_count: 45,
            comments_count: 8,
            is_liked: false,
            hashtags: ['react', 'webdev', 'learning']
        },
    ];

    // Fetch feed posts from API
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await postService.getFeed();
            const data = res.data || res || [];
            setPosts(data.length > 0 ? data : MOCK_POSTS);
        } catch (_) {
            setPosts(MOCK_POSTS);
        } finally {
            setLoading(false);
        }
    }, []);


    // Fetch notification count
    const fetchNotifCount = useCallback(async () => {
        try {
            const res = await notificationService.getUnreadCount();
            setNotifCount(res.unread_count || 0);
        } catch (_) {
            // ignore
        }
    }, []);

    // Fetch recent journals for sidebar
    const fetchRecentJournals = useCallback(async () => {
        try {
            const res = await postService.getFeed();
            const data = res.data || res || [];
            const journals = data.length > 0 ? data.slice(0, 4) : MOCK_POSTS.slice(0, 4);
            setRecentJournals(journals);
        } catch (_) {
            setRecentJournals(MOCK_POSTS.slice(0, 4));
        }
    }, []);

    useEffect(() => {
        fetchPosts();
        fetchNotifCount();
        fetchRecentJournals();
    }, [fetchPosts, fetchNotifCount, fetchRecentJournals]);

    const handlePostCreated = () => {
        fetchPosts(); // Refresh feed after posting
        fetchRecentJournals(); // Refresh recent journals
    };

    const handlePostDeleted = (postId) => {
        setPosts((prev) => prev.filter((p) => (p.post_id || p.id) !== postId));
        setRecentJournals((prev) => prev.filter((p) => (p.post_id || p.id) !== postId));
    };

    const handleClearRecentJournals = () => {
        setRecentJournals([]);
    };

    return (
        <>
            <SocialLayout
                activeNav="home"
                navbarMode="tabs"
                activeTab={activeTab}
                onTabChange={setActiveTab}
                notificationCount={notifCount}
                recentJournals={recentJournals}
                onClearRecentJournals={handleClearRecentJournals}
            >
                {/* Write Post Buttons */}
                <div className="home-page__compose-bar">
                    <button
                        type="button"
                        onClick={() => setComposerMode('text')}
                        className="home-page__compose-btn"
                        aria-label="Write text post"
                    >
                        <span className="material-symbols-outlined home-page__compose-icon">title</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setComposerMode('quote')}
                        className="home-page__compose-btn"
                        aria-label="Write quote"
                    >
                        <span className="material-symbols-outlined home-page__compose-icon">format_quote</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setComposerMode('image')}
                        className="home-page__compose-btn"
                        aria-label="Upload image"
                    >
                        <span className="material-symbols-outlined home-page__compose-icon">image</span>
                    </button>
                </div>

                {/* Feed */}
                <div className="home-page__feed">
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                            <Loader />
                        </div>
                    ) : posts.length === 0 ? (
                        <p style={{ color: '#a5abb9', textAlign: 'center', padding: '40px 0' }}>No posts yet. Write your first one!</p>
                    ) : (
                        posts.map((post) => (
                            <PostCard
                                key={post.post_id || post.id}
                                post={post}
                                onPostDeleted={handlePostDeleted}
                            />
                        ))
                    )}
                </div>
            </SocialLayout>

            {/* Composer Modal */}
            {composerMode && (
                <ComposerModal
                    mode={composerMode}
                    onClose={() => setComposerMode(null)}
                    onPostCreated={handlePostCreated}
                />
            )}
        </>
    );
}