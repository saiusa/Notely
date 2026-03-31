import React, { useRef, useState } from 'react';
import { defaultProfile } from './ProfileUser';
import { countryOptions } from './countries';
import '../../../sass/components/profile/ProfileEditModal.scss';

export default function ProfileEditModal({ profile, onSave, onClose }) {
    const [draft, setDraft] = useState(profile);
    const fileInputRef = useRef(null);
    const coverInputRef = useRef(null);

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

                <div className="profile-edit-modal__header-section">
                    <div className="profile-edit-modal__photo-container">
                        <img
                            src={draft.profilePhoto || defaultProfile.profilePhoto}
                            alt="avatar"
                            className="profile-edit-modal__photo"
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
                        <img
                            src={draft.coverPhoto || defaultProfile.coverPhoto || 'https://via.placeholder.com/860x180/2a2d3a/2a2d3a?text=Cover'}
                            alt="cover"
                            className="profile-edit-modal__cover"
                        />
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
                        onClick={() => onSave(draft)}
                        className="profile-edit-modal__save-button"
                    >
                        Save
                    </button>
                </div>
            </section>
        </div>
    );
}
