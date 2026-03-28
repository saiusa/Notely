import '../../sass/pages/JournalPage.scss';
import React, { useMemo, useState } from 'react';
import JournalCard from '../components/journal/JournalCard';
import ComposerModal from '../components/layout/ComposerModal';
import SocialLayout from '../components/layout/SocialLayout';
import { journalCards } from '../utils/socialMockData';

export default function JournalPage() {
    const [visibilityTab, setVisibilityTab] = useState('private');
    const [sortBy, setSortBy] = useState('recent');
    const [filterOpen, setFilterOpen] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [cards, setCards] = useState(() =>
        journalCards.concat(journalCards).map((card, index) => ({
            ...card,
            id: `${card.id}-${index}`,
            isPublic: typeof card.isPublic === 'boolean' ? card.isPublic : index % 2 === 0,
            createdAt:
                card.createdAt ||
                `2026-03-21T${String(8 + index).padStart(2, '0')}:${index % 2 ? '30' : '00'}:00Z`,
        }))
    );

    const visibleCards = useMemo(() => {
        const filtered = cards.filter((card) => (visibilityTab === 'public' ? card.isPublic : !card.isPublic));

        return filtered.sort((a, b) => {
            const aTime = new Date(a.createdAt).getTime();
            const bTime = new Date(b.createdAt).getTime();
            return sortBy === 'recent' ? bTime - aTime : aTime - bTime;
        });
    }, [cards, sortBy, visibilityTab]);

    const handleTogglePrivacy = (id) => {
        setCards((prev) => prev.map((card) => (card.id === id ? { ...card, isPublic: !card.isPublic } : card)));
    };

    const handleCopyLink = async (card) => {
        const link = card.link || `${window.location.origin}/#/journal/${card.id}`;
        try {
            await navigator.clipboard.writeText(link);
        } catch (error) {
            // no-op UI for now
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
                {visibleCards.map((card) => (
                    <JournalCard
                        key={card.id}
                        card={card}
                        isPublicView={visibilityTab === 'public'}
                        onEdit={setEditingCard}
                        onTogglePrivacy={handleTogglePrivacy}
                        onCopyLink={handleCopyLink}
                    />
                ))}
            </section>

            {editingCard && (
                <ComposerModal
                    mode={editingCard.image ? 'image' : 'text'}
                    onClose={() => setEditingCard(null)}
                />
            )}
        </SocialLayout>
    );
}
