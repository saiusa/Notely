import React, { useState } from 'react';

export default function CommentSection({ comments = [] }) {
    const [openMenuId, setOpenMenuId] = useState(null);

    if (!comments.length) {
        return (
            <div className="mt-3 rounded-[10px] border border-[#2f3446] bg-[#1d2230] px-3 py-2 text-[13px] text-[#9ca3b7]">
                No comments yet
            </div>
        );
    }

    return (
        <div className="mt-3 space-y-2 rounded-[10px] border border-[#2f3446] bg-[#1d2230] p-3">
            {comments.map((comment) => {
                const isOpen = openMenuId === comment.id;

                return (
                    <article key={comment.id} className="relative rounded-[8px] bg-[#202636] px-3 py-2">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 gap-2.5">
                                <img
                                    src={comment.avatar}
                                    alt={comment.username}
                                    className="mt-0.5 h-8 w-8 rounded-full object-cover"
                                />
                                <div className="min-w-0">
                                    <p className="truncate text-[13px] font-semibold text-[#edf0f8]">
                                        {comment.username}
                                    </p>
                                    <p className="mt-0.5 text-[13px] leading-[1.4] text-[#c7ccdc]">
                                        {comment.text}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setOpenMenuId(isOpen ? null : comment.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-full text-[#9ca3b7] transition-colors hover:bg-[#2a3043] hover:text-white"
                                aria-label="Comment options"
                            >
                                <span className="material-symbols-outlined text-[18px]">more_vert</span>
                            </button>
                        </div>

                        {isOpen && (
                            <div className="absolute right-2 top-8 z-20 w-[150px] rounded-[10px] border border-[#323848] bg-[#1f2332] p-1.5 text-[13px] shadow-xl">
                                <button
                                    type="button"
                                    className="block h-8 w-full rounded px-2 text-left text-white transition-colors hover:bg-[#2a3043]"
                                >
                                    View Profile
                                </button>
                                <button
                                    type="button"
                                    className="block h-8 w-full rounded px-2 text-left text-white transition-colors hover:bg-[#2a3043]"
                                >
                                    Report Comment
                                </button>
                            </div>
                        )}
                    </article>
                );
            })}
        </div>
    );
}
