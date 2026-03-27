import React from 'react';

export default function CommunityDetailHeader({
    community,
    isJoined,
    isMyCommunityRoute,
    showHeaderMenu,
    onToggleMenu,
    onCopyLink,
    onReport,
    onJoinToggle,
}) {
    return (
        <article className="relative overflow-hidden rounded-[10px] bg-[#212633]">
            <img src={community.coverImage} alt={community.name} className="h-[300px] w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent px-6 pb-6 pt-10">
                <div>
                    <h2 className="text-[22px] font-semibold leading-[1.1] text-white">{community.name}</h2>
                    <p className="mt-3 text-[14px] leading-[1.45] text-[#e4e7ef]">{community.description}</p>
                </div>

                <div className="ml-4 flex items-center gap-3">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={onToggleMenu}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                            aria-label="Community menu"
                        >
                            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                        </button>

                        {showHeaderMenu ? (
                            <div className="absolute right-0 top-9 z-30 w-[140px] rounded-[10px] border border-[#323848] bg-[#1f2332] p-1.5 text-[13px] shadow-xl">
                                <button
                                    type="button"
                                    onClick={onCopyLink}
                                    className="block h-8 w-full rounded px-2 text-left text-white transition-colors hover:bg-[#2a3043]"
                                >
                                    Copy link
                                </button>
                                <button
                                    type="button"
                                    onClick={onReport}
                                    className="block h-8 w-full rounded px-2 text-left text-white transition-colors hover:bg-[#2a3043]"
                                >
                                    Report
                                </button>
                            </div>
                        ) : null}
                    </div>

                    <button
                        type="button"
                        onClick={onJoinToggle}
                        className={`h-[40px] min-w-[150px] rounded-full px-6 text-[28px] font-medium text-white ${
                            isJoined ? 'bg-[#785ebf]' : 'bg-[#343b4f] hover:bg-[#46506a]'
                        }`}
                        disabled={isMyCommunityRoute}
                    >
                        {isJoined ? 'Joined' : 'Join Community'}
                    </button>
                </div>
            </div>
        </article>
    );
}
