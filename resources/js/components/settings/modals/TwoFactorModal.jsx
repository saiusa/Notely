import React from 'react';
import { Input } from '../controls';

export default function TwoFactorModal({
    open,
    step,
    username,
    setUsername,
    password,
    setPassword,
    code,
    setCode,
    sampleCode,
    onCancel,
    onSendCode,
    onActivate,
}) {
    if (!open) return null;

    return (
        <div className="settings-modal-overlay">
            <div className="settings-modal settings-modal--two-factor">
                {step === 'credentials' ? (
                    <>
                        <p className="settings-modal__title">Enable 2FA</p>
                        <div className="settings-modal__stack">
                            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
                            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                        </div>
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
                                onClick={onSendCode}
                                className="settings-modal__primary-button"
                            >
                                Send Code
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="settings-modal__title settings-modal__title--compact">Enter verification code</p>
                        <p className="settings-modal__hint">
                            Sample code sent to email (simulation): <span className="settings-modal__hint-strong">{sampleCode}</span>
                        </p>
                        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" />
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
                                onClick={onActivate}
                                className="settings-modal__primary-button"
                            >
                                Activate 2FA
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
