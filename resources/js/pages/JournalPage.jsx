import React, { useState } from 'react';
import SocialLayout from '../components/layout/SocialLayout';
import { journalCards } from '../utils/socialMockData';

function JournalCard({ card, showActions }) {
    return (
        <article className="rounded-[10px] bg-[#212633] p-3 text-white">
            <div className="flex items-start justify-between">
                <p className="text-[24px] text-[#cdd0d9]">{card.date}</p>
                <span className="material-symbols-outlined text-[18px] text-[#9ca0ad]">more_vert</span>
            </div>

            {card.text ? <p className="mt-3 text-[32px] leading-[1.45]">{card.text}</p> : null}
            {card.image ? <img src={card.image} alt="journal" className="mt-3 h-[90px] w-full rounded-[4px] object-cover" /> : null}

            <div className="mt-3 flex items-center justify-between">
                <span className="rounded-full bg-[#d4ece5] px-2 py-0.5 text-[16px] font-medium text-[#4a4459]">{card.mood}</span>
                <button type="button" className="text-[#b6bac6] hover:text-white">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
            </div>

            {showActions && (
                <div className="mt-3 grid grid-cols-3 text-center text-[20px] text-white">
                    <button type="button" className="flex items-center justify-center gap-1 hover:text-[#9b84d8]">
                        <span className="material-symbols-outlined text-[20px]">favorite</span>77k
                    </button>
                    <button type="button" className="flex items-center justify-center gap-1 hover:text-[#9b84d8]">
                        <span className="material-symbols-outlined text-[20px]">chat_bubble_outline</span>700
                    </button>
                    <button type="button" className="flex items-center justify-center hover:text-[#9b84d8]">
                        <span className="material-symbols-outlined text-[20px]">share</span>
                    </button>
                </div>
            )}
        </article>
    );
}

export default function MyJournalPage() {
    const [visibilityTab, setVisibilityTab] = useState('private');

    return (
        <SocialLayout activeNav="journal" navbarMode="title" title="My Journal">
            <div className="mb-4 flex w-[260px] rounded-[10px] bg-[#212633] p-1">
                {['private', 'public'].map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setVisibilityTab(tab)}
                        className={`h-[40px] flex-1 rounded-[8px] text-[30px] capitalize ${
                            visibilityTab === tab ? 'bg-[#2f3548] text-white' : 'text-[#c9ccda] hover:bg-[#2a3042]'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {journalCards.concat(journalCards).map((card, index) => (
                    <JournalCard key={`${card.id}-${index}`} card={card} showActions={visibilityTab === 'public'} />
                ))}
            </section>
        </SocialLayout>
    );
}
