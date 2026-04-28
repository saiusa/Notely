import React, { useRef, useState } from 'react';
import { countryOptions } from './countries';
import UserAvatar from '../common/UserAvatar';
import '../../../sass/components/profile/ProfileEditModal.scss';

export default function ProfileEditModal({ profile, onSave, onClose }) {
    const [draft, setDraft] = useState({
        ...profile,
        birthday: profile.birthday ? profile.birthday.split('T')[0] : '',
    });
    const [profilePhotoFile, setProfilePhotoFile] = useState(null);
    const [coverPhotoFile, setCoverPhotoFile] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes.

    const handleFieldChange = (field) => (event) => {
        setDraft((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));
    };

    const handlePickPhoto = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handlePickCover = () => {
        if (coverInputRef.current) {
            coverInputRef.current.click();
        }
    };

    const handlePhotoChange = (event) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError('Profile picture exceeds the 50MB limit.');
            return;
        }
        
        setError('');

        // Store the file object for upload
        setProfilePhotoFile(selectedFile);

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            setDraft((prev) => ({
                ...prev,
                profilePhoto: dataUrl,
            }));
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleCoverChange = (event) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            return;
        }

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError('Cover photo exceeds the 50MB limit.');
            return;
        }
        
        setError('');

        // Store the file object for upload
        setCoverPhotoFile(selectedFile);

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            setDraft((prev) => ({
                ...prev,
                coverPhoto: dataUrl,
            }));
        };
        reader.readAsDataURL(selectedFile);
    };

    return (
        <div className="profile-edit-modal-overlay">
            <section className="profile-edit-modal">
                <h2 className="profile-edit-modal__title">Edit Profile</h2>

                {error && (
                    <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px', marginBottom: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px' }}>
                        {error}
                    </div>
                )}

                <div className="profile-edit-modal__header-section">
                    <div className="profile-edit-modal__photo-container">
                        <UserAvatar
                            user={{
                                avatar_url: draft.profilePhoto,
                                first_name: draft.firstName,
                                last_name: draft.lastName,
                                username: draft.username,
                            }}
                            size="lg"
                            className="profile-edit-modal__photo"
                            style={{ width: undefined, height: undefined }}
                        />
                        <div className="profile-edit-modal__photo-info">
                            <h3 className="profile-edit-modal__photo-label">Profile Picture</h3>
                            <button
                                type="button"
                                onClick={handlePickPhoto}
                                className="profile-edit-modal__primary-button"
                            >
                                <span className="material-symbols-outlined profile-edit-modal__button-icon">edit</span>
                                Change
                            </button>
                        </div>
                    </div>

                    <div className="profile-edit-modal__cover-section">
                        {draft.coverPhoto && !draft.coverPhoto.startsWith('https://via.placeholder') ? (
                            <img
                                src={draft.coverPhoto}
                                alt="cover"
                                className="profile-edit-modal__cover"
                            />
                        ) : (
                            <div
                                className="profile-edit-modal__cover"
                                style={{
                                    background: 'linear-gradient(to right, #1f2937, #4c1d95)',
                                    width: '100%',
                                    height: '100%',
                                    borderTopLeftRadius: 'inherit',
                                    borderTopRightRadius: 'inherit',
                                }}
                            />
                        )}
                        <button
                            type="button"
                            onClick={handlePickCover}
                            className="profile-edit-modal__cover-button"
                        >
                            <span className="material-symbols-outlined">photo_camera</span>
                        </button>

                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCoverChange}
                            className="profile-edit-modal__hidden-input"
                        />
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="profile-edit-modal__hidden-input"
                />

                <div className="profile-edit-modal__grid">
                    <label className="profile-edit-modal__field-label">
                        First Name
                        <input
                            value={draft.firstName}
                            onChange={handleFieldChange('firstName')}
                            className="profile-edit-modal__input"
                        />
                    </label>
                    <label className="profile-edit-modal__field-label">
                        Last Name
                        <input
                            value={draft.lastName}
                            onChange={handleFieldChange('lastName')}
                            className="profile-edit-modal__input"
                        />
                    </label>
                    <label className="profile-edit-modal__field-label profile-edit-modal__field-label--with-icon">
                        Birthday
                        <span className="material-symbols-outlined profile-edit-modal__input-icon">calendar_today</span>
                        <input
                            type="date"
                            value={draft.birthday}
                            onChange={handleFieldChange('birthday')}
                            className="profile-edit-modal__input profile-edit-modal__input--icon"
                        />
                    </label>
                    <label className="profile-edit-modal__field-label profile-edit-modal__field-label--with-icon">
                        Country
                        <span className="material-symbols-outlined profile-edit-modal__input-icon">public</span>
                        <select
                            value={draft.country}
                            onChange={handleFieldChange('country')}
                            className="profile-edit-modal__input profile-edit-modal__input--icon"
                        >
                            {countryOptions.map((country) => (
                                <option key={country.value} value={country.value} className="profile-edit-modal__option">
                                    {country.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="profile-edit-modal__field-label profile-edit-modal__field-label--single-column profile-edit-modal__field-label--with-icon">
                        Gender
                        <span className="material-symbols-outlined profile-edit-modal__input-icon">person</span>
                        <select
                            value={draft.gender}
                            onChange={handleFieldChange('gender')}
                            className="profile-edit-modal__input profile-edit-modal__input--icon"
                        >
                            <option className="profile-edit-modal__option" value="Male">
                                Male
                            </option>
                            <option className="profile-edit-modal__option" value="Female">
                                Female
                            </option>
                            <option className="profile-edit-modal__option" value="Non-binary">
                                Non-binary
                            </option>
                            <option className="profile-edit-modal__option" value="Prefer not to say">
                                Prefer not to say
                            </option>
                        </select>
                    </label>
                </div>

                <label className="profile-edit-modal__description-label">
                    Description
                    <textarea
                        value={draft.description}
                        onChange={handleFieldChange('description')}
                        className="profile-edit-modal__textarea"
                    />
                </label>

                <div className="profile-edit-modal__actions">
                    <button type="button" onClick={onClose} className="profile-edit-modal__cancel-button">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onSave(draft, profilePhotoFile, coverPhotoFile)}
                        className="profile-edit-modal__save-button"
                    >
                        Save
                    </button>
                </div>
            </section>
        </div>
    );
}
