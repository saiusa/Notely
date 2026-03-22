import React from 'react';

export default function LoadingSpinner({ size = 'sm' }) {
    const sizeClass = size === 'md' ? 'h-5 w-5 border-2' : 'h-4 w-4 border-2';

    return <span className={`inline-block animate-spin rounded-full border-white/40 border-t-white ${sizeClass}`} />;
}
