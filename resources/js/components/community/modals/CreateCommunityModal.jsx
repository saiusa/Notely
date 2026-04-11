import React, { useEffect, useState } from 'react';
import '../../../../sass/components/community/modals/CreateCommunityModal.scss';

export default function CreateCommunityModal({
    open,
    onCancel,
    onCreate,
    categories = [],
    defaultCategoryId = null,
    communityData = null,
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState(defaultCategoryId || '');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const isEditMode = !!communityData;

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
            
            if (isEditMode && communityData) {
                // Pre-fill form with community data for edit mode
                setName(communityData.name || '');
                setDescription(communityData.description || '');
                setCategoryId(communityData.category_id || '');
                // Set existing image preview if available
                if (communityData.cardImage) {
                    setImagePreview(communityData.cardImage);
                }
                setImage(null);
            } else {
                // Reset form for create mode
                setName('');
                setDescription('');
                setCategoryId(defaultCategoryId || '');
                setImage(null);
                setImagePreview(null);
            }
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open, defaultCategoryId, isEditMode, communityData]);

    const generateHandle = (inputName) => {
        return `@${inputName.toLowerCase().replace(/\s+/g, '-')}`;
    };

    const handleNameChange = (e) => {
        setName(e.target.value);
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        if (!name.trim() || !categoryId) return;

        onCreate({
            name,
            description,
            category_id: categoryId,
            image,
        });

        setName('');
        setDescription('');
        setCategoryId(defaultCategoryId || '');
        setImage(null);
        setImagePreview(null);
    };

    if (!open) return null;

    return (
        <div className="create-community-modal-overlay">
            <section className="create-community-modal">
                <h2 className="create-community-modal__title">
                    {isEditMode ? 'Edit Community' : 'Create Community'}
                </h2>
                
                <div className="create-community-modal__field">
                    <label className="create-community-modal__label">Community Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={handleNameChange}
                        placeholder="e.g., Art History Academy"
                        className="create-community-modal__input"
                    />
                    {name && (
                        <p className="create-community-modal__handle">
                            Handle: {generateHandle(name)}
                        </p>
                    )}
                </div>

                <div className="create-community-modal__field">
                    <label className="create-community-modal__label">Category</label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="create-community-modal__select"
                    >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                            <option key={cat.category_id} value={cat.category_id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="create-community-modal__field">
                    <label className="create-community-modal__label">Description</label>
                    <textarea
                        value={description}
                        onChange={handleDescriptionChange}
                        placeholder="Describe what your community is about..."
                        className="create-community-modal__textarea"
                    />
                </div>

                <div className="create-community-modal__field">
                    <label className="create-community-modal__label">Community Image</label>
                    <div className="create-community-modal__image-upload">
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="create-community-modal__image-preview"
                            />
                        )}
                        <label className="create-community-modal__upload-label">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="create-community-modal__hidden-input"
                            />
                            <span className="create-community-modal__upload-button">
                                {imagePreview ? 'Change Image' : 'Upload Image'}
                            </span>
                        </label>
                    </div>
                </div>

                <div className="create-community-modal__actions">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="create-community-modal__text-button"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!name.trim() || !categoryId}
                        className="create-community-modal__primary-button"
                    >
                        {isEditMode ? 'Save Changes' : 'Create'}
                    </button>
                </div>
            </section>
        </div>
    );
}
