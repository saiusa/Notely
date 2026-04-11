import React from 'react';
import '../../sass/components/ui/TextField.scss';

export default function TextField({
    id,
    label,
    type = 'text',
    placeholder,
    error,
    disabled = false,
    required = false,
}) {
    return (
        <div className="text-field__container">
            <label htmlFor={id} className="text-field__label">
                {label}
            </label>
            <input
                id={id}
                type={type}
                disabled={disabled}
                required={required}
                placeholder={placeholder}
                className="text-field__input"
            />
            <p className="text-field__error">
                {error || ' '}
            </p>
        </div>
    );
}
