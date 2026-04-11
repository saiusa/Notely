import React, { useEffect, useMemo, useRef, useState } from 'react';
import { moodOptions } from './moodOptions';
import postService from '../../services/postService';
import '../../../sass/components/layout/ComposerModal.scss';

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

export default function ComposerModal({ 
    mode, 
    onClose, 
    onPostCreated, 
    communityId, 
    embedded = false,
    existingPost = null,
    isEditing = false
}) {
    const config = modeConfig[mode] || modeConfig.text;
    const [isMoodOpen, setIsMoodOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const [selectedMoodId, setSelectedMoodId] = useState(
        isEditing && existingPost?.mood_id ? existingPost.mood_id : null
    );
    const [privacy, setPrivacy] = useState(
        isEditing && existingPost?.privacy ? existingPost.privacy : 'public'
    );
    const [allowComments, setAllowComments] = useState(
        isEditing && existingPost?.allow_comments !== undefined ? existingPost.allow_comments : true
    );
    const [isAnonymous, setIsAnonymous] = useState(
        isEditing && existingPost?.is_anonymous ? existingPost.is_anonymous : false
    );
    const [title, setTitle] = useState(
        isEditing && existingPost?.title ? existingPost.title : ''
    );
    const [body, setBody] = useState(
        isEditing && existingPost?.content ? existingPost.content : ''
    );
    const [tags, setTags] = useState(
        isEditing && existingPost?.hashtags
            ? existingPost.hashtags.map((t) => (typeof t === 'string' ? t : `#${t.name}`)).join(', ')
            : ''
    );
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(
        isEditing && existingPost?.image ? existingPost.image : null
    );
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const selectedMood = useMemo(() => {
        return moodOptions.find((option) => option.id === selectedMoodId) || null;
    }, [selectedMoodId]);

    const wrapperClassName = embedded
        ? 'composer-modal__wrapper composer-modal__wrapper--embedded'
        : 'composer-modal__wrapper composer-modal__wrapper--modal';
    const sectionClassName = embedded
        ? 'composer-modal__section composer-modal__section--embedded'
        : 'composer-modal__section composer-modal__section--modal';

    useEffect(() => {
        if (embedded) {
            return undefined;
        }

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [embedded]);

    const handlePost = async () => {
        if (!selectedMoodId) {
            setError('Please select a mood.');
            return;
        }

        if (mode === 'image' && !image && !imagePreview) {
            setError('Please select an image.');
            return;
        }

        const content = mode === 'text'
            ? (title ? `${title}\n\n${body}` : body)
            : body;

        if (!content.trim()) {
            setError('Please write something.');
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

            let imageUrl = undefined;

            // Upload image if in image mode and new image selected
            if (mode === 'image' && image && !imagePreview) {
                setUploading(true);
                try {
                    const uploadResponse = await postService.uploadFile(image);
                    imageUrl = uploadResponse.url;
                    setUploading(false);
                } catch (uploadErr) {
                    const msg = uploadErr.response?.data?.message || 'Failed to upload image.';
                    setError(msg);
                    setPosting(false);
                    setUploading(false);
                    return;
                }
            }

            const postData = {
                content,
                mood_id: selectedMood.mood_id,
                privacy,
                allow_comments: allowComments,
                is_anonymous: isAnonymous,
                hashtags: hashtags.length > 0 ? hashtags : undefined,
                community_id: communityId || undefined,
                image: imageUrl || (isEditing ? imagePreview : undefined),
            };

            let result;
            if (isEditing && existingPost) {
                // Update existing post
                result = await postService.updatePost(existingPost.post_id || existingPost.id, postData);
            } else {
                // Create new post
                result = await postService.createPost(postData);
            }

            if (onPostCreated) {
                onPostCreated(result);
            }

            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || (isEditing ? 'Failed to update post.' : 'Failed to create post.');
            setError(msg);
        } finally {
            setPosting(false);
        }
    };

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

        setImage(file);
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

    const handleRemoveImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={wrapperClassName}>
            <section className={sectionClassName}>
                <div className="composer-modal__header">
                    <div className="composer-modal__content">
                        {mode === 'text' ? (
                            <input
                                type="text"
                                placeholder={config.header}
                                className="composer-modal__input composer-modal__input--title"
                                aria-label="Post title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        ) : null}

                        {mode === 'quote' ? (
                            <textarea
                                placeholder={config.placeholder}
                                className="composer-modal__textarea composer-modal__textarea--quote"
                                aria-label="Quote text"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                            />
                        ) : null}

                        {mode === 'image' ? (
                            <textarea
                                placeholder={config.placeholder}
                                className="composer-modal__textarea composer-modal__textarea--caption"
                                aria-label="Image caption"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                            />
                        ) : null}

                        {mode === 'text' ? (
                            <textarea
                                placeholder={config.placeholder}
                                className="composer-modal__textarea composer-modal__textarea--body"
                                aria-label="Post body"
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                            />
                        ) : null}
                    </div>
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

                    {isSettingsOpen ? (
                        <div className="composer-modal__settings-menu">
                            <button
                                type="button"
                                onClick={() => setIsPrivacyOpen((prev) => !prev)}
                                className="composer-modal__menu-item"
                            >
                                <span>Select privacy</span>
                                <span className="composer-modal__menu-item-label">
                                    <span>{privacy.charAt(0).toUpperCase() + privacy.slice(1)}</span>
                                    <span className="material-symbols-outlined">expand_more</span>
                                </span>
                            </button>

                            {isPrivacyOpen ? (
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
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            ) : null}

                            <button
                                type="button"
                                onClick={() => setAllowComments((prev) => !prev)}
                                className="composer-modal__menu-item"
                            >
                                <span>Allow comments</span>
                                <span
                                    className={`composer-modal__toggle ${
                                        allowComments ? 'composer-modal__toggle--on' : 'composer-modal__toggle--off'
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

                            <button
                                type="button"
                                onClick={() => setIsAnonymous((prev) => !prev)}
                                className="composer-modal__menu-item"
                            >
                                <span>Make it anonymous</span>
                                <span
                                    className={`composer-modal__toggle ${
                                        isAnonymous ? 'composer-modal__toggle--on' : 'composer-modal__toggle--off'
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
                    ) : null}
                </div>

                {mode === 'image' && (
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                            aria-label="Upload image file"
                        />
                        {imagePreview ? (
                            <div style={{ position: 'relative', marginTop: '16px' }}>
                                <img src={imagePreview} alt="Preview" style={{
                                    width: '100%',
                                    maxHeight: '300px',
                                    borderRadius: '10px',
                                    objectFit: 'cover',
                                }} />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    disabled={uploading}
                                    style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: 'rgba(0, 0, 0, 0.6)',
                                        border: 'none',
                                        color: '#fff',
                                        cursor: uploading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: uploading ? 0.5 : 1,
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleImageUploadClick}
                                disabled={uploading}
                                className="composer-modal__image-uploader"
                                style={{
                                    opacity: uploading ? 0.6 : 1,
                                    cursor: uploading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                <span className="material-symbols-outlined">
                                    {uploading ? 'hourglass_empty' : 'image'}
                                </span>
                                <span>{uploading ? 'Uploading...' : 'Upload image'}</span>
                            </button>
                        )}
                    </>
                )}

                {error && (
                    <div style={{ color: '#ff6b6b', fontSize: '12px', padding: '0 16px', marginBottom: '4px' }}>
                        {error}
                    </div>
                )}

                <div className="composer-modal__bottom-bar">
                    <button
                        type="button"
                        onClick={() => {
                            setIsMoodOpen((prev) => !prev);
                            setIsSettingsOpen(false);
                        }}
                        className="composer-modal__mood-btn"
                        style={{
                            backgroundColor: selectedMood ? selectedMood.backgroundColor : '#666a75',
                            color: selectedMood ? selectedMood.textColor : '#ffffff',
                        }}
                    >
                        {selectedMood ? selectedMood.label : 'Mood'}
                        <span className="material-symbols-outlined mood-icon">keyboard_arrow_down</span>
                    </button>

                    <input
                        type="text"
                        placeholder="#add tags"
                        className="composer-modal__input composer-modal__input--tags"
                        aria-label="Hashtags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                    />

                    {isMoodOpen ? (
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
                    ) : null}
                </div>

                <div className="composer-modal__actions">
                    <button type="button" onClick={onClose} className="composer-modal__cancel-btn" disabled={posting || uploading}>
                        Cancel
                    </button>
                    <button type="button" onClick={handlePost} className="composer-modal__post-btn" disabled={posting || uploading}>
                        {uploading ? 'Uploading...' : posting ? (isEditing ? 'Updating...' : 'Posting...') : (isEditing ? 'Update Post' : 'Post')}
                    </button>
                </div>
            </section>
        </div>
    );
}
