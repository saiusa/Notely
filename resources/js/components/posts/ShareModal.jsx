import React, { useState, useEffect, useRef } from 'react';
import '../../../sass/components/posts/ShareModal.scss';

/**
 * ShareModal — dark overlay modal for copying a post link.
 * Props:
 *   isOpen  {boolean} — controls visibility
 *   postId  {string|number} — used to build the share URL
 *   onClose {Function} — called when the modal should close
 */
export default function ShareModal({ isOpen, postId, onClose }) {
    const [copied, setCopied] = useState(false);
    const overlayRef = useRef(null);

    const url = postId
        ? `${window.location.origin}/#/post/${postId}`
        : window.location.href;

    // Reset "Copied" state whenever the modal opens
    useEffect(() => {
        if (isOpen) setCopied(false);
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (_) {
            // Silently fail — clipboard API may be unavailable
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) onClose?.();
    };

    return (
        <div
            className="share-modal__overlay"
            ref={overlayRef}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-label="Share post"
        >
            <div className="share-modal__card">
                {/* Header */}
                <div className="share-modal__header">
                    <h3 className="share-modal__title">Share</h3>
                    <button
                        type="button"
                        className="share-modal__close-btn"
                        onClick={onClose}
                        aria-label="Close share modal"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Copy Link button */}
                <div className="share-modal__action">
                    <button
                        type="button"
                        className={`share-modal__copy-btn ${copied ? 'share-modal__copy-btn--copied' : ''}`}
                        onClick={handleCopy}
                        aria-label="Copy link"
                    >
                        <span className="material-symbols-outlined">
                            {copied ? 'check' : 'link'}
                        </span>
                    </button>
                    <span className="share-modal__copy-label">
                        {copied ? 'Copied!' : 'Copy Link'}
                    </span>
                </div>

                {/* Read-only URL input */}
                <div className="share-modal__url-row">
                    <input
                        type="text"
                        className="share-modal__url-input"
                        value={url}
                        readOnly
                        onClick={handleCopy}
                        aria-label="Post URL"
                    />
                </div>
            </div>
        </div>
    );
}
