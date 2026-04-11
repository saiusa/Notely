import React, { useState, useEffect } from 'react';
import '../../../../sass/components/posts/comments/ReportModal.scss';

/**
 * ReportModal - Modal for reporting a comment with reason selection
 * Allows user to select reason and optionally add description
 */
export default function ReportModal({ 
    commentId,
    onSubmit, 
    onClose,
    isSubmitting = false
}) {
    const [selectedReason, setSelectedReason] = useState('');
    const [description, setDescription] = useState('');

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const reasons = [
        { id: 'spam', label: 'Spam', icon: '🚫' },
        { id: 'inappropriate', label: 'Inappropriate Content', icon: '⚠️' },
        { id: 'harassment', label: 'Harassment or Bullying', icon: '😠' },
        { id: 'misinformation', label: 'Misinformation', icon: '❌' },
        { id: 'other', label: 'Other', icon: '❓' },
    ];

    const handleSubmit = () => {
        if (!selectedReason) return;
        
        onSubmit({
            reason: selectedReason,
            description: description.trim(),
        });
    };

    return (
        <div className="report-modal-overlay" onClick={onClose}>
            <div className="report-modal" onClick={(e) => e.stopPropagation()}>
                <div className="report-modal__header">
                    <h2 className="report-modal__title">Report Comment</h2>
                    <button
                        type="button"
                        className="report-modal__close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className="report-modal__content">
                    <p className="report-modal__subtitle">
                        Please select the reason for reporting this comment:
                    </p>

                    <div className="report-modal__reasons">
                        {reasons.map((reason) => (
                            <label
                                key={reason.id}
                                className={`report-modal__reason ${
                                    selectedReason === reason.id ? 'report-modal__reason--selected' : ''
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="reason"
                                    value={reason.id}
                                    checked={selectedReason === reason.id}
                                    onChange={() => setSelectedReason(reason.id)}
                                    className="report-modal__radio"
                                />
                                <span className="report-modal__reason-icon">{reason.icon}</span>
                                <span className="report-modal__reason-label">{reason.label}</span>
                            </label>
                        ))}
                    </div>

                    {selectedReason === 'other' && (
                        <textarea
                            className="report-modal__description"
                            placeholder="Please describe the issue..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            disabled={isSubmitting}
                        />
                    )}
                </div>

                <div className="report-modal__footer">
                    <button
                        type="button"
                        className="report-modal__cancel"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="report-modal__submit"
                        onClick={handleSubmit}
                        disabled={!selectedReason || isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                </div>
            </div>
        </div>
    );
}
