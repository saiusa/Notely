import React, { useRef, useState } from 'react';
import { countryOptions, defaultProfile } from './ProfileUser';
import '../../../sass/components/profile/ProfileEditModal.scss';

export default function ProfileEditModal({ profile, onSave, onClose }) {
    const [draft, setDraft] = useState(profile);
    const fileInputRef = useRef(null);

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

    const handlePhotoChange = (event) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            return;
        }

        const nextPhotoUrl = URL.createObjectURL(selectedFile);
        setDraft((prev) => ({
            ...prev,
            profilePhoto: nextPhotoUrl,
        }));
    };

    const handleRemovePhoto = () => {
        setDraft((prev) => ({
            ...prev,
            profilePhoto: '',
        }));
    };

    return (
        <div className="profile-edit-modal-overlay">
            <section className="profile-edit-modal">
                <h2 className="profile-edit-modal__title">Edit Profile</h2>

                <div className="profile-edit-modal__photo-row">
                    <img
                        src={draft.profilePhoto || defaultProfile.profilePhoto}
                        alt="avatar"
                        className="profile-edit-modal__photo"
                    />

                    <div className="profile-edit-modal__photo-actions">
                        <button
                            type="button"
                            onClick={handlePickPhoto}
                            className="profile-edit-modal__outline-button"
                        >
                            <span className="material-symbols-outlined profile-edit-modal__outline-button-icon">image</span>
                            Change
                        </button>
                        <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="profile-edit-modal__outline-button"
                        >
                            <span className="material-symbols-outlined profile-edit-modal__outline-button-icon">delete</span>
                            Remove
                        </button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="profile-edit-modal__hidden-input"
                    />
                </div>

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
                    <label className="profile-edit-modal__field-label">
                        Birthday
                        <input
                            type="date"
                            value={draft.birthday}
                            onChange={handleFieldChange('birthday')}
                            className="profile-edit-modal__input"
                        />
                    </label>
                    <label className="profile-edit-modal__field-label">
                        Country
                        <select
                            value={draft.country}
                            onChange={handleFieldChange('country')}
                            className="profile-edit-modal__input"
                        >
                            {countryOptions.map((country) => (
                                <option key={country.value} value={country.value} className="profile-edit-modal__option">
                                    {country.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="profile-edit-modal__field-label profile-edit-modal__field-label--single-column">
                        Gender
                        <select
                            value={draft.gender}
                            onChange={handleFieldChange('gender')}
                            className="profile-edit-modal__input"
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
