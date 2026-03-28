import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SocialLayout from '../layout/SocialLayout';
import PostCard from '../posts/PostCard';
import ProfileCommunityPanel from './ProfileCommunityPanel';
import { getPublicJournalPosts } from './ProfileUser';
import { journalCards, profileCommunities } from '../../utils/socialMockData';
import '../../../sass/components/profile/ProfilePosts.scss';

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
            <div className="profile-posts-layout">
                <section className="profile-posts-layout__main">
                    <div className="profile-posts-layout__header">
                        <h2 className="profile-posts-layout__title">Post</h2>
                        <div className="profile-posts-layout__filter-wrap">
                            <button
                                type="button"
                                onClick={() => setFilterOpen((prev) => !prev)}
                                className="profile-posts-layout__filter-toggle"
                                aria-label="Filter public posts"
                            >
                                <span className="material-symbols-outlined profile-posts-layout__filter-icon">tune</span>
                            </button>

                            {filterOpen ? (
                                <div className="profile-posts-layout__filter-menu">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSortBy('recent');
                                            setFilterOpen(false);
                                        }}
                                        className="profile-posts-layout__filter-item"
                                    >
                                        Most Recent
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSortBy('oldest');
                                            setFilterOpen(false);
                                        }}
                                        className="profile-posts-layout__filter-item"
                                    >
                                        Oldest
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="profile-posts-layout__list">
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
