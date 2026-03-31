import React, { useEffect } from 'react';
import { Input } from '../controls';

export default function DeactivateAccountModal({ open, usernameInput, setUsernameInput, canConfirm, onCancel, onConfirm }) {
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="settings-modal-overlay">
            <div className="settings-modal settings-modal--deactivate">
                <p className="settings-modal__message">
                    Please enter your username to confirm the deactivation.
                </p>
                <Input value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Username" />
                <div className="settings-modal__actions">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="settings-modal__text-button"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={!canConfirm}
                        className="settings-modal__danger-button"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
