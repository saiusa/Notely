import React, { useEffect, useMemo, useState } from 'react';
import { moodOptions } from './moodOptions';
import '../../../sass/components/layout/ComposerModal.scss';

const modeConfig = {
    text: {
        header: 'Title',
        placeholder: 'Write your story...',
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

export default function ComposerModal({ mode, onClose, embedded = false }) {
    const config = modeConfig[mode] || modeConfig.text;
    const [isMoodOpen, setIsMoodOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const [selectedMoodId, setSelectedMoodId] = useState(null);
    const [privacy, setPrivacy] = useState('public');
    const [allowComments, setAllowComments] = useState(true);
    const [isAnonymous, setIsAnonymous] = useState(false);

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
                            />
                        ) : null}

                        {mode === 'quote' ? (
                            <textarea
                                placeholder={config.placeholder}
                                className="composer-modal__textarea composer-modal__textarea--quote"
                                aria-label="Quote text"
                            />
                        ) : null}

                        {mode === 'image' ? (
                            <textarea
                                placeholder={config.placeholder}
                                className="composer-modal__textarea composer-modal__textarea--caption"
                                aria-label="Image caption"
                            />
                        ) : null}

                        {mode === 'text' ? (
                            <textarea
                                placeholder={config.placeholder}
                                className="composer-modal__textarea composer-modal__textarea--body"
                                aria-label="Post body"
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
                    <button type="button" className="composer-modal__image-uploader">
                        Upload image
                    </button>
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
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="composer-modal__actions">
                    <button type="button" onClick={onClose} className="composer-modal__cancel-btn">
                        Cancel
                    </button>
                    <button type="button" onClick={onClose} className="composer-modal__post-btn">
                        Post
                    </button>
                </div>
            </section>
        </div>
    );
}
