import '../../sass/pages/JournalPage.scss';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SmallPostCard from '../components/journal/SmallPostCard';
import JournalHeader from '../components/journal/JournalHeader';
import { PostDetailModal } from '../components/posts/modals';
import ComposerModal from '../components/layout/ComposerModal';
import JournalLayout from '../components/layout/JournalLayout';
import Loader from '../components/common/Loader';
import postService from '../services/postService';

export default function JournalPage() {
    const [visibilityTab, setVisibilityTab] = useState('private');
    const [sortBy, setSortBy] = useState('recent');
    const [editingCard, setEditingCard] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch user's own posts from API
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await postService.getFeed();
            const allPosts = res.data || res || [];
            console.log('Fetched posts:', allPosts); // Debug logging
            
            // Map API posts to journal card shape
            const mapped = allPosts.map((post) => {
                const createdTime = new Date(post.created_at);
                const now = new Date();
                const seconds = Math.max(0, Math.floor((now - createdTime) / 1000));
                let relativeTime = 'just now';
                
                if (seconds < 60) {
                    relativeTime = `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
                } else if (seconds < 3600) {
                    const minutes = Math.floor(seconds / 60);
                    relativeTime = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
                } else if (seconds < 86400) {
                    const hours = Math.floor(seconds / 3600);
                    relativeTime = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
                } else {
                    const days = Math.floor(seconds / 86400);
                    relativeTime = `${days} ${days === 1 ? 'day' : 'days'} ago`;
                }

                return {
                    id: post.post_id || post.id,
                    date: createdTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                    createdAt: post.created_at || new Date().toISOString(),
                    isPublic: post.privacy === 'public',
                    privacy: post.privacy || 'private',
                    text: post.content || '',
                    body: post.content || '',
                    content: post.content || '',
                    mood: post.mood?.name || '',
                    image: post.image || null,
                    image_url: post.image || null,
                    likes_count: post.likes_count ?? 0,
                    likes: post.likes_count ?? 0,
                    comments_count: post.comments_count ?? 0,
                    comments: post.comments_count ?? 0,
                    hashtags: post.hashtags || [],
                    user_id: post.user_id,
                    username: post.user?.username,
                    avatar: post.user?.profile?.profile_picture,
                    link: `${window.location.origin}/#/post/${post.post_id || post.id}`,
                    time: relativeTime, // Relative time for SmallPostCard display
                };
            });
            console.log('Mapped posts:', mapped); // Debug logging
            setCards(mapped);
        } catch (error) {
            console.error('Error fetching posts:', error); // Debug logging
            setCards([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const visibleCards = useMemo(() => {
        const filtered = cards.filter((card) => (visibilityTab === 'public' ? card.isPublic : !card.isPublic));

        return filtered.sort((a, b) => {
            const aTime = new Date(a.createdAt).getTime();
            const bTime = new Date(b.createdAt).getTime();
            return sortBy === 'recent' ? bTime - aTime : aTime - bTime;
        });
    }, [cards, sortBy, visibilityTab]);

    const handleTogglePrivacy = async (id) => {
        const card = cards.find((c) => c.id === id);
        if (!card) return;

        try {
            await postService.updatePost(id, {
                privacy: card.isPublic ? 'private' : 'public',
            });
            setCards((prev) => prev.map((c) => (c.id === id ? { ...c, isPublic: !c.isPublic } : c)));
        } catch (_) {
            // Fallback: toggle locally
            setCards((prev) => prev.map((c) => (c.id === id ? { ...c, isPublic: !c.isPublic } : c)));
        }
    };

    const handleCopyLink = async (post) => {
        const link = post.link || `${window.location.origin}/#/journal/${post.id}`;
        try {
            await navigator.clipboard.writeText(link);
            console.log('Link copied to clipboard');
        } catch (error) {
            console.error('Error copying link:', error);
        }
    };

    const handleEditPost = (post) => {
        setEditingCard(post);
    };

    return (
        <JournalLayout activeNav="journal" navbarMode="title" title="My Journal">
            <JournalHeader 
                visibilityTab={visibilityTab}
                setVisibilityTab={setVisibilityTab}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />

            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" style={{ padding: '0 20px' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', gridColumn: '1 / -1' }}>
                        <Loader />
                    </div>
                ) : visibleCards.length === 0 ? (
                    <p style={{ color: '#a5abb9', padding: '40px 0', gridColumn: '1 / -1', textAlign: 'center' }}>No {visibilityTab} journal entries yet.</p>
                ) : (
                    visibleCards.map((card) => (
                        <SmallPostCard 
                            key={card.id}
                            post={card}
                            onCardClick={() => setSelectedPost(card)}
                            onEdit={handleEditPost}
                            onTogglePrivacy={handleTogglePrivacy}
                            onCopyLink={handleCopyLink}
                        />
                    ))
                )}
            </section>

            {editingCard && (
                <ComposerModal
                    mode={editingCard.image ? 'image' : 'text'}
                    onClose={() => setEditingCard(null)}
                    onPostCreated={fetchPosts}
                />
            )}

            {/* Post detail modal */}
            <PostDetailModal 
                post={selectedPost} 
                isOpen={!!selectedPost} 
                onClose={() => setSelectedPost(null)}
            />
        </JournalLayout>
    );
}
