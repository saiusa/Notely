import React, { useCallback, useEffect, useState } from 'react';
import SocialLayout from '../components/layout/SocialLayout';
import PostCard from '../components/posts/PostCard';
import ComposerModal from '../components/layout/ComposerModal';
import Loader from '../components/common/Loader';
import postService from '../services/postService';
import communityService from '../services/communityService';
import notificationService from '../services/notificationService';
import '../../sass/pages/HomePage.scss';

export default function HomePage() {
    const [activeTab, setActiveTab] = useState('explore');
    const [composerMode, setComposerMode] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notifCount, setNotifCount] = useState(0);
    const [recentJournals, setRecentJournals] = useState([]);
    const [filterType, setFilterType] = useState('recent');
    const [myCommunities, setMyCommunities] = useState([]);

    // Fetch feed posts from API only
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            let res;
            
            // Fetch different feed based on active tab
            if (activeTab === 'explore') {
                // Explore: Trending posts sorted by engagement (server-side)
                res = await postService.getExploreFeed();
            } else if (activeTab === 'community') {
                // Community: Posts from joined communities
                res = await postService.getCommunityFeed();
            } else {
                // Fallback: Default feed
                res = await postService.getFeed();
            }
            
            const data = res.data || res || [];
            
            // Client-side sorting only for non-Explore tabs
            // Explore tab is already sorted by engagement server-side
            let sortedPosts = data;
            
            if (activeTab !== 'explore') {
                if (filterType === 'popular') {
                    sortedPosts = sortedPosts.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
                } else if (filterType === 'mood') {
                    // Sort by posts that have mood set, then by creation date
                    sortedPosts = sortedPosts.sort((a, b) => {
                        const aMood = a.mood_id || 0;
                        const bMood = b.mood_id || 0;
                        if ((aMood > 0) !== (bMood > 0)) {
                            return bMood > 0 ? 1 : -1;
                        }
                        return new Date(b.created_at) - new Date(a.created_at);
                    });
                }
            }
            
            setPosts(sortedPosts);
            
            // Log filter results for debugging
            if (activeTab === 'explore') {
                console.log(`✓ Explore feed loaded - ${sortedPosts.length} trending posts`);
            } else if (filterType === 'popular' && sortedPosts.length > 0) {
                console.log(`✓ Filtered by POPULAR - Top post has ${sortedPosts[0].likes_count || 0} likes`);
            } else if (filterType === 'mood' && sortedPosts.length > 0) {
                const withMood = sortedPosts.filter(p => p.mood_id).length;
                console.log(`✓ Filtered by MOOD - ${withMood}/${sortedPosts.length} posts have mood`);
            } else if (filterType === 'recent') {
                console.log(`✓ Filtered by RECENT`);
            }
            
            console.log(`Fetched ${sortedPosts.length} posts for tab: ${activeTab}, filter: ${filterType}`);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
            setPosts([]); // Empty state, no mock data
        } finally {
            setLoading(false);
        }
    }, [activeTab, filterType]);


    // Fetch user's communities for destination dropdown
    const fetchMyCommunities = useCallback(async () => {
        try {
            const res = await communityService.getMyCommunities();
            const data = res.data || res || [];
            setMyCommunities(data);
            console.log(`Fetched ${data.length} communities`);
        } catch (error) {
            console.error('Failed to fetch communities:', error);
            setMyCommunities([]);
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

    // Fetch recent journals for sidebar from API only
    const fetchRecentJournals = useCallback(async () => {
        try {
            const res = await postService.getFeed();
            const data = res.data || res || [];
            const journals = data.slice(0, 4); // Get first 4 posts
            setRecentJournals(journals);
            console.log(`Fetched ${journals.length} recent journals`);
        } catch (error) {
            console.error('Failed to fetch recent journals:', error);
            setRecentJournals([]); // Empty state, no mock data
        }
    }, []);

    useEffect(() => {
        fetchPosts();
        fetchMyCommunities();
        fetchNotifCount();
        fetchRecentJournals();
    }, [fetchPosts, fetchMyCommunities, fetchNotifCount, fetchRecentJournals]);

    // ── Notification Polling: Check for new notifications every 30 seconds ──
    useEffect(() => {
        const pollInterval = setInterval(async () => {
            try {
                const unreadData = await notificationService.getUnreadCount();
                if (unreadData.unread_count > notifCount) {
                    setNotifCount(unreadData.unread_count);
                    console.log('New notifications available:', unreadData.unread_count);
                }
            } catch (error) {
                console.error('Failed to poll notifications:', error);
            }
        }, 30000); // 30 seconds

        return () => clearInterval(pollInterval);
    }, [notifCount]);

    const handlePostCreated = (newPost, destination) => {
        // Determine which tab the post belongs to based on destination
        let targetTab = 'explore';
        if (destination === 'journal_private') {
            targetTab = 'private'; // Or whatever your tab name for private posts
        } else if (destination?.startsWith('community_')) {
            targetTab = 'community';
        }

        // Switch to the appropriate tab
        setActiveTab(targetTab);

        // Add the new post to the top of the feed instantly (optimistic UI)
        setPosts((prevPosts) => {
            // Extract post from response (could be response.post or response.data)
            const postData = newPost.post || newPost.data || newPost;
            return [postData, ...prevPosts];
        });

        // Refresh recent journals sidebar
        fetchRecentJournals();

        // Close the modal
        setComposerMode(null);

        console.log(`✓ New post created and added to ${targetTab} feed instantly`);
    };

    const handlePostDeleted = (postId) => {
        setPosts((prev) => {
            const updated = prev.filter((p) => (p.post_id || p.id) !== postId);
            console.log(`Post deleted: ${postId}, remaining: ${updated.length}`);
            return updated;
        });
        setRecentJournals((prev) => prev.filter((p) => (p.post_id || p.id) !== postId));
    };

    const handleClearRecentJournals = () => {
        setRecentJournals([]);
    };

    const handleFilterChange = (filter) => {
        setFilterType(filter);
    };

    return (
        <>
            <SocialLayout
                activeNav="home"
                navbarMode="tabs"
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onFilterChange={handleFilterChange}
                currentFilter={filterType}
                notificationCount={notifCount}
                recentJournals={recentJournals}
                onClearRecentJournals={handleClearRecentJournals}
            >
                {/* Write Post Buttons */}
                <div className="home-page__compose-bar">
                    <button
                        type="button"
                        onClick={() => {
                            console.log('Opening text composer');
                            setComposerMode('text');
                        }}
                        className="home-page__compose-btn"
                        aria-label="Write text post"
                        title="Write a text post"
                    >
                        <span className="material-symbols-outlined home-page__compose-icon">title</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            console.log('Opening quote composer');
                            setComposerMode('quote');
                        }}
                        className="home-page__compose-btn"
                        aria-label="Write quote"
                        title="Write a quote"
                    >
                        <span className="material-symbols-outlined home-page__compose-icon">format_quote</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            console.log('Opening image composer');
                            setComposerMode('image');
                        }}
                        className="home-page__compose-btn"
                        aria-label="Upload image"
                        title="Upload an image"
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
                    myCommunities={myCommunities}
                />
            )}
        </>
    );
}