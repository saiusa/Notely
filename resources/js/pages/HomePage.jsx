import React, { useMemo, useState } from 'react';
import ComposerModal from '../components/layout/ComposerModal';
import SocialLayout from '../components/layout/SocialLayout';
import PostCard from '../components/posts/PostCard';
import { currentUser, feedPosts, recentJournals } from '../utils/socialMockData';
import '../../sass/pages/HomePage.scss';

export default function HomePage() {
    const [activeTab, setActiveTab] = useState('explore');
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
            <section className="home-page__container">

                {/* Composer Selector */}
                <div className="home-page__composer-selector">
                    <div className="selector-grid">
                        {[
                            { key: 'text', icon: 'format_size' },
                            { key: 'quote', icon: 'format_quote' },
                            { key: 'image', icon: 'image' },
                        ].map((item) => (
                            <button
                                key={item.key}
                                onClick={() => handleSelectComposer(item.key)}
                                className="home-page__composer-btn"
                            >
                                <span className="material-symbols-outlined icon">
                                    {item.icon}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Posts */}
                <div className="home-page__posts">
                    {headingPosts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUserUsername={currentUser.username}
                        />
                    ))}
                </div>
            </section>

            {/* Composer Modal */}
            {composerMode && (
                <ComposerModal
                    mode={composerMode}
                    onClose={() => setComposerMode(null)}
                />
            )}
        </SocialLayout>
    );
}