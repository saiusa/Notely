import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import '../../sass/components/ui/PrimaryButton.scss';

export default function PrimaryButton({ children, loading = false, type = 'button' }) {
    return (
        <button
            type={type}
            disabled={loading}
            className="primary-button"
        >
            {loading ? <LoadingSpinner /> : null}
            <span>{children}</span>
        </button>
    );
}
