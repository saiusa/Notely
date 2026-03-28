import React from 'react';

export function Switch({ enabled, onToggle }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`settings-control-switch ${enabled ? 'settings-control-switch--enabled' : ''}`}
            aria-pressed={enabled}
        >
            <span
                className={`settings-control-switch__thumb ${enabled ? 'settings-control-switch__thumb--enabled' : ''}`}
            />
        </button>
    );
}

export function Label({ children }) {
    return <p className="settings-control-label">{children}</p>;
}

export function Input({ value, onChange, placeholder = '', type = 'text' }) {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="settings-control-input"
        />
    );
}
