import React from 'react';
import { Link } from 'react-router-dom';
import { getFullImageUrl } from '../../utils/imageUrl';

export default function RecentJournalCard({ post }) {
    return (
        <article className="post-card__recent-item">
            <div className="post-card__recent-header">
                <Link to={`/profile/${post.user?.username || post.username || ''}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <img
                        src={post.avatar || post.user?.profile?.profile_picture || ''}
                        alt={post.user?.username || post.username || ''}
                        className="post-card__recent-avatar"
                    />
                </Link>
                <Link to={`/profile/${post.user?.username || post.username || ''}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <p className="post-card__recent-meta">
                        {post.user?.username || post.username || ''} • {post.time || post.created_at || ''}
                    </p>
                </Link>
            </div>

            <div className="post-card__recent-body">
                <p className="post-card__recent-text">{post.body || post.content || ''}</p>
                {post.image && (
                    <img
                        src={getFullImageUrl(post.image)}
                        alt="journal"
                        className="post-card__recent-image"
                    />
                )}
            </div>
        </article>
    );
}
