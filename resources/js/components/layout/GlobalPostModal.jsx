import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { CommentFloatingModal } from '../posts/comments';
import api from '../../services/api';

/**
 * Listens for ?postId=xxx in the URL.
 * Fetches the post and displays it in a floating modal over any page.
 */
export default function GlobalPostModal() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const postId = searchParams.get('postId');
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!postId) {
            setPost(null);
            setError(null);
            return;
        }

        let cancelled = false;
        const fetchPost = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/api/posts/${postId}`);
                if (!cancelled) setPost(response.data);
            } catch (err) {
                if (!cancelled) {
                    setError('Post not found or unavailable.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchPost();
        return () => { cancelled = true; };
    }, [postId]);

    const handleClose = () => {
        // Remove postId from URL while preserving other query params and current pathname
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('postId');
        navigate({
            pathname: location.pathname,
            search: newParams.toString()
        }, { replace: true }); // use replace to avoid polluting history
    };

    if (!postId) return null;

    // Loading and Error states
    if (loading) {
        return (
            <div className="comment-floating-modal__overlay">
                <div className="comment-floating-modal__container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                    <div className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite', fontSize: '32px', color: '#785ebf' }}>
                        progress_activity
                    </div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="comment-floating-modal__overlay" onClick={handleClose}>
                <div className="comment-floating-modal__container" style={{ padding: '40px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#4b5563', marginBottom: '16px' }}>
                        sentiment_dissatisfied
                    </span>
                    <h3 style={{ color: '#fff', marginBottom: '8px' }}>Oops!</h3>
                    <p style={{ color: '#9ca3af', marginBottom: '24px' }}>{error || 'Post could not be loaded.'}</p>
                    <button 
                        onClick={handleClose}
                        style={{ background: '#785ebf', color: '#fff', border: 'none', padding: '8px 24px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    // Since we fetched the single post, we need to handle its comments locally
    // CommentFloatingModal manages its own comment fetch if we pass it correctly
    return (
        <CommentFloatingModal
            post={post}
            comments={post.comments_list || []} // We will rely on CommentFloatingModal's internal fetch
            isOpen={true}
            onClose={handleClose}
            onAddComment={() => {}} // Local state handlers not needed globally, the modal can handle it or we ignore optimistic updates for global modal
            onAddReply={() => {}}
            onDeleteComment={() => {}}
            onReportComment={() => {}}
            onSubmitEditComment={() => {}}
            onShare={() => {}} // Could wire this to global share but basic display is priority
            liked={post.liked_by_user}
            likesCount={post.likes_count}
            loadingComments={false}
        />
    );
}
