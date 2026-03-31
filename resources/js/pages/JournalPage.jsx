import '../../sass/pages/JournalPage.scss';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import JournalCard from '../components/journal/JournalCard';
import ComposerModal from '../components/layout/ComposerModal';
import SocialLayout from '../components/layout/SocialLayout';
import postService from '../services/postService';

export default function JournalPage() {
    const [visibilityTab, setVisibilityTab] = useState('private');
    const [sortBy, setSortBy] = useState('recent');
    const [filterOpen, setFilterOpen] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch user's own posts from API
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await postService.getFeed();
            const allPosts = res.data || res || [];
            // Map API posts to journal card shape
            const mapped = allPosts.map((post) => ({
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
                link: `${window.location.origin}/#/post/${post.post_id || post.id}`,
            }));
            setCards(mapped);
        } catch (_) {
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

    const handleCopyLink = async (card) => {
        const link = card.link || `${window.location.origin}/#/journal/${card.id}`;
        try {
            await navigator.clipboard.writeText(link);
        } catch (_) {
            // no-op
        }
    };

    return (
        <SocialLayout activeNav="journal" navbarMode="title" title="My Journal">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex w-[220px] items-center gap-1 rounded-[10px] p-1">
                    {['private', 'public'].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setVisibilityTab(tab)}
                            className={`h-[40px] flex-1 rounded-[8px] text-[16px] capitalize transition-colors ${
                                visibilityTab === tab
                                    ? 'bg-[#212633] text-white'
                                    : 'bg-transparent text-[#c9ccda] hover:text-white'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setFilterOpen((prev) => !prev)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-[#b6bac6] transition-colors hover:bg-[#23283a] hover:text-white"
                        aria-label="Filter posts"
                    >
                        <span className="material-symbols-outlined text-[20px]">tune</span>
                    </button>

                    {filterOpen && (
                        <div className="absolute right-0 top-[44px] z-30 w-[150px] rounded-[10px] border border-[#323848] bg-[#1f2332] p-1.5 text-[13px] shadow-xl">
                            <button
                                type="button"
                                onClick={() => {
                                    setSortBy('recent');
                                    setFilterOpen(false);
                                }}
                                className="block h-8 w-full rounded px-2 text-left text-white transition-colors hover:bg-[#2a3043]"
                            >
                                Recent post
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSortBy('older');
                                    setFilterOpen(false);
                                }}
                                className="block h-8 w-full rounded px-2 text-left text-white transition-colors hover:bg-[#2a3043]"
                            >
                                Older post
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {loading ? (
                    <p style={{ color: '#a5abb9', padding: '40px 0', gridColumn: '1 / -1', textAlign: 'center' }}>Loading journals...</p>
                ) : visibleCards.length === 0 ? (
                    <p style={{ color: '#a5abb9', padding: '40px 0', gridColumn: '1 / -1', textAlign: 'center' }}>No {visibilityTab} journal entries yet.</p>
                ) : (
                    visibleCards.map((card) => (
                        <JournalCard
                            key={card.id}
                            card={card}
                            isPublicView={visibilityTab === 'public'}
                            onEdit={setEditingCard}
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
        </SocialLayout>
    );
}
