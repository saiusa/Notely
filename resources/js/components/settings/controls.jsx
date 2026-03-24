import React from 'react';

export function Switch({ enabled, onToggle }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`relative inline-flex h-[22px] w-[40px] items-center rounded-full transition-colors ${
                enabled ? 'bg-[#785ebf]' : 'bg-[#6e727d]'
            }`}
            aria-pressed={enabled}
        >
            <span
                className={`h-[18px] w-[18px] rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-[20px]' : 'translate-x-[2px]'
                }`}
            />
        </button>
    );
}

export function Label({ children }) {
    return <p className="mb-1.5 text-[14px] font-semibold text-[#edf0f8]">{children}</p>;
}

export function Input({ value, onChange, placeholder = '', type = 'text' }) {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="h-[40px] w-full rounded-[8px] border border-[#38405a] bg-transparent px-3 text-[16px] text-[#e7ebf5] placeholder:text-[#737a8f] focus:outline-none"
        />
    );
}
