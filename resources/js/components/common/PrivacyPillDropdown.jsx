import React, { useRef, useEffect, useState } from 'react';

/**
 * PrivacyPillDropdown Component
 * 
 * A custom, sleek pill-style dropdown for selecting privacy settings
 * (Public, Private, or optional community options).
 * 
 * Props:
 *  - value: Current privacy value ('public' | 'private' | 'community_id')
 *  - onChange: Callback when selection changes
 *  - options: Array of { value, label, icon, description } objects
 *  - disabled: Boolean to disable the dropdown
 */
export default function PrivacyPillDropdown({ 
    value = 'public', 
    onChange, 
    options = [
        { value: 'public', label: 'Public', icon: 'public', description: 'Explore' },
        { value: 'private', label: 'Private', icon: 'lock', description: 'Journal only' },
    ],
    disabled = false 
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    // Find the current selected option
    const selectedOption = options.find(opt => opt.value === value) || options[0];

    // ========================================================================
    // CLICK-OUTSIDE BEHAVIOR
    // ========================================================================
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(e.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // ========================================================================
    // HANDLERS
    // ========================================================================
    const handleSelectOption = (option) => {
        onChange(option.value);
        setIsOpen(false);
    };

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    // ========================================================================
    // RENDER
    // ========================================================================
    return (
        <div className="privacy-pill-dropdown">
            {/* Pill Button */}
            <button
                ref={buttonRef}
                type="button"
                onClick={handleToggle}
                disabled={disabled}
                className="privacy-pill-dropdown__button"
                aria-label="Change privacy setting"
                aria-expanded={isOpen}
            >
                <span className="material-symbols-outlined privacy-pill-dropdown__icon">
                    {selectedOption.icon}
                </span>
                <span className="privacy-pill-dropdown__label">
                    {selectedOption.label}
                </span>
                {selectedOption.description && (
                    <span className="privacy-pill-dropdown__description">
                        {selectedOption.description}
                    </span>
                )}
                <span className="material-symbols-outlined privacy-pill-dropdown__arrow">
                    expand_more
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div ref={dropdownRef} className="privacy-pill-dropdown__menu">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelectOption(option)}
                            className={`privacy-pill-dropdown__option ${
                                value === option.value 
                                    ? 'privacy-pill-dropdown__option--active' 
                                    : ''
                            }`}
                        >
                            <span className="material-symbols-outlined privacy-pill-dropdown__option-icon">
                                {option.icon}
                            </span>
                            <div className="privacy-pill-dropdown__option-text">
                                <div className="privacy-pill-dropdown__option-label">
                                    {option.label}
                                </div>
                                {option.description && (
                                    <div className="privacy-pill-dropdown__option-description">
                                        {option.description}
                                    </div>
                                )}
                            </div>
                            {value === option.value && (
                                <span className="material-symbols-outlined privacy-pill-dropdown__checkmark">
                                    check
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
