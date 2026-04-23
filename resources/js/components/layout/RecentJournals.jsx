import React, { useEffect, useState } from 'react';
import { formatRelativeTime } from '../../utils/timeFormatter';
import { getFullImageUrl } from '../../utils/imageUrl';
import api from '../../services/api';
import postService from '../../services/postService';
import CommentFloatingModal from '../posts/comments/CommentFloatingModal';
import '../../../sass/components/layout/RecentJournals.scss';

/**
 * Helper function to extract clean journal text from body
 * Removes backend formatting like user handles and timestamps
 * Example: "aisso7 • 2026-04-20T05:47:07.000000Z\nsomi ma gurl" → "somi ma gurl"
 */
function extractCleanJournalText(bodyText) {
  if (!bodyText) return '';

  // Split by newline and filter out lines that look like timestamps or user info
  const lines = bodyText.split('\n').filter(line => {
    // Skip lines that are just usernames with timestamps
    const isMetadata = /^\w+\s*•\s*\d{4}-\d{2}-\d{2}/.test(line.trim());
    return !isMetadata && line.trim().length > 0;
  });

  // Join remaining lines and truncate for preview
  return lines.join(' ').trim();
}

/**
 * Helper function to truncate text to a maximum length
 */
function truncateText(text, maxLength = 100) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

export default function RecentJournals() {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal state
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [modalComments, setModalComments] = useState([]);
  const [loadingModalComments, setLoadingModalComments] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [journalLiked, setJournalLiked] = useState(false);
  const [journalLikesCount, setJournalLikesCount] = useState(0);

  /**
   * Fetch recent journals from backend
   */
  const fetchRecentJournals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/journals/recent');
      const data = response.data || response || [];
      setJournals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch recent journals:', err);
      setError('Failed to load recent journals');
      setJournals([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch journals on mount
   */
  useEffect(() => {
    fetchRecentJournals();
  }, []);

  /**
   * Handle opening modal: fetch full post data and comments
   */
  const handleOpenJournal = async (journal) => {
    setSelectedJournal(journal);
    setIsJournalModalOpen(true);
    setJournalLiked(journal.liked_by_user || false);
    setJournalLikesCount(journal.likes_count ?? 0);

    // Fetch comments
    setLoadingModalComments(true);
    try {
      const response = await postService.getComments(journal.id || journal.post_id);
      const commentsData = response.data || response || [];
      // Normalize comments to have both 'id' and 'comment_id' for consistency
      const normalized = Array.isArray(commentsData)
        ? commentsData.map((c) => ({
            ...c,
            id: c.comment_id || c.id,
            replies: (c.replies || []).map((r) => ({
              ...r,
              id: r.comment_id || r.id,
            })),
          }))
        : [];
      setModalComments(normalized);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setModalComments([]);
    } finally {
      setLoadingModalComments(false);
    }
  };

  /**
   * Handle closing modal
   */
  const handleCloseModal = () => {
    setIsJournalModalOpen(false);
    setSelectedJournal(null);
    setModalComments([]);
    setLoadingModalComments(false);
  };

  /**
   * Handle adding a comment to the selected journal
   */
  const handleAddComment = async (commentText) => {
    if (!selectedJournal) return;
    const postId = selectedJournal.id || selectedJournal.post_id;
    try {
      const newComment = await postService.createComment(postId, commentText);
      setModalComments((prev) => [
        ...prev,
        {
          id: newComment.comment_id,
          comment_id: newComment.comment_id,
          user: {
            user_id: newComment.user_id,
            username: newComment.username,
          },
          content: commentText,
          created_at: newComment.created_at || new Date().toISOString(),
          replies: [],
          user_id: newComment.user_id,
        },
      ]);
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  /**
   * Handle adding a reply to a comment
   */
  const handleAddReply = async (parentCommentId, replyText) => {
    if (!selectedJournal) return;
    const postId = selectedJournal.id || selectedJournal.post_id;
    try {
      const newReply = await postService.createComment(postId, replyText, parentCommentId);
      setModalComments((prev) =>
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
                    user_id: newReply.user_id,
                    username: newReply.username,
                  },
                  content: replyText,
                  created_at: newReply.created_at || new Date().toISOString(),
                  user_id: newReply.user_id,
                },
              ],
            };
          }
          return comment;
        })
      );
    } catch (err) {
      console.error('Failed to add reply:', err);
    }
  };

  /**
   * Handle deleting a comment
   */
  const handleDeleteComment = async (commentId) => {
    if (!selectedJournal) return;
    const postId = selectedJournal.id || selectedJournal.post_id;
    try {
      await postService.deleteComment(postId, commentId);
      setModalComments((prev) => {
        const updated = [];
        for (const c of prev) {
          // Skip top-level comment if it matches
          if ((c.comment_id || c.id) === commentId) {
            continue;
          }
          // Remove nested reply if it matches, keep comment
          if (c.replies && c.replies.length > 0) {
            const filteredReplies = c.replies.filter(
              (r) => (r.comment_id || r.id) !== commentId
            );
            updated.push({ ...c, replies: filteredReplies });
          } else {
            updated.push(c);
          }
        }
        return updated;
      });
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  /**
   * Handle reporting a comment
   */
  const handleReportComment = (commentId) => {
    // For now, just log - in a full implementation, open a report modal
    console.log('Report comment:', commentId);
  };

  /**
   * Handle submitting an edit to a comment
   */
  const handleSubmitEditComment = async (commentId, newContent) => {
    if (!selectedJournal) return;
    const postId = selectedJournal.id || selectedJournal.post_id;
    try {
      await postService.updateComment(postId, commentId, newContent);
      setModalComments((prev) =>
        prev.map((c) => {
          // Update top-level comment
          if ((c.comment_id || c.id) === commentId) {
            return { ...c, content: newContent };
          }
          // Update nested reply inside this comment
          if (c.replies && c.replies.length > 0) {
            return {
              ...c,
              replies: c.replies.map((r) => {
                if ((r.comment_id || r.id) === commentId) {
                  return { ...r, content: newContent };
                }
                return r;
              }),
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Failed to update comment:', err);
    }
  };

  /**
   * Handle liking/unliking the selected journal
   */
  const handleLikeJournal = async () => {
    if (!selectedJournal) return;
    const postId = selectedJournal.id || selectedJournal.post_id;
    try {
      if (journalLiked) {
        await postService.unlikePost(postId);
        setJournalLiked(false);
        setJournalLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        await postService.likePost(postId);
        setJournalLiked(true);
        setJournalLikesCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  /**
   * Handle sharing the selected journal
   */
  const handleShareJournal = async () => {
    if (!selectedJournal) return;
    const shareLink = `${window.location.origin}/#/post/${selectedJournal.id || selectedJournal.post_id}`;
    try {
      await navigator.clipboard.writeText(shareLink);
      console.log('Link copied to clipboard');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  return (
    <>
      <aside className="recent-journals__sidebar">
        {/* Panel */}
        <div className="recent-journals__panel">
          {/* Header */}
          <div className="recent-journals__header">
            <p className="recent-journals__label">RECENT JOURNALS</p>
          </div>

          {/* Content */}
          <div className="recent-journals__content">
            {error && (
              <p className="recent-journals__error">{error}</p>
            )}

            {loading ? (
              <p className="recent-journals__loading">Loading...</p>
            ) : journals.length > 0 ? (
              journals.map((entry) => {
                const username = entry.user?.username || 'Unknown';
                const userAvatar = entry.user?.profile?.profile_picture || '';
                const timestamp = entry.created_at || entry.timestamp || '';
                const bodyText = entry.content || entry.body_text || '';
                const image = entry.image || null;

                // Clean up the body text to remove metadata
                const cleanText = extractCleanJournalText(bodyText);
                const displayText = truncateText(cleanText, 100);

                return (
                  <div
                    key={entry.id || entry.post_id}
                    className="recent-journals__card"
                    onClick={() => handleOpenJournal(entry)}
                  >
                    {/* Card Header: Avatar + Info */}
                    <div className="recent-journals__card-header">
                      <img
                        src={getFullImageUrl(userAvatar) || '/storage/logo/Notely-Logo.svg'}
                        alt={username}
                        className="recent-journals__avatar"
                      />
                      <div className="recent-journals__card-info">
                        <p className="recent-journals__username">{username}</p>
                        <p className="recent-journals__timestamp">
                          {formatRelativeTime(timestamp)}
                        </p>
                      </div>
                    </div>

                    {/* Card Body: Text + Image */}
                    <div className="recent-journals__card-body">
                      <p className="recent-journals__card-text">{displayText}</p>
                      {image && (
                        <img
                          src={getFullImageUrl(image)}
                          alt="Journal entry"
                          className="recent-journals__card-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="recent-journals__empty">
                No Recent Journals yet
              </p>
            )}
          </div>
        </div>
      </aside>

      {/* Journal Modal - Displays post with comments */}
      {selectedJournal && (
        <CommentFloatingModal
          post={selectedJournal}
          comments={modalComments}
          isOpen={isJournalModalOpen}
          onClose={handleCloseModal}
          onAddComment={handleAddComment}
          onAddReply={handleAddReply}
          onDeleteComment={handleDeleteComment}
          onReportComment={handleReportComment}
          onSubmitEditComment={handleSubmitEditComment}
          onShare={handleShareJournal}
          liked={journalLiked}
          likesCount={journalLikesCount}
          loadingComments={loadingModalComments}
          onLike={handleLikeJournal}
        />
      )}
    </>
  );
}