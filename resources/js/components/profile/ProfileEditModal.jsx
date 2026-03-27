import React, { useRef, useState } from 'react';
import { countryOptions, defaultProfile } from './ProfileUser';

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
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4">
            <section className="w-full max-w-[860px] rounded-[20px] bg-[#232838] p-6 text-white md:p-8">
                <h2 className="text-[24px] font-medium leading-[1.1]">Edit Profile</h2>

                <div className="mt-7 flex flex-wrap items-center gap-5">
                    <img
                        src={draft.profilePhoto || defaultProfile.profilePhoto}
                        alt="avatar"
                        className="h-[72px] w-[72px] rounded-full object-cover"
                    />

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePickPhoto}
                            className="h-[38px] rounded-[8px] border border-[#785ebf] px-4 text-[14px] font-normal leading-none text-[#9b84d8]"
                        >
                            <span className="material-symbols-outlined mr-1 align-middle text-[16px]">image</span>
                            Change
                        </button>
                        <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="h-[38px] rounded-[8px] border border-[#785ebf] px-4 text-[14px] font-normal leading-none text-[#9b84d8]"
                        >
                            <span className="material-symbols-outlined mr-1 align-middle text-[16px]">delete</span>
                            Remove
                        </button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                    />
                </div>

                <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="text-[14px] font-normal leading-[1.2] text-white">
                        First Name
                        <input
                            value={draft.firstName}
                            onChange={handleFieldChange('firstName')}
                            className="mt-2 h-[40px] w-full rounded-[8px] border border-[#3b4257] bg-transparent px-3 text-[16px] font-normal leading-none"
                        />
                    </label>
                    <label className="text-[14px] font-normal leading-[1.2] text-white">
                        Last Name
                        <input
                            value={draft.lastName}
                            onChange={handleFieldChange('lastName')}
                            className="mt-2 h-[40px] w-full rounded-[8px] border border-[#3b4257] bg-transparent px-3 text-[16px] font-normal leading-none"
                        />
                    </label>
                    <label className="text-[14px] font-normal leading-[1.2] text-white">
                        Birthday
                        <input
                            type="date"
                            value={draft.birthday}
                            onChange={handleFieldChange('birthday')}
                            className="mt-2 h-[40px] w-full rounded-[8px] border border-[#3b4257] bg-transparent px-3 text-[16px] font-normal leading-none"
                        />
                    </label>
                    <label className="text-[14px] font-normal leading-[1.2] text-white">
                        Country
                        <select
                            value={draft.country}
                            onChange={handleFieldChange('country')}
                            className="mt-2 h-[40px] w-full rounded-[8px] border border-[#3b4257] bg-transparent px-3 text-[16px] font-normal leading-none"
                        >
                            {countryOptions.map((country) => (
                                <option key={country.value} value={country.value} className="bg-[#1f2332] text-white">
                                    {country.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="text-[14px] font-normal leading-[1.2] text-white md:col-span-1">
                        Gender
                        <select
                            value={draft.gender}
                            onChange={handleFieldChange('gender')}
                            className="mt-2 h-[40px] w-full rounded-[8px] border border-[#3b4257] bg-transparent px-3 text-[16px] font-normal leading-none"
                        >
                            <option className="bg-[#1f2332] text-white" value="Male">
                                Male
                            </option>
                            <option className="bg-[#1f2332] text-white" value="Female">
                                Female
                            </option>
                            <option className="bg-[#1f2332] text-white" value="Non-binary">
                                Non-binary
                            </option>
                            <option className="bg-[#1f2332] text-white" value="Prefer not to say">
                                Prefer not to say
                            </option>
                        </select>
                    </label>
                </div>

                <label className="mt-5 block text-[14px] font-normal leading-[1.2] text-white">
                    Description
                    <textarea
                        value={draft.description}
                        onChange={handleFieldChange('description')}
                        className="mt-2 h-[100px] w-full resize-none rounded-[8px] border border-[#3b4257] bg-transparent px-3 py-2 text-[16px] font-normal leading-[1.45]"
                    />
                </label>

                <div className="mt-7 flex items-center justify-end gap-6">
                    <button type="button" onClick={onClose} className="text-[16px] font-medium leading-none text-white hover:text-[#9b84d8]">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onSave(draft)}
                        className="h-[44px] w-[105px] rounded-[8px] bg-[#785ebf] text-[16px] font-medium leading-none text-white hover:bg-[#8c72d4]"
                    >
                        Save
                    </button>
                </div>
            </section>
        </div>
    );
}
