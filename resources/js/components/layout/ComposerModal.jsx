import React, { useEffect, useMemo, useRef, useState } from 'react';
import { moodOptions } from './moodOptions';
import postService from '../../services/postService';
import UserAvatar from '../common/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { generateAnonymousName } from '../../utils/anonymousNameGenerator';
import api from '../../services/api';

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
    community,
    embedded = false,
    initialPost = null,  // Unified prop: null for create, full post object for edit
    myCommunities = []
}) {
    const { user } = useAuth();

    // Determine if we're in edit mode
    const isEditing = !!initialPost;

    const config = modeConfig[mode] || modeConfig.text;
    const [isMoodOpen, setIsMoodOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isDestMenuOpen, setIsDestMenuOpen] = useState(false);

    // Pre-populate state from initialPost if editing
    const [selectedMoodId, setSelectedMoodId] = useState(
        isEditing && initialPost?.mood_id ? initialPost.mood_id : null
    );
    const [isAnonymous, setIsAnonymous] = useState(
        isEditing && initialPost?.is_anonymous ? initialPost.is_anonymous : false
    );
    const [anonymousName, setAnonymousName] = useState(
        isEditing && initialPost?.anonymous_name ? initialPost.anonymous_name : generateAnonymousName()
    );
    const [destination, setDestination] = useState(() => {
        if (isEditing && initialPost) {
            if (initialPost.community_id) {
                return `community_${initialPost.community_id}`;
            }
            return initialPost.privacy === 'private' ? 'journal_private' : 'journal_public';
        }
        // Use user's default privacy setting or communityId if specified
        if (communityId) {
            return `community_${communityId}`;
        }
        const defaultPrivacy = user?.setting?.default_post_privacy || 'public';
        return defaultPrivacy === 'private' ? 'journal_private' : 'journal_public';
    });
    const [title, setTitle] = useState(
        isEditing && initialPost?.title ? initialPost.title : ''
    );
    const [body, setBody] = useState(
        isEditing && initialPost?.content ? initialPost.content : ''
    );
    const [tags, setTags] = useState(
        isEditing && initialPost?.hashtags
            ? initialPost.hashtags.map((t) => (typeof t === 'string' ? t : `#${t.name}`)).join(', ')
            : ''
    );
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(
        isEditing && initialPost?.image ? initialPost.image : null
    );
    const fileInputRef = useRef(null);
    const settingsRef = useRef(null);
    const destMenuRef = useRef(null);

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

    // Handle click outside to close settings menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setIsSettingsOpen(false);
            }
        };

        if (isSettingsOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isSettingsOpen]);

    // Handle click outside to close destination menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (destMenuRef.current && !destMenuRef.current.contains(event.target)) {
                setIsDestMenuOpen(false);
            }
        };

        if (isDestMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isDestMenuOpen]);

    const handlePost = async () => {
        // Validate mood selection
        if (!selectedMoodId) {
            setError('Please select a mood.');
            return;
        }

        // Validate based on post type
        if (mode === 'quote') {
            if (!body.trim()) {
                setError('Please write a quote.');
                return;
            }
        } else if (mode === 'image') {
            if (!image && !imagePreview) {
                setError('Please select an image.');
                return;
            }
            if (!body.trim()) {
                setError('Please add a caption for your image.');
                return;
            }
        } else if (mode === 'text') {
            // For text posts, either title or body is required
            if (!title.trim() && !body.trim()) {
                setError('Please add a title or content to your post.');
                return;
            }
        }

        setPosting(true);
        setError('');

        try {
            // Parse hashtags from comma/space separated string
            const hashtags = tags
                .split(/[,\s]+/)
                .map((t) => t.replace(/^#/, '').trim())
                .filter(Boolean);

            // Build FormData for potential file uploads
            const formData = new FormData();
            formData.append('content', body);
            formData.append('type', mode);
            
            // Only append title for text posts if it has actual content
            if (mode === 'text' && title && title.trim() !== '' && title !== 'null') {
                formData.append('title', title);
            }

            formData.append('mood_id', selectedMood.mood_id);
            formData.append('is_anonymous', isAnonymous ? 1 : 0);

            // Append anonymous_name only if posting anonymously
            if (isAnonymous && anonymousName) {
                formData.append('anonymous_name', anonymousName);
            }

            // Extract community_id from destination if applicable
            let postCommunityId = null;
            let postPrivacy = 'public';

            if (destination.startsWith('community_')) {
                postCommunityId = parseInt(destination.split('_')[1], 10);
                postPrivacy = 'public'; // Community posts are always public
            } else if (destination === 'journal_private') {
                postPrivacy = 'private';
            } else if (destination === 'journal_public') {
                postPrivacy = 'public';
            }

            // Set privacy based on destination
            formData.append('privacy', postPrivacy);

            // explicitly include community_id if we have one
            if (postCommunityId) {
                formData.append('community_id', postCommunityId);
            }

            // Add hashtags as array
            if (hashtags.length > 0) {
                hashtags.forEach((tag, idx) => {
                    formData.append(`hashtags[${idx}]`, tag);
                });
            }

            // Add image file if present and a new image was selected
            // CRITICAL: Only append the file if we are in image mode AND a file is selected
            if (mode === 'image' && image) {
                formData.append('image', image);
            }

            // Send request (create or update)
            const requestConfig = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            let requestPromise;
            if (isEditing && initialPost) {
                // Update existing post
                const postId = initialPost.post_id || initialPost.id;
                formData.append('_method', 'PUT'); // Method spoofing for Laravel
                requestPromise = api.post(`/posts/${postId}`, formData, requestConfig);
            } else {
                // Create new post
                requestPromise = api.post('/posts', formData, requestConfig);
            }

            requestPromise
                .then((res) => {
                    const result = res.data || res;
                    if (onPostCreated) {
                        onPostCreated(result, destination);
                    }
                    onClose();
                })
                .catch((err) => {
                    const msg = err.response?.data?.message || (isEditing ? 'Failed to update post.' : 'Failed to create post.');
                    setError(msg);
                })
                .finally(() => {
                    setPosting(false);
                });

        } catch (err) {
            console.error('Error preparing form data:', err);
            setError('An unexpected error occurred.');
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

        const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes.
        // Validate file size (max 50MB)
        if (file.size > MAX_FILE_SIZE) {
            setError('Image exceeds the 50MB limit.');
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

    // Helper to get destination display text and icon
    const getDestinationDisplay = () => {
        if (destination === 'journal_public') {
            return { icon: 'public', label: 'Public (Explore)' };
        } else if (destination === 'journal_private') {
            return { icon: 'lock', label: 'Private (Only Me)' };
        } else if (destination.startsWith('community_')) {
            const communityId = parseInt(destination.split('_')[1], 10);
            const community = myCommunities.find(c => (c.id || c.community_id) === communityId);
            return { icon: 'group', label: community?.name || 'Community' };
        }
        return { icon: 'public', label: 'Public (Explore)' };
    };

    return (
        <div className={wrapperClassName}>
            <section className={sectionClassName}>
                {/* Top Header Section with Avatar, Name, Pill, and Floating Settings */}
                {!community && (
                    <div className="composer-modal__top-header">
                        {/* Avatar and User Info */}
                        <div className="flex-shrink-0">
                            <UserAvatar
                                user={user}
                                size="sm"
                                className="composer-modal__avatar"
                                style={{ width: undefined, height: undefined }}
                            />
                        </div>

                        {/* Name and Destination Pill */}
                        <div className="composer-modal__user-info">
                            <span className="composer-modal__username">
                                {user?.username || 'User'}
                            </span>

                            {/* Destination Pill Button */}
                            <div className="composer-modal__destination-wrapper" ref={destMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsDestMenuOpen(!isDestMenuOpen)}
                                    className="composer-modal__destination-pill"
                                >
                                    <span className="material-symbols-outlined">
                                        {getDestinationDisplay().icon}
                                    </span>
                                    {getDestinationDisplay().label}
                                    <span className="material-symbols-outlined composer-modal__pill-arrow">arrow_drop_down</span>
                                </button>

                                {/* Destination Dropdown Menu */}
                                {isDestMenuOpen && (
                                    <div className="composer-modal__destination-menu">
                                        {/* Journal Options - No Header */}
                                        <div className="composer-modal__menu-group composer-modal__menu-group--standalone">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDestination('journal_public');
                                                    setIsDestMenuOpen(false);
                                                }}
                                                className={`composer-modal__menu-item ${destination === 'journal_public' ? 'composer-modal__menu-item--active' : ''}`}
                                            >
                                                <span className="material-symbols-outlined">public</span>
                                                <span>Public (Explore)</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setDestination('journal_private');
                                                    setIsDestMenuOpen(false);
                                                }}
                                                className={`composer-modal__menu-item ${destination === 'journal_private' ? 'composer-modal__menu-item--active' : ''}`}
                                            >
                                                <span className="material-symbols-outlined">lock</span>
                                                <span>Private (Only Me)</span>
                                            </button>
                                        </div>

                                        {/* Communities Group */}
                                        {myCommunities && myCommunities.length > 0 && (
                                            <div className="composer-modal__menu-group">
                                                <div className="composer-modal__menu-header">Communities</div>
                                                <div className="composer-modal__menu-scroll">
                                                    {myCommunities.map((c) => (
                                                        <button
                                                            key={c.id || c.community_id}
                                                            type="button"
                                                            onClick={() => {
                                                                setDestination(`community_${c.id || c.community_id}`);
                                                                setIsDestMenuOpen(false);
                                                            }}
                                                            className={`composer-modal__menu-item ${destination === `community_${c.id || c.community_id}` ? 'composer-modal__menu-item--active' : ''}`}
                                                        >
                                                            <span className="material-symbols-outlined">group</span>
                                                            <span>{c.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Floating Settings Button */}
                        <button
                            type="button"
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className="composer-modal__settings-btn"
                            aria-label="Post settings"
                        >
                            <span className="material-symbols-outlined">more_vert</span>
                        </button>

                        {/* Settings Dropdown */}
                        {isSettingsOpen && (
                            <div ref={settingsRef} className="composer-modal__settings-menu">
                                <button
                                    type="button"
                                    onClick={() => setIsAnonymous((prev) => !prev)}
                                    className="composer-modal__settings-item"
                                >
                                    <span>Make it anonymous</span>
                                    <div className="composer-modal__toggle">
                                        <div className={`composer-modal__toggle-track ${isAnonymous ? 'composer-modal__toggle-track--on' : ''}`}>
                                            <div className={`composer-modal__toggle-thumb ${isAnonymous ? 'composer-modal__toggle-thumb--on' : ''}`} />
                                        </div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Community Context Badge */}
                {community && (
                    <div className="composer-modal__community-badge">
                        <span className="material-symbols-outlined">group</span>
                        <span>Posting in: <strong>{community.name}</strong></span>
                    </div>
                )}

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
                                rows={3}
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
                </div>

                {mode === 'image' && (
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="composer-modal__file-input"
                            aria-label="Upload image file"
                        />
                        {imagePreview ? (
                            <div className="composer-modal__image-preview-container">
                                <img src={imagePreview} alt="Preview" className="composer-modal__image-preview" />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    disabled={posting}
                                    className="composer-modal__image-remove-btn"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleImageUploadClick}
                                disabled={posting}
                                className="composer-modal__image-uploader"
                            >
                                <span className="material-symbols-outlined">
                                    {posting ? 'hourglass_empty' : 'image'}
                                </span>
                                <span>{posting ? 'Uploading...' : 'Upload image'}</span>
                            </button>
                        )}
                    </>
                )}

                {error && (
                    <div className="composer-modal__error-message">
                        {error}
                    </div>
                )}

                {/* Community Rules Reminder */}
                {community && community.rules && community.rules.length > 0 && (
                    <div className="composer-modal__rules-reminder">
                        <span className="material-symbols-outlined">info</span>
                        <span>Please follow the <strong>community rules</strong> when posting</span>
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
                            '--mood-bg': selectedMood ? selectedMood.backgroundColor : '#666a75',
                            '--mood-text': selectedMood ? selectedMood.textColor : '#ffffff',
                        }}
                    >
                        {selectedMood ? selectedMood.label : 'Mood'}
                        <span className="material-symbols-outlined">keyboard_arrow_down</span>
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
                                        className={`composer-modal__mood-option ${selectedMoodId === option.id
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
                    <button type="button" onClick={onClose} className="composer-modal__cancel-btn" disabled={posting}>
                        Cancel
                    </button>
                    <button type="button" onClick={handlePost} className="composer-modal__post-btn" disabled={posting}>
                        {posting ? (isEditing ? 'Updating...' : 'Posting...') : (isEditing ? 'Update Post' : 'Post')}
                    </button>
                </div>
            </section>
        </div>
    );
}
