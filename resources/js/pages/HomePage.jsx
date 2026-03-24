import React, { useMemo, useState } from 'react';
import ComposerModal from '../components/layout/ComposerModal';
import SocialLayout from '../components/layout/SocialLayout';
import PostCard from '../components/posts/PostCard';
import { currentUser, feedPosts, recentJournals } from '../utils/socialMockData';

export default function HomePage() {
    const [activeTab, setActiveTab] = useState('explore');
    const [selectedPostType, setSelectedPostType] = useState('text');
    const [composerMode, setComposerMode] = useState(null);
    const [recentJournalHistory, setRecentJournalHistory] = useState(
        recentJournals.filter((journal) => journal.isPublic)
    );

    const headingPosts = useMemo(() => {
        if (activeTab === 'community') {
            return feedPosts.map((post) => ({
                ...post,
                user: post.user.includes('/music-gremlin')
                    ? post.user
                    : `${post.user}/music-gremlin`,
            }));
        }
        return feedPosts;
    }, [activeTab]);

    const handleSelectComposer = (type) => {
        setSelectedPostType(type);
        setComposerMode(type);
    };

    return (
        <SocialLayout
            activeNav="home"
            navbarMode="tabs"
            activeTab={activeTab}
            onTabChange={setActiveTab}
            recentJournals={recentJournalHistory}
            onClearRecentJournals={() => setRecentJournalHistory([])}
        >
            <section className="mx-auto w-[600px] space-y-3">

                {/* Composer Selector */}
                <div className="grid grid-cols-3 gap-2 rounded-[10px] bg-[#212633] p-2">
                    {[
                        { key: 'text', icon: 'format_size' },
                        { key: 'quote', icon: 'format_quote' },
                        { key: 'image', icon: 'image' },
                    ].map((item) => (
                        <button
                            key={item.key}
                            onClick={() => handleSelectComposer(item.key)}
                            className={`flex h-[56px] items-center justify-center rounded-[8px] transition-colors ${
                                selectedPostType === item.key
                                    ? 'bg-[#2f3548] text-white'
                                    : 'text-[#d2d6e3] hover:bg-[#2f3548]'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[24px]">
                                {item.icon}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Posts */}
                {headingPosts.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        currentUserUsername={currentUser.username}
                    />
                ))}
            </section>

            {/* Composer Modal */}
            {composerMode && (
                <div className="fixed left-[260px] right-0 top-0 z-[60] flex justify-center px-4 xl:right-[400px]">
                    <ComposerModal
                        mode={composerMode}
                        onClose={() => setComposerMode(null)}
                    />
                </div>
            )}
        </SocialLayout>
    );
}