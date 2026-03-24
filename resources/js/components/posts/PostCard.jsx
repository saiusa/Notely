import React, { useMemo, useState } from 'react';
import CommentSection from './CommentSection';

function RecentJournalCard({ post }) {
    return (
        <article className="border-b border-[#303548] py-2 last:border-b-0">
            <div className="mb-1 flex items-center gap-2">
                <img
                    src={post.avatar}
                    alt={post.user}
                    className="h-6 w-6 rounded-full object-cover"
                />
                <p className="text-[12px] text-[#b3b8c7]">
                    {post.user} • {post.time}
                </p>
            </div>

            <div className="flex items-center justify-between gap-3">
                <p className="text-[16px] leading-[1.45] text-[#e7ebf5]">{post.body}</p>
                {post.image && (
                    <img
                        src={post.image}
                        alt="journal"
                        className="h-[52px] w-[52px] rounded-[6px] object-cover"
                    />
                )}
            </div>
        </article>
    );
}

export default function PostCard({ post, compact = false, variant = 'feed', currentUserUsername = 'jin.bts' }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [reacted, setReacted] = useState(false);
    const [shared, setShared] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [commentInput, setCommentInput] = useState('');
    const [localComments, setLocalComments] = useState(post.commentList || []);

    const longTextLimit = 270;

    const ownsPost = useMemo(() => {
        if (typeof post.isOwner === 'boolean') {
            return post.isOwner;
        }
        return post.username === currentUserUsername;
    }, [currentUserUsername, post.isOwner, post.username]);

    const handleShare = async () => {
        const shareLink = post.link || `${window.location.origin}/#/post/${post.id}`;

        try {
            await navigator.clipboard.writeText(shareLink);
            setShared(true);
            setTimeout(() => setShared(false), 1600);
        } catch (error) {
            setShared(false);
        }
    };

    const bodyText = post.body || '';
    const shouldTruncate = bodyText.length > longTextLimit;
    const visibleBody = shouldTruncate && !expanded ? `${bodyText.slice(0, longTextLimit)}...` : bodyText;

    const handleAddComment = () => {
        const trimmed = commentInput.trim();

        if (!trimmed) {
            return;
        }

        setLocalComments((prev) => [
            ...prev,
            {
                id: `${post.id}-new-${Date.now()}`,
                username: currentUserUsername,
                avatar: post.avatar,
                text: trimmed,
            },
        ]);
        setCommentInput('');
    };

    if (variant === 'recent') {
        return <RecentJournalCard post={post} />;
    }

    return (
        <article className="w-full max-w-[600px] rounded-[10px] bg-[#212633] p-5 text-white">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                    <img src={post.avatar} alt={post.user} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                        <p className="text-[15px] font-semibold leading-none">{post.user}</p>
                        <p className="mt-1 text-[13px] leading-none text-[#9ca0ad]">• {post.time}</p>
                    </div>
                </div>

                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setMenuOpen((prev) => !prev)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#9095a4] transition-colors hover:bg-[#2a3043] hover:text-white"
                        aria-label="Post options"
                    >
                        <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 top-9 z-20 w-[160px] rounded-[10px] border border-[#323848] bg-[#1f2332] p-1.5 text-[13px] shadow-xl">
                            {ownsPost ? (
                                <>
                                    <button type="button" className="block h-8 w-full rounded px-2 text-left text-white transition-colors hover:bg-[#2a3043]">
                                        Edit Post
                                    </button>
                                    <button type="button" className="block h-8 w-full rounded px-2 text-left text-white transition-colors hover:bg-[#2a3043]">
                                        Change Privacy
                                    </button>
                                    <button type="button" className="block h-8 w-full rounded px-2 text-left text-[#f08b8b] transition-colors hover:bg-[#2a3043]">
                                        Delete Post
                                    </button>
                                </>
                            ) : (
                                <button type="button" className="block h-8 w-full rounded px-2 text-left text-white transition-colors hover:bg-[#2a3043]">
                                    Report Post
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {!compact && post.title && <h3 className="mt-3 text-[22px] font-semibold leading-[1.3]">{post.title}</h3>}

            <p
                className={`mt-3 whitespace-pre-line ${
                    post.quote
                        ? 'border-l-2 border-[#6750A4] pl-3 text-[22px] italic leading-[1.45]'
                        : 'text-[16px] leading-[1.55]'
                }`}
            >
                {post.quote ? `"${visibleBody}"` : visibleBody}
            </p>

            {shouldTruncate && (
                <button
                    type="button"
                    onClick={() => setExpanded((prev) => !prev)}
                    className="mt-2 text-[14px] font-medium text-[#8e74d5] transition-colors hover:text-[#a58be5]"
                >
                    {expanded ? 'Show less' : 'Show more'}
                </button>
            )}

            {post.image && <img src={post.image} alt="post media" className="mt-3 h-full max-h-[400px] w-full max-w-[560px] rounded-[6px] object-cover" />}

            <div className="mt-4 flex items-center gap-2 text-[14px] text-[#b9bdc8]">
                {post.mood && (
                    <span className="rounded-full bg-[#d4ece5] px-2 py-0.5 text-[14px] font-medium text-[#4a4459]">
                        {post.mood}
                    </span>
                )}
                {post.hashtags?.map((tag) => (
                    <span key={tag}>{tag}</span>
                ))}
            </div>

            <div className="mt-3 border-t border-[#303548] pt-3">
                <div className="grid grid-cols-3 text-center text-[12px] text-[#e8e8e8]">
                    <button
                        type="button"
                        onClick={() => setReacted((prev) => !prev)}
                        className={`flex items-center justify-center gap-1.5 transition-colors ${
                            reacted ? 'text-[#9b84d8]' : 'hover:text-[#9b84d8]'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-[20px] transition-transform ${reacted ? 'scale-110' : 'scale-100'}`}>
                            {reacted ? 'favorite' : 'favorite_border'}
                        </span>
                        {post.likes}
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowComments((prev) => !prev)}
                        className={`flex items-center justify-center gap-1.5 transition-colors ${
                            showComments ? 'text-[#9b84d8]' : 'hover:text-[#9b84d8]'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">chat_bubble_outline</span>
                        {post.comments}
                    </button>

                    <button
                        type="button"
                        onClick={handleShare}
                        className={`flex items-center justify-center gap-1.5 transition-colors ${
                            shared ? 'text-[#9b84d8]' : 'hover:text-[#9b84d8]'
                        }`}
                    >
                        <span className="material-symbols-outlined text-[20px]">share</span>
                        <span className="text-[13px]">{shared ? 'Copied' : 'Share'}</span>
                    </button>
                </div>
            </div>

            {showComments && (
                <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-2 rounded-[10px] border border-[#2f3446] bg-[#1d2230] p-2.5">
                        <input
                            value={commentInput}
                            onChange={(event) => setCommentInput(event.target.value)}
                            placeholder="Write a comment..."
                            className="w-full bg-transparent text-[14px] text-[#d4d8e6] placeholder:text-[#7e8598] focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={handleAddComment}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#9b84d8] transition-colors hover:bg-[#2a3043]"
                            aria-label="Send comment"
                        >
                            <span className="material-symbols-outlined text-[18px]">send</span>
                        </button>
                    </div>

                    <CommentSection comments={localComments} />
                </div>
            )}
        </article>
    );
}
