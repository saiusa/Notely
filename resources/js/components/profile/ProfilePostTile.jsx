import React, { useMemo } from 'react';
import PostCard from '../posts/PostCard';

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

export default function ProfilePostTile({ post }) {
    const postCardData = useMemo(
        () => ({
            ...post,
            user: post.user || post.username,
            body: post.text || '',
            comments: post.comments || '0',
            likes: post.likes || '0',
            hashtags: post.hashtags || [],
            commentList: post.commentList || [],
            isOwner: true,
            time: formatRelativeTime(post.createdAt),
        }),
        [post]
    );

    return <PostCard post={postCardData} currentUserUsername="jin.bts" />;
}
