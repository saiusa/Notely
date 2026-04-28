import React, { useEffect, useMemo, useRef, useState } from 'react';
import { moodOptions } from '../../layout/moodOptions';
import postService from '../../../services/postService';
import { getFullImageUrl } from '../../../utils/imageUrl';
import '../../../../sass/components/posts/modals/EditPostModal.scss';

/**
 * EditPostModal - Type-aware post editing component
 * Renders different UIs based on post.type (text, quote, image)
 * Prevents changing post type during edit
 */
export default function EditPostModal({ 
    post,
    community = null,
    onClose,
    onPostUpdated
}) {
    // State Initialization from post object
    const [title, setTitle] = useState(post?.title || '');
    const [content, setContent] = useState(post?.content || '');
    const [selectedMoodId, setSelectedMoodId] = useState(post?.mood_id || null);
    const [privacy, setPrivacy] = useState(post?.privacy || 'public');
    const [allowComments, setAllowComments] = useState(
        post?.allow_comments !== undefined ? post.allow_comments : true
    );
    const [isAnonymous, setIsAnonymous] = useState(post?.is_anonymous || false);
    const [tags, setTags] = useState(
        post?.hashtags
            ? post.hashtags.map((t) => (typeof t === 'string' ? t : `#${t.name}`)).join(', ')
            : ''
    );

    // Image state (for image type posts)
    const [imagePreview, setImagePreview] = useState(
        post?.image ? getFullImageUrl(post.image) : null
    );
    const [newImage, setNewImage] = useState(null);
    const fileInputRef = useRef(null);

    // UI state
    const [isMoodOpen, setIsMoodOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState('');

    // Derived values
    const postType = post?.type || 'text';
    const selectedMood = useMemo(() => {
        return moodOptions.find((option) => option.id === selectedMoodId) || null;
    }, [selectedMoodId]);

    // Lock document scroll when modal opens
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    /**
     * Handle saving the edited post
     */
    const handleSavePost = async () => {
        if (!selectedMoodId) {
            setError('Please select a mood.');
            return;
        }

        // Validate content based on post type
        if (postType === 'text' && !title.trim()) {
            setError('Please add a title for your text post.');
            return;
        }

        if (!content.trim()) {
            setError('Please write something.');
            return;
        }

        if (postType === 'image' && !imagePreview) {
            setError('Please provide an image.');
            return;
        }

        setPosting(true);
        setError('');

        try {
            // Parse hashtags from comma/space separated string
            const hashtags = tags
                .split(/[,\s]+/)
                .map((t) => t.replace(/^#/, '').trim())
                .filter(Boolean);

            // Build form data for image upload support
            const formData = new FormData();
            formData.append('title', postType === 'text' ? title : null);
            formData.append('content', content);
            formData.append('mood_id', selectedMoodId);
            formData.append('privacy', privacy);
            formData.append('allow_comments', allowComments ? 1 : 0);
            formData.append('is_anonymous', isAnonymous ? 1 : 0);

            // Add hashtags as array
            if (hashtags.length > 0) {
                hashtags.forEach((tag, idx) => {
                    formData.append(`hashtags[${idx}]`, tag);
                });
            }

            // Add image if new file selected
            if (newImage) {
                formData.append('image', newImage);
            }

            // Send update request  (PUT request, FormData is auto-detected by api service)
            const result = await postService.updatePost(
                post.post_id || post.id,
                formData
            );

            if (onPostUpdated) {
                onPostUpdated(result);
            }

            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update post.';
            setError(msg);
        } finally {
            setPosting(false);
        }
    };

    /**
     * Handle file selection for image replacement
     */
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be smaller than 5MB');
            return;
        }

        setNewImage(file);
        setError('');

        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
            setImagePreview(event.target?.result);
        };
        reader.readAsDataURL(file);
    };

    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveNewImage = () => {
        setNewImage(null);
        // Reset preview to original image if available
        if (post?.image) {
            setImagePreview(getFullImageUrl(post.image));
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="edit-post-modal__wrapper">
            <section className="edit-post-modal__section">
                {/* Header: Type Badge + Community Context */}
                <div className="edit-post-modal__header-info">
                    <div className="edit-post-modal__type-badge">
                        <span className="material-symbols-outlined">
                            {postType === 'text' ? 'description' : postType === 'quote' ? 'format_quote' : 'image'}
                        </span>
                        <span>
                            Editing {postType.charAt(0).toUpperCase() + postType.slice(1)} Post
                        </span>
                    </div>

                    {community && (
                        <div className="edit-post-modal__community-badge">
                            <span className="material-symbols-outlined">group</span>
                            <span>in <strong>{community.name}</strong></span>
                        </div>
                    )}
                </div>

                <div className="edit-post-modal__content">
                    {/* TEXT POST: Title + Content */}
                    {postType === 'text' && (
                        <>
                            <input
                                type="text"
                                placeholder="Post title"
                                className="edit-post-modal__input edit-post-modal__input--title"
                                aria-label="Post title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <textarea
                                placeholder="Write your post..."
                                className="edit-post-modal__textarea edit-post-modal__textarea--body"
                                aria-label="Post content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </>
                    )}

                    {/* QUOTE POST: Styled Content Only (No Title) */}
                    {postType === 'quote' && (
                        <textarea
                            placeholder="Write your quote..."
                            className="edit-post-modal__textarea edit-post-modal__textarea--quote"
                            aria-label="Quote content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                fontStyle: 'italic',
                                textAlign: 'center',
                                lineHeight: '1.6',
                                color: '#e8e8e8',
                            }}
                        />
                    )}

                    {/* IMAGE POST: Caption + Image Preview (No Title) */}
                    {postType === 'image' && (
                        <>
                            <textarea
                                placeholder="Write a caption..."
                                className="edit-post-modal__textarea edit-post-modal__textarea--caption"
                                aria-label="Image caption"
                                rows={3}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />

                            {/* Image Preview and Upload Section */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                                aria-label="Upload new image"
                            />

                            {imagePreview ? (
                                <div className="edit-post-modal__image-container">
                                    <img
                                        src={imagePreview}
                                        alt="Post image"
                                        className="edit-post-modal__image"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleImageUploadClick}
                                        disabled={posting}
                                        className="edit-post-modal__image-replace-btn"
                                        title="Replace image"
                                    >
                                        <span className="material-symbols-outlined">
                                            add_a_photo
                                        </span>
                                    </button>
                                    {newImage && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveNewImage}
                                            disabled={posting}
                                            className="edit-post-modal__image-revert-btn"
                                            title="Revert to original"
                                        >
                                            <span className="material-symbols-outlined">
                                                undo
                                            </span>
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleImageUploadClick}
                                    disabled={posting}
                                    className="edit-post-modal__image-uploader"
                                >
                                    <span className="material-symbols-outlined">
                                        image
                                    </span>
                                    <span>Upload image</span>
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Settings Menu */}
                <div className="edit-post-modal__settings-section">
                    <button
                        type="button"
                        onClick={() => {
                            setIsSettingsOpen((prev) => !prev);
                            setIsMoodOpen(false);
                        }}
                        className="edit-post-modal__settings-btn material-symbols-outlined"
                        aria-label="Post settings"
                    >
                        more_vert
                    </button>

                    {isSettingsOpen && (
                        <div className="edit-post-modal__settings-menu">
                            {/* Privacy Setting */}
                            <button
                                type="button"
                                onClick={() => setIsPrivacyOpen((prev) => !prev)}
                                className="edit-post-modal__menu-item"
                            >
                                <span>Privacy</span>
                                <span className="edit-post-modal__menu-item-label">
                                    <span>{privacy.charAt(0).toUpperCase() + privacy.slice(1)}</span>
                                    <span className="material-symbols-outlined">expand_more</span>
                                </span>
                            </button>

                            {isPrivacyOpen && (
                                <div className="edit-post-modal__privacy-options">
                                    {['public', 'private'].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => {
                                                setPrivacy(option);
                                                setIsPrivacyOpen(false);
                                            }}
                                            className={`edit-post-modal__privacy-btn ${
                                                privacy === option
                                                    ? 'edit-post-modal__privacy-btn--active'
                                                    : 'edit-post-modal__privacy-btn--inactive'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined">
                                                {option === 'public' ? 'public' : 'lock'}
                                            </span>
                                            <span>
                                                {option === 'public' ? 'Public' : 'Private'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Comments Toggle */}
                            <button
                                type="button"
                                onClick={() => setAllowComments((prev) => !prev)}
                                className="edit-post-modal__menu-item"
                            >
                                <span>Allow comments</span>
                                <span
                                    className={`edit-post-modal__toggle ${
                                        allowComments
                                            ? 'edit-post-modal__toggle--on'
                                            : 'edit-post-modal__toggle--off'
                                    }`}
                                >
                                    <span
                                        className={`edit-post-modal__toggle-knob ${
                                            allowComments
                                                ? 'edit-post-modal__toggle-knob--on'
                                                : 'edit-post-modal__toggle-knob--off'
                                        }`}
                                    />
                                </span>
                            </button>

                            {/* Anonymous Toggle */}
                            <button
                                type="button"
                                onClick={() => setIsAnonymous((prev) => !prev)}
                                className="edit-post-modal__menu-item"
                            >
                                <span>Make it anonymous</span>
                                <span
                                    className={`edit-post-modal__toggle ${
                                        isAnonymous
                                            ? 'edit-post-modal__toggle--on'
                                            : 'edit-post-modal__toggle--off'
                                    }`}
                                >
                                    <span
                                        className={`edit-post-modal__toggle-knob ${
                                            isAnonymous
                                                ? 'edit-post-modal__toggle-knob--on'
                                                : 'edit-post-modal__toggle-knob--off'
                                        }`}
                                    />
                                </span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Mood and Tags Footer */}
                <div className="edit-post-modal__footer">
                    <button
                        type="button"
                        onClick={() => {
                            setIsMoodOpen((prev) => !prev);
                            setIsSettingsOpen(false);
                        }}
                        className="edit-post-modal__mood-btn"
                        style={{
                            backgroundColor: selectedMood
                                ? selectedMood.backgroundColor
                                : '#666a75',
                            color: selectedMood ? selectedMood.textColor : '#ffffff',
                        }}
                    >
                        {selectedMood ? selectedMood.label : 'Mood'}
                        <span className="material-symbols-outlined">keyboard_arrow_down</span>
                    </button>

                    <input
                        type="text"
                        placeholder="#add tags"
                        className="edit-post-modal__input edit-post-modal__input--tags"
                        aria-label="Hashtags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />

                    {isMoodOpen && (
                        <div className="edit-post-modal__mood-dropdown">
                            <div className="edit-post-modal__mood-dropdown-content">
                                {moodOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedMoodId(option.id);
                                            setIsMoodOpen(false);
                                        }}
                                        className={`edit-post-modal__mood-option ${
                                            selectedMoodId === option.id
                                                ? 'edit-post-modal__mood-option--active'
                                                : ''
                                        }`}
                                    >
                                        <span className="mood-emoji">{option.emoji}</span>
                                        <span className="mood-label">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="edit-post-modal__error">
                        {error}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="edit-post-modal__actions">
                    <button
                        type="button"
                        onClick={onClose}
                        className="edit-post-modal__cancel-btn"
                        disabled={posting}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSavePost}
                        className="edit-post-modal__save-btn"
                        disabled={posting}
                    >
                        {posting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </section>
        </div>
    );
}
