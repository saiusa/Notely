import React, { useState } from 'react';

export default function JournalCard({
    card,
    isPublicView,
    onEdit,
    onTogglePrivacy,
    onCopyLink,
    compact = false,
}) {
    const [menuOpen, setMenuOpen] = useState(false);

    const textLimit = isPublicView ? 120 : 140;
    const body = card.text || '';
    const displayText = body.length > textLimit ? `${body.slice(0, textLimit)}...` : body;

    const cardHeightClass = isPublicView ? (compact ? 'h-[248px]' : 'h-[278px]') : compact ? 'h-[190px]' : 'h-[220px]';
    const imageClass = compact ? 'mt-2 h-[66px] w-full rounded-[4px] object-cover' : 'mt-3 h-[80px] w-[304px] rounded-[4px] object-cover';

    return (
        <article className={`flex w-full flex-col rounded-[10px] bg-[#212633] p-4 text-white ${cardHeightClass}`}>
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

            <div className="mt-2 h-[102px] overflow-hidden">
                {displayText ? <p className="text-[15px] font-normal leading-[1.45] text-[#e8ebf4]">{displayText}</p> : null}

                {card.image ? (
                    <img src={card.image} alt="journal" className={imageClass} />
                ) : null}
            </div>

            <div className="mt-1 flex items-center justify-between p-[10px]">
                <span className="rounded-full bg-[#d4ece5] px-2.5 py-0.5 text-[13px] text-[#4a4459]">
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
                    <div className="grid grid-cols-3 text-center text-[13px] text-white">
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
