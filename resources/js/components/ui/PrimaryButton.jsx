import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function PrimaryButton({ children, loading = false, type = 'button' }) {
    return (
        <button
            type={type}
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#7A5AC6] px-4 text-base font-semibold text-white transition hover:bg-[#8A6FDA] disabled:cursor-not-allowed disabled:bg-[#7A5AC6]/70 sm:h-[56px] sm:rounded-[12px] sm:text-[34px]"
        >
            {loading ? <LoadingSpinner /> : null}
            <span>{children}</span>
        </button>
    );
}
