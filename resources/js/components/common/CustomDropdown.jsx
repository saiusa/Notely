import React, { useEffect, useRef, useState } from 'react';
import '../../../sass/components/common/CustomDropdown.scss';

export default function CustomDropdown({
    trigger,
    value,
    onChange,
    options = [],
    searchable = false,
    onSearch = null,
    searchValue = '',
    filteredOptions = null,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [localSearchValue, setLocalSearchValue] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Use filtered options if provided, otherwise use all options
    const displayOptions = filteredOptions !== null ? filteredOptions : options;

    // Get current selection label
    const getSelectionLabel = () => {
        if (typeof trigger === 'string') return trigger;
        if (typeof trigger === 'function') return trigger();
        return 'Select';
    };

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setLocalSearchValue('');
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchable && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 0);
        }
    }, [isOpen, searchable]);

    const handleOptionClick = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
        setLocalSearchValue('');
    };

    const handleSearchChange = (e) => {
        const searchTerm = e.target.value;
        setLocalSearchValue(searchTerm);
        if (onSearch) {
            onSearch(searchTerm);
        }
    };

    return (
        <div className="custom-dropdown" ref={dropdownRef}>
            {/* Trigger Button - Tab Style */}
            <button
                type="button"
                className={`custom-dropdown__trigger ${isOpen ? 'custom-dropdown__trigger--active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className="custom-dropdown__text">{getSelectionLabel()}</span>
                <span className="material-symbols-outlined custom-dropdown__icon">expand_more</span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="custom-dropdown__menu">
                    {/* Search Input (if searchable) */}
                    {searchable && (
                        <div className="custom-dropdown__search">
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search..."
                                value={localSearchValue}
                                onChange={handleSearchChange}
                                className="custom-dropdown__search-input"
                            />
                        </div>
                    )}

                    {/* Options List */}
                    <ul className="custom-dropdown__options" role="listbox">
                        {displayOptions.length === 0 ? (
                            <li className="custom-dropdown__empty">No results found</li>
                        ) : (
                            displayOptions.map((option) => (
                                <li
                                    key={option.value}
                                    className={`custom-dropdown__option ${
                                        value === option.value ? 'custom-dropdown__option--active' : ''
                                    }`}
                                    onClick={() => handleOptionClick(option.value)}
                                    role="option"
                                    aria-selected={value === option.value}
                                >
                                    <span className="custom-dropdown__option-text">{option.label}</span>
                                    {value === option.value && (
                                        <span className="material-symbols-outlined custom-dropdown__checkmark">check</span>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
