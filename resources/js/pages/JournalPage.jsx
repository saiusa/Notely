import '../../sass/pages/JournalPage.scss';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import JournalHeader from '../components/journal/JournalHeader';
import JournalEntryCard from '../components/journal/JournalEntryCard';
import { CommentFloatingModal } from '../components/posts/comments';
import ComposerModal from '../components/layout/ComposerModal';
import JournalLayout from '../components/layout/JournalLayout';
import Loader from '../components/common/Loader';
import postService from '../services/postService';

export default function JournalPage() {
    const { user } = useAuth();
    const { tab } = useParams();
    const navigate = useNavigate();
    // Set default to 'private' if no tab provided (shouldn't happen due to redirect, but safety check)
    const [visibilityTab, setVisibilityTab] = useState(tab === 'public' ? 'public' : 'private');
    const [sortBy, setSortBy] = useState('recent');
    const [editingCard, setEditingCard] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showComments, setShowComments] = useState(false);
    const [localComments, setLocalComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [reacted, setReacted] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    // Update visibilityTab when URL tab param changes
    useEffect(() => {
        setVisibilityTab(tab === 'public' ? 'public' : 'private');
    }, [tab]);

    // Whenever tab state changes, update URL
    const handleTabChange = (newTab) => {
        setVisibilityTab(newTab);
        navigate(`/journal/${newTab}`);
    };

    // Fetch user's own posts from API
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch based on visibility tab
            let res;
            if (visibilityTab === 'private') {
                res = await postService.getPrivatePosts();
            } else {
                res = await postService.getUserPublicPosts();
            }
            const allPosts = res.data || res || [];
            console.log(`Fetched ${visibilityTab} posts:`, allPosts);
            
            // Map API posts to journal card shape
            const mapped = allPosts.map((post) => {
                const createdTime = new Date(post.created_at);
                const now = new Date();
                const seconds = Math.max(0, Math.floor((now - createdTime) / 1000));
                let relativeTime = 'just now';
                
                if (seconds < 60) {
                    relativeTime = `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
                } else if (seconds < 3600) {
                    const minutes = Math.floor(seconds / 60);
                    relativeTime = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
                } else if (seconds < 86400) {
                    const hours = Math.floor(seconds / 3600);
                    relativeTime = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
                } else {
                    const days = Math.floor(seconds / 86400);
                    relativeTime = `${days} ${days === 1 ? 'day' : 'days'} ago`;
                }

                // Normalize mood: handle both string and object formats
                let moodValue = '';
                if (post.mood) {
                    moodValue = typeof post.mood === 'string' ? post.mood : post.mood.name || '';
                }

                return {
                    ...post, // Include all original post data for PostDetailModal
                    id: post.post_id || post.id,
                    date: createdTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                    createdAt: post.created_at || new Date().toISOString(),
                    isPublic: post.privacy === 'public',
                    body: post.content || '',
                    text: post.content || '',
                    mood: moodValue, // Normalize mood to string
                    link: `${window.location.origin}/#/post/${post.post_id || post.id}`,
                    time: relativeTime, // Relative time for SmallPostCard display
                };
            });
            console.log('Mapped posts:', mapped); // Debug logging
            setCards(mapped);
        } catch (error) {
            console.error('Error fetching posts:', error); // Debug logging
            setCards([]);
        } finally {
            setLoading(false);
        }
    }, [visibilityTab]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const visibleCards = useMemo(() => {
        // Data is already filtered by the API endpoints, no need to filter again
        return cards.sort((a, b) => {
            const aTime = new Date(a.createdAt).getTime();
            const bTime = new Date(b.createdAt).getTime();
            return sortBy === 'recent' ? bTime - aTime : aTime - bTime;
        });
    }, [cards, sortBy]);

    const handleTogglePrivacy = async (id) => {
        const card = cards.find((c) => c.id === id);
        if (!card) return;

        try {
            await postService.updatePost(id, {
                privacy: card.isPublic ? 'private' : 'public',
            });
            setCards((prev) => prev.map((c) => (c.id === id ? { ...c, isPublic: !c.isPublic } : c)));
        } catch (_) {
            // Fallback: toggle locally
            setCards((prev) => prev.map((c) => (c.id === id ? { ...c, isPublic: !c.isPublic } : c)));
        }
    };

    const handleCopyLink = async (post) => {
        const link = post.link || `${window.location.origin}/#/journal/${post.id}`;
        try {
            await navigator.clipboard.writeText(link);
            console.log('Link copied to clipboard');
        } catch (error) {
            console.error('Error copying link:', error);
        }
    };

    const handleEditPost = (post) => {
        setEditingCard(post);
    };

    // Group posts by month/year
    const groupedByMonth = useMemo(() => {
        const groups = {};
        visibleCards.forEach((card) => {
            const date = new Date(card.createdAt);
            const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            if (!groups[monthYear]) {
                groups[monthYear] = [];
            }
            groups[monthYear].push(card);
        });
        return groups;
    }, [visibleCards]);

    const handleWriteEntry = () => {
        setEditingCard({});
    };

    const handleOpenDetail = async (post) => {
        setSelectedPost(post);
        setShowComments(true);
        setLoadingComments(true);
        setReacted(post?.liked_by_user || false);
        setLikesCount(post?.likes_count ?? post?.likes ?? 0);
        
        // Load comments for the post
        try {
            const postId = post.post_id || post.id;
            const response = await postService.getComments(postId);
            const commentsData = response.data || response || [];
            const normalized = Array.isArray(commentsData) ? commentsData.map((c) => ({
                ...c,
                id: c.comment_id || c.id,
                replies: (c.replies || []).map((r) => ({
                    ...r,
                    id: r.comment_id || r.id,
                })),
            })) : [];
            setLocalComments(normalized);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
            setLocalComments([]);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleAddComment = async (commentText) => {
        if (!selectedPost) return;
        const postId = selectedPost.post_id || selectedPost.id;
        try {
            const newComment = await postService.createComment(postId, commentText);
            setLocalComments((prev) => [
                ...prev,
                {
                    id: newComment.comment_id,
                    user: {
                        user_id: user?.user_id,
                        username: user?.username,
                    },
                    content: commentText,
                    created_at: newComment.created_at || new Date().toISOString(),
                    replies: [],
                    user_id: user?.user_id,
                },
            ]);
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    const handleAddReply = async (parentCommentId, replyText) => {
        if (!selectedPost) return;
        const postId = selectedPost.post_id || selectedPost.id;
        try {
            const newReply = await postService.createComment(postId, replyText, parentCommentId);
            setLocalComments((prev) =>
                prev.map((comment) => {
                    if ((comment.comment_id || comment.id) === parentCommentId) {
                        return {
                            ...comment,
                            replies: [
                                ...(comment.replies || []),
                                {
                                    comment_id: newReply.comment_id,
                                    id: newReply.comment_id,
                                    user: {
                                        user_id: user?.user_id,
                                        username: user?.username,
                                    },
                                    content: replyText,
                                    created_at: newReply.created_at || new Date().toISOString(),
                                    user_id: user?.user_id,
                                },
                            ],
                        };
                    }
                    return comment;
                })
            );
        } catch (error) {
            console.error('Failed to add reply:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!selectedPost) return;
        const postId = selectedPost.post_id || selectedPost.id;
        try {
            await postService.deleteComment(postId, commentId);
            setLocalComments((prev) => {
                const updated = [];
                for (const c of prev) {
                    if ((c.comment_id || c.id) === commentId) {
                        continue;
                    }
                    if (c.replies && c.replies.length > 0) {
                        const filteredReplies = c.replies.filter((r) => (r.comment_id || r.id) !== commentId);
                        updated.push({ ...c, replies: filteredReplies });
                    } else {
                        updated.push(c);
                    }
                }
                return updated;
            });
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };

    const handleReportComment = (commentId) => {
        // Could implement reporting logic here
    };

    const handleSubmitEditComment = async (commentId, newContent) => {
        if (!selectedPost) return;
        const postId = selectedPost.post_id || selectedPost.id;
        try {
            await postService.updateComment(postId, commentId, newContent);
            setLocalComments((prev) =>
                prev.map((c) => {
                    if ((c.comment_id || c.id) === commentId) {
                        return { ...c, content: newContent };
                    }
                    if (c.replies && c.replies.length > 0) {
                        return {
                            ...c,
                            replies: c.replies.map((r) => {
                                if ((r.comment_id || r.id) === commentId) {
                                    return { ...r, content: newContent };
                                }
                                return r;
                            })
                        };
                    }
                    return c;
                })
            );
        } catch (error) {
            console.error('Failed to update comment:', error);
        }
    };

    const handleShare = async () => {
        if (!selectedPost) return;
        const shareLink = selectedPost.link || `${window.location.origin}/#/post/${selectedPost.post_id || selectedPost.id}`;
        try {
            await navigator.clipboard.writeText(shareLink);
        } catch (error) {
            console.error('Error copying link:', error);
        }
    };

    const sortedMonths = useMemo(() => {
        return Object.keys(groupedByMonth).sort((a, b) => {
            const dateA = new Date(a);
            const dateB = new Date(b);
            return dateB - dateA; // Most recent first
        });
    }, [groupedByMonth]);

    return (
        <JournalLayout activeNav="journal" navbarMode="title" title="My Journal">
            <JournalHeader 
                visibilityTab={visibilityTab}
                setVisibilityTab={handleTabChange}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />

            <div style={{ padding: '0 20px', maxWidth: '900px', margin: '0 auto' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                        <Loader />
                    </div>
                ) : visibleCards.length === 0 ? (
                    // Beautiful Empty State
                    <div className="journal-empty-state">
                        <span className="material-symbols-outlined journal-empty-state__icon">auto_stories</span>
                        <h3 className="journal-empty-state__title">Your digital notebook.</h3>
                        <p className="journal-empty-state__subtitle">
                            Write down your thoughts, track your moods, and reflect on your days.
                        </p>
                        <button
                            type="button"
                            onClick={handleWriteEntry}
                            className="journal-empty-state__button"
                        >
                            Write an Entry
                        </button>
                    </div>
                ) : (
                    // Timeline Layout
                    <div className="journal-timeline">
                        {sortedMonths.map((monthYear) => (
                            <div key={monthYear} className="journal-timeline__month-group">
                                {/* Month Header */}
                                <div className="journal-timeline__month-header">
                                    <div className="journal-timeline__month-dot" />
                                    <h2 className="journal-timeline__month-title">{monthYear}</h2>
                                </div>

                                {/* Month Entries */}
                                <div className="journal-timeline__entries">
                                    {groupedByMonth[monthYear].map((card) => (
                                        <JournalEntryCard
                                            key={card.id}
                                            entry={card}
                                            isPrivate={visibilityTab === 'private'}
                                            onEdit={handleEditPost}
                                            onTogglePrivacy={handleTogglePrivacy}
                                            onCopyLink={handleCopyLink}
                                            onOpenDetail={handleOpenDetail}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {editingCard && (
                <ComposerModal
                    mode={editingCard.image ? 'image' : 'text'}
                    onClose={() => setEditingCard(null)}
                    onPostCreated={fetchPosts}
                />
            )}

            {/* Comments Modal for Journal Entry */}
            <CommentFloatingModal
                post={selectedPost}
                comments={localComments}
                isOpen={showComments}
                onClose={() => {
                    setShowComments(false);
                    setSelectedPost(null);
                }}
                onAddComment={handleAddComment}
                onAddReply={handleAddReply}
                onDeleteComment={handleDeleteComment}
                onReportComment={handleReportComment}
                onSubmitEditComment={handleSubmitEditComment}
                onShare={handleShare}
                liked={reacted}
                likesCount={likesCount}
                loadingComments={loadingComments}
            />
        </JournalLayout>
    );
}
