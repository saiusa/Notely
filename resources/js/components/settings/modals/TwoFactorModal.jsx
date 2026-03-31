import React, { useEffect, useState } from 'react';
import { Input } from '../controls';

export default function TwoFactorModal({
    open,
    onCancel,
    onActivate,
}) {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState('email'); // 'email' or 'verify'

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

    const handleSendLink = () => {
        if (!email.trim()) return;
        // Send verification link via email
        setStep('verify');
    };

    const handleVerify = () => {
        // After user accepts link and comes back
        onActivate();
        setEmail('');
        setStep('email');
        onCancel();
    };

    if (!open) return null;

    return (
        <div className="settings-2fa-modal-overlay">
            <section className="settings-2fa-modal">
                <h2 className="settings-2fa-modal__title">Enable Two-Factor Authentication</h2>
                
                {step === 'email' ? (
                    <>
                        <p className="settings-2fa-modal__description">
                            Enter your email address to receive a verification link for Two-Factor Authentication.
                        </p>
                        <Input 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="Enter your email" 
                        />
                        <div className="settings-2fa-modal__actions">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="settings-2fa-modal__text-button"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSendLink}
                                className="settings-2fa-modal__primary-button"
                            >
                                Send Verification Link
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="settings-2fa-modal__description">
                            Verification link has been sent to {email}. Please check your email and click the link to verify. Once verified, click the button below to complete setup.
                        </p>
                        <div className="settings-2fa-modal__actions">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="settings-2fa-modal__text-button"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleVerify}
                                className="settings-2fa-modal__primary-button"
                            >
                                Complete Setup
                            </button>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
