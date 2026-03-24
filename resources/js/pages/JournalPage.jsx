import React, { useMemo, useState } from 'react';
import ComposerModal from '../components/layout/ComposerModal';
import SocialLayout from '../components/layout/SocialLayout';
import { journalCards } from '../utils/socialMockData';

function JournalCard({ card, isPublicView, onEdit, onTogglePrivacy, onCopyLink }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const textLimit = isPublicView ? 120 : 140;
    const body = card.text || '';
    const displayText = body.length > textLimit ? `${body.slice(0, textLimit)}...` : body;

    return (
        <article
            className={`flex flex-col rounded-[10px] bg-[#212633] p-5 text-white ${
                isPublicView ? 'h-[278px]' : 'h-[220px]'
            } w-[360px]`}
        >
            <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold leading-none text-[#aab0bf]">
                    {card.date}
                </p>

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="flex h-7 w-7 items-center justify-center text-[#9ca0ad] transition-colors hover:text-white"
                        aria-label="Journal options"
                    >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-8 z-30 w-[170px] rounded-[10px] border border-[#323848] bg-[#1f2332] p-1.5 text-[13px] shadow-xl">
                            <button
                                type="button"
                                onClick={() => {
                                    onEdit(card);
                                    setMenuOpen(false);
                                }}
                                className="block h-9 w-full rounded px-2 text-left text-white transition-colors hover:bg-[#2a3043]"
                            >
                                Edit Post
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onTogglePrivacy(card.id);
                                    setMenuOpen(false);
                                }}
                                className="block h-9 w-full rounded px-2 text-left text-white transition-colors hover:bg-[#2a3043]"
                            >
                                {isPublicView ? 'Change to Private' : 'Change to Public'}
                            </button>
                            {isPublicView && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onCopyLink(card);
                                        setMenuOpen(false);
                                    }}
                                    className="block h-9 w-full rounded px-2 text-left text-white transition-colors hover:bg-[#2a3043]"
                                >
                                    Copy Link
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-3 h-[108px] overflow-hidden">
                {displayText ? <p className="text-[16px] font-normal leading-[1.45] text-[#e8ebf4]">{displayText}</p> : null}

                {card.image ? (
                    <img src={card.image} alt="journal" className="mt-3 h-[80px] w-[304px] rounded-[4px] object-cover" />
                ) : null}
            </div>

            <div className="mt-1 flex items-center justify-between p-[10px]">
                <span className="rounded-full bg-[#d4ece5] px-2.5 py-0.5 text-[14px] text-[#4a4459]">
                    {card.mood}
                </span>
                <button
                    type="button"
                    onClick={() => onEdit(card)}
                    className="text-[#b6bac6] transition-colors hover:text-white"
                    aria-label="Edit journal"
                >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
            </div>

            {isPublicView && (
                <div className="mt-1 border-t border-[#303548] p-[10px]">
                    <div className="grid grid-cols-3 text-center text-[14px] text-white">
                        <button type="button" className="flex items-center justify-center gap-2 hover:text-[#9b84d8]">
                            <span className="material-symbols-outlined text-[20px]">favorite_border</span>
                            {card.likes || '77k'}
                        </button>
                        <button type="button" className="flex items-center justify-center gap-2 hover:text-[#9b84d8]">
                            <span className="material-symbols-outlined text-[20px]">chat_bubble_outline</span>
                            {card.comments || '700'}
                        </button>
                        <button type="button" className="flex items-center justify-center hover:text-[#9b84d8]">
                            <span className="material-symbols-outlined text-[20px]">share</span>
                        </button>
                    </div>
                </div>
            )}
        </article>
    );
}

export default function MyJournalPage() {
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
