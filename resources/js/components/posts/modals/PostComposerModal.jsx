import React, { useEffect, useMemo, useRef, useState } from 'react';
import { moodOptions } from '../../layout/moodOptions';
import postService from '../../../services/postService';

const modeConfig = {
    text: {
        header: 'Title',
        placeholder: 'Start writing your day...',
    },
    quote: {
        header: 'Quote',
        placeholder: 'Write a quote...',
    },
    image: {
        header: 'Caption',
        placeholder: 'Write a caption...',
    },
};

/**
 * Unified PostComposerModal Component
 * Handles both post creation (mode-based) and editing (postToEdit-based)
 * 
 * Props:
 *  - mode: 'text' | 'quote' | 'image' (only used when creating)
 *  - postToEdit: Post object to edit (null when creating)
 *  - onClose: Callback when modal is closed
 *  - onPostCreated: Callback when post is created/updated
 *  - communityId: ID of community (if posting to community)
 *  - community: Community object with name, rules, etc.
 *  - embedded: Boolean - whether modal is embedded or full-screen
 *  - isOpen: Boolean - whether modal is visible
 */
export default function PostComposerModal({
    mode = 'text',
    postToEdit = null,
    onClose,
    onPostCreated,
    communityId = null,
    community = null,
    embedded = false,
    isOpen = true
}) {
    // ============================================================================
    // MODE & EDIT STATE
    // ============================================================================
    const isEditing = !!postToEdit;
    const currentMode = isEditing ? postToEdit.type : mode;
    const config = modeConfig[currentMode] || modeConfig.text;

    // ============================================================================
    // FORM STATE
    // ============================================================================
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedMoodId, setSelectedMoodId] = useState(null);
    const [privacy, setPrivacy] = useState('public');
    const [allowComments, setAllowComments] = useState(true);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [tags, setTags] = useState('');

    // Image state
    const [newImage, setNewImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    // UI state
    const [isMoodOpen, setIsMoodOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState('');

    // ============================================================================
    // DERIVED VALUES
    // ============================================================================
    const selectedMood = useMemo(() => {
        return moodOptions.find((option) => option.id === selectedMoodId) || null;
    }, [selectedMoodId]);

    const wrapperClassName = embedded
        ? 'composer-modal__wrapper composer-modal__wrapper--embedded'
        : isEditing
        ? 'composer-modal__wrapper composer-modal__wrapper--edit-fixed'
        : 'composer-modal__wrapper composer-modal__wrapper--modal';

    const sectionClassName = embedded
        ? 'composer-modal__section composer-modal__section--embedded'
        : isEditing
        ? 'composer-modal__section composer-modal__section--edit-modal'
        : 'composer-modal__section composer-modal__section--modal';

    // ============================================================================
    // INITIALIZE/RESET STATE
    // ============================================================================
    useEffect(() => {
        if (!isOpen) return;

        if (isEditing && postToEdit) {
            // EDIT MODE: Populate from postToEdit
            setTitle(postToEdit.title || '');
            setContent(postToEdit.content || '');
            setSelectedMoodId(postToEdit.mood_id || null);
            setPrivacy(postToEdit.privacy || 'public');
            setAllowComments(
                postToEdit.allow_comments !== undefined ? postToEdit.allow_comments : true
            );
            setIsAnonymous(postToEdit.is_anonymous || false);
            setTags(
                postToEdit.hashtags
                    ? postToEdit.hashtags
                        .map((t) => (typeof t === 'string' ? t : `#${t.name}`))
                        .join(', ')
                    : ''
            );

            // Image preview for existing post
            if (postToEdit.image) {
                const imageUrl = postToEdit.image.startsWith('http')
                    ? postToEdit.image
                    : postToEdit.image.startsWith('/storage/')
                    ? postToEdit.image
                    : `/storage/${postToEdit.image}`;
                setImagePreview(imageUrl);
            } else {
                setImagePreview(null);
            }

            setNewImage(null);
            setError('');
        } else {
            // CREATE MODE: Reset to defaults
            setTitle('');
            setContent('');
            setSelectedMoodId(null);
            setPrivacy('public');
            setAllowComments(true);
            setIsAnonymous(false);
            setTags('');
            setImagePreview(null);
            setNewImage(null);
            setError('');
        }

        // Reset UI state
        setIsMoodOpen(false);
        setIsSettingsOpen(false);
        setIsPrivacyOpen(false);
    }, [isOpen, isEditing, postToEdit]);

    // Lock document scroll for modal
    useEffect(() => {
        if (isOpen && !embedded) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';

            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen, embedded]);

    // ============================================================================
    // VALIDATION & SUBMISSION
    // ============================================================================
    const validateForm = () => {
        if (!selectedMoodId) {
            setError('Please select a mood.');
            return false;
        }

        if (currentMode === 'text' && !title.trim()) {
            setError('Please add a title for your text post.');
            return false;
        }

        if (!content.trim()) {
            setError('Please write something.');
            return false;
        }

        if (currentMode === 'image' && !imagePreview) {
            setError('Please provide an image.');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setPosting(true);
        setError('');

        try {
            // Parse hashtags
            const hashtags = tags
                .split(/[,\s]+/)
                .map((t) => t.replace(/^#/, '').trim())
                .filter(Boolean);

            // Build FormData
            const formData = new FormData();

            // Append common fields
            formData.append('type', currentMode);

            if (currentMode === 'text' && title && title.trim() !== '' && title !== 'null') {
                formData.append('title', title);
            }

            formData.append('content', content);
            formData.append('mood_id', selectedMood.mood_id);
            formData.append('privacy', privacy);
            formData.append('allow_comments', allowComments ? 1 : 0);
            formData.append('is_anonymous', isAnonymous ? 1 : 0);

            if (!isEditing) {
                formData.append('community_id', communityId || '');
            }

            // Add hashtags
            if (hashtags.length > 0) {
                hashtags.forEach((tag, idx) => {
                    formData.append(`hashtags[${idx}]`, tag);
                });
            }

            // Add image if new image selected
            if (currentMode === 'image' && newImage) {
                formData.append('image', newImage);
            }

            // Send request
            let result;
            if (isEditing) {
                // PUT request for update
                result = await postService.updatePost(
                    postToEdit.post_id || postToEdit.id,
                    formData
                );
            } else {
                // POST request for create
                result = await postService.createPost(formData);
            }

            // Callback and close
            if (onPostCreated) {
                onPostCreated(result);
            }

            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || 
                (isEditing ? 'Failed to update post.' : 'Failed to create post.');
            setError(msg);
        } finally {
            setPosting(false);
        }
    };

    // ============================================================================
    // IMAGE HANDLING
    // ============================================================================
    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select a valid image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be smaller than 5MB');
            return;
        }

        setNewImage(file);
        setError('');

        const reader = new FileReader();
        reader.onload = (event) => {
            setImagePreview(event.target?.result);
        };
        reader.readAsDataURL(file);
    };

    const handleImageUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = () => {
        setNewImage(null);
        if (isEditing && postToEdit?.image) {
            // Revert to original image
            const imageUrl = postToEdit.image.startsWith('http')
                ? postToEdit.image
                : postToEdit.image.startsWith('/storage/')
                ? postToEdit.image
                : `/storage/${postToEdit.image}`;
            setImagePreview(imageUrl);
        } else {
            setImagePreview(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className={wrapperClassName}>
            <section className={sectionClassName}>
                {/* Edit Mode Header Badge */}
                {isEditing && (
                    <div className="composer-modal__header-info">
                        <div className="composer-modal__type-badge">
                            <span className="material-symbols-outlined">
                                {currentMode === 'text'
                                    ? 'description'
                                    : currentMode === 'quote'
                                    ? 'format_quote'
                                    : 'image'}
                            </span>
                            <span>
                                Editing {currentMode.charAt(0).toUpperCase() + currentMode.slice(1)} Post
                            </span>
                        </div>

                        {community && (
                            <div className="composer-modal__community-badge">
                                <span className="material-symbols-outlined">group</span>
                                <span>in <strong>{community.name}</strong></span>
                            </div>
                        )}
                    </div>
                )}

                {/* Create Mode Community Badge */}
                {!isEditing && community && (
                    <div className="composer-modal__community-badge">
                        <span className="material-symbols-outlined">group</span>
                        <span>Posting in: <strong>{community.name}</strong></span>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="composer-modal__header">
                    <div className="composer-modal__content">
                        {/* TEXT POST: Title + Body */}
                        {currentMode === 'text' && (
                            <>
                                <input
                                    type="text"
                                    placeholder={config.header}
                                    className="composer-title-input"
                                    aria-label="Post title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <textarea
                                    placeholder={config.placeholder}
                                    className="composer-body-input"
                                    aria-label="Post body"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </>
                        )}

                        {/* QUOTE POST */}
                        {currentMode === 'quote' && (
                            <textarea
                                placeholder={config.placeholder}
                                className="composer-quote-input"
                                aria-label="Quote text"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        )}

                        {/* IMAGE POST: Caption + Image Upload/Preview */}
                        {currentMode === 'image' && (
                            <>
                                <textarea
                                    placeholder={config.placeholder}
                                    className="composer-caption-input"
                                    aria-label="Image caption"
                                    rows={3}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    style={{ display: 'none' }}
                                    aria-label="Upload image file"
                                />

                                {imagePreview ? (
                                    <div style={{ position: 'relative' }} className="composer-modal__image-container">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="composer-image-preview"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleImageUploadClick}
                                            disabled={posting}
                                            className="composer-image-replace-btn"
                                            title={isEditing ? 'Replace image' : 'Change image'}
                                        >
                                            <span className="material-symbols-outlined">
                                                {isEditing ? 'add_a_photo' : 'image'}
                                            </span>
                                        </button>
                                        {newImage && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                disabled={posting}
                                                className="composer-image-revert-btn"
                                                title={isEditing ? 'Revert to original' : 'Remove image'}
                                            >
                                                <span className="material-symbols-outlined">
                                                    {isEditing ? 'undo' : 'close'}
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleImageUploadClick}
                                        disabled={posting}
                                        className="composer-image-dropzone"
                                    >
                                        <span className="material-symbols-outlined">
                                            {posting ? 'hourglass_empty' : 'image'}
                                        </span>
                                        <span>
                                            {posting
                                                ? 'Uploading...'
                                                : isEditing
                                                ? 'Upload new image'
                                                : 'Upload image'}
                                        </span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>

                    {/* Settings Button */}
                    <button
                        type="button"
                        onClick={() => {
                            setIsSettingsOpen((prev) => !prev);
                            setIsMoodOpen(false);
                        }}
                        className="composer-modal__settings-btn material-symbols-outlined"
                        aria-label="Post settings"
                    >
                        more_vert
                    </button>

                    {/* Settings Menu */}
                    {isSettingsOpen && (
                        <div className="composer-modal__settings-menu">
                            {/* Privacy */}
                            <button
                                type="button"
                                onClick={() => setIsPrivacyOpen((prev) => !prev)}
                                className="composer-modal__menu-item"
                            >
                                <span>
                                    {isEditing ? 'Privacy' : 'Select privacy'}
                                </span>
                                <span className="composer-modal__menu-item-label">
                                    <span>{privacy.charAt(0).toUpperCase() + privacy.slice(1)}</span>
                                    <span className="material-symbols-outlined">expand_more</span>
                                </span>
                            </button>

                            {isPrivacyOpen && (
                                <div className="composer-modal__privacy-options">
                                    {['public', 'private'].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => {
                                                setPrivacy(option);
                                                setIsPrivacyOpen(false);
                                            }}
                                            className={`composer-modal__privacy-btn ${
                                                privacy === option
                                                    ? 'composer-modal__privacy-btn--active'
                                                    : 'composer-modal__privacy-btn--inactive'
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

                            {/* Allow Comments */}
                            <button
                                type="button"
                                onClick={() => setAllowComments((prev) => !prev)}
                                className="composer-modal__menu-item"
                            >
                                <span>Allow comments</span>
                                <span
                                    className={`composer-modal__toggle ${
                                        allowComments
                                            ? 'composer-modal__toggle--on'
                                            : 'composer-modal__toggle--off'
                                    }`}
                                >
                                    <span
                                        className={`composer-modal__toggle-knob ${
                                            allowComments
                                                ? 'composer-modal__toggle-knob--on'
                                                : 'composer-modal__toggle-knob--off'
                                        }`}
                                    />
                                </span>
                            </button>

                            {/* Anonymous */}
                            <button
                                type="button"
                                onClick={() => setIsAnonymous((prev) => !prev)}
                                className="composer-modal__menu-item"
                            >
                                <span>Make it anonymous</span>
                                <span
                                    className={`composer-modal__toggle ${
                                        isAnonymous
                                            ? 'composer-modal__toggle--on'
                                            : 'composer-modal__toggle--off'
                                    }`}
                                >
                                    <span
                                        className={`composer-modal__toggle-knob ${
                                            isAnonymous
                                                ? 'composer-modal__toggle-knob--on'
                                                : 'composer-modal__toggle-knob--off'
                                        }`}
                                    />
                                </span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="composer-modal__error-message">
                        {error}
                    </div>
                )}

                {/* Community Rules */}
                {!isEditing && community?.rules && community.rules.length > 0 && (
                    <div className="composer-modal__rules-reminder">
                        <span className="material-symbols-outlined">info</span>
                        <span>Please follow the <strong>community rules</strong> when posting</span>
                    </div>
                )}

                {/* Mood & Tags Footer */}
                <div className="composer-modal__bottom-bar">
                    <button
                        type="button"
                        onClick={() => {
                            setIsMoodOpen((prev) => !prev);
                            setIsSettingsOpen(false);
                        }}
                        className="composer-modal__mood-btn"
                        style={{
                            backgroundColor: selectedMood
                                ? selectedMood.backgroundColor
                                : '#666a75',
                            color: selectedMood ? selectedMood.textColor : '#ffffff',
                        }}
                    >
                        {selectedMood ? selectedMood.label : 'Mood'}
                        <span className="material-symbols-outlined mood-icon">keyboard_arrow_down</span>
                    </button>

                    <input
                        type="text"
                        placeholder="#add tags"
                        className="composer-tags-input"
                        aria-label="Hashtags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />

                    {isMoodOpen && (
                        <div className="composer-modal__mood-dropdown">
                            <div className="composer-modal__mood-dropdown-content">
                                {moodOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedMoodId(option.id);
                                            setIsMoodOpen(false);
                                        }}
                                        className={`composer-modal__mood-option ${
                                            selectedMoodId === option.id
                                                ? 'composer-modal__mood-option--active'
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

                {/* Action Buttons */}
                <div className="composer-modal__actions">
                    <button
                        type="button"
                        onClick={onClose}
                        className="composer-modal__cancel-btn"
                        disabled={posting}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="composer-modal__post-btn"
                        disabled={posting}
                    >
                        {posting
                            ? isEditing
                                ? 'Saving...'
                                : 'Posting...'
                            : isEditing
                            ? 'Save Changes'
                            : 'Post'}
                    </button>
                </div>
            </section>
        </div>
    );
}
