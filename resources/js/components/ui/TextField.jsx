import React from 'react';

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
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[#ECEEF7] sm:text-[26px]">
                {label}
            </label>
            <input
                id={id}
                type={type}
                disabled={disabled}
                required={required}
                placeholder={placeholder}
                className={`h-11 w-full rounded-xl border bg-transparent px-4 text-base text-slate-100 outline-none transition placeholder:text-[#727897] sm:h-[58px] sm:rounded-[16px] sm:px-5 sm:text-[28px] ${error ? 'border-rose-400 focus:border-rose-300' : 'border-[#303A63] focus:border-[#596BD1]'}`}
            />
            <p className={`mt-1 min-h-4 text-xs sm:mt-2 sm:min-h-6 sm:text-sm ${error ? 'text-rose-400' : 'text-transparent'}`}>
                {error || ' '}
            </p>
        </div>
    );
}
