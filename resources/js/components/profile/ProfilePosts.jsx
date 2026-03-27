import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SocialLayout from '../layout/SocialLayout';
import PostCard from '../posts/PostCard';
import ProfileCommunityPanel from './ProfileCommunityPanel';
import { getPublicJournalPosts } from './ProfileUser';
import { journalCards, profileCommunities } from '../../utils/socialMockData';

function formatRelativeTime(dateInput) {
    const createdTime = new Date(dateInput).getTime();
    if (Number.isNaN(createdTime)) {
        return 'just now';
    }

    const seconds = Math.max(0, Math.floor((Date.now() - createdTime) / 1000));
    if (seconds < 60) {
        return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}

function toPostCardData(post) {
    const hashtagList = post.hashtags && post.hashtags.length > 0
        ? post.hashtags
        : ['#journal', '#daily'];

    return {
        ...post,
        user: post.user || post.username,
        body: post.text || '',
        comments: post.comments || '0',
        likes: post.likes || '0',
        hashtags: hashtagList,
        commentList: post.commentList || [],
        isOwner: true,
        time: formatRelativeTime(post.createdAt),
    };
}

export default function ProfilePostsPage() {
    const navigate = useNavigate();
    const [sortBy, setSortBy] = useState('recent');
    const [filterOpen, setFilterOpen] = useState(false);

    const publicPosts = useMemo(() => {
        return getPublicJournalPosts(journalCards)
            .map((post) => toPostCardData(post))
            .sort((a, b) => {
                const aTime = new Date(a.createdAt).getTime();
                const bTime = new Date(b.createdAt).getTime();
                return sortBy === 'recent' ? bTime - aTime : aTime - bTime;
            });
    }, [sortBy]);

    return (
        <SocialLayout
            activeNav="profile"
            navbarMode="title"
            title=""
            showBack
            onBack={() => navigate(-1)}
        >
            <div className="mx-auto mb-10 grid grid-cols-1 gap-6 xl:grid-cols-[760px_315px] xl:justify-center">
                <section className="w-full max-w-[760px]">
                    <div className="mx-auto mb-4 flex w-full max-w-[600px] items-center justify-between">
                        <h2 className="text-[24px] font-semibold leading-[1.1] text-white">Post</h2>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setFilterOpen((prev) => !prev)}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-[#b6bac6] transition-colors hover:bg-[#23283a] hover:text-white"
                                aria-label="Filter public posts"
                            >
                                <span className="material-symbols-outlined text-[20px]">tune</span>
                            </button>

                            {filterOpen ? (
                                <div className="absolute right-0 top-[44px] z-30 w-[160px] rounded-[10px] border border-[#323848] bg-[#1f2332] p-1.5 text-[13px] leading-[1.2] shadow-xl">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSortBy('recent');
                                            setFilterOpen(false);
                                        }}
                                        className="block h-8 w-full rounded px-2 text-left text-white transition-colors hover:bg-[#2a3043]"
                                    >
                                        Most Recent
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSortBy('oldest');
                                            setFilterOpen(false);
                                        }}
                                        className="block h-8 w-full rounded px-2 text-left text-white transition-colors hover:bg-[#2a3043]"
                                    >
                                        Oldest
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="mx-auto flex w-full max-w-[600px] flex-col gap-4">
                        {publicPosts.map((post) => (
                            <PostCard key={`profile-public-${post.id}`} post={post} currentUserUsername="jin.bts" />
                        ))}
                    </div>
                </section>

                <ProfileCommunityPanel communities={profileCommunities} />
            </div>
        </SocialLayout>
    );
}
