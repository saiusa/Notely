import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import settingsService from '../../services/settingsService';
import '../../../sass/components/settings/TwoFactorAuth.scss';

/**
 * TwoFactorAuth Component
 * Handles 2FA enable/disable, backup codes, and verification
 */
export default function TwoFactorAuth() {
    const { user, refreshUser } = useAuth();
    const [is2FAEnabled, setIs2FAEnabled] = useState(user?.settings?.two_factor_enabled || false);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [backupCodes, setBackupCodes] = useState([]);
    const [verificationCode, setVerificationCode] = useState('');
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [step, setStep] = useState('start'); // start, verify, backup-codes, completed

    const handleEnable2FA = async () => {
        setLoading(true);
        setError('');
        try {
            // Request 2FA setup (backend generates secret)
            const response = await settingsService.setupTwoFactor();
            console.log('2FA setup response:', response);
            setStep('verify');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to enable 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await settingsService.confirmTwoFactor({
                code: verificationCode,
            });
            setBackupCodes(response.backup_codes || []);
            setStep('backup-codes');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBackupCodes = async () => {
        try {
            await refreshUser();
            setIs2FAEnabled(true);
            setStep('completed');
            setShowModal(false);
            setTimeout(() => {
                setVerificationCode('');
                setStep('start');
            }, 2000);
        } catch (err) {
            setError('Failed to save backup codes');
        }
    };

    const handleDisable2FA = async () => {
        if (!window.confirm('Are you sure you want to disable 2FA? This reduces account security.')) {
            return;
        }

        setLoading(true);
        setError('');
        try {
            await settingsService.disableTwoFactor();
            setIs2FAEnabled(false);
            await refreshUser();
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to disable 2FA');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="two-factor-auth">
            <div className="two-factor-auth__card">
                <div className="two-factor-auth__header">
                    <h3 className="two-factor-auth__title">
                        <span className="material-symbols-outlined">security</span>
                        Two-Factor Authentication
                    </h3>
                    <p className="two-factor-auth__description">
                        Add an extra layer of security to your account
                    </p>
                </div>

                <div className="two-factor-auth__status">
                    <span className={`two-factor-auth__badge ${is2FAEnabled ? 'two-factor-auth__badge--enabled' : 'two-factor-auth__badge--disabled'}`}>
                        {is2FAEnabled ? '✓ Enabled' : '✗ Disabled'}
                    </span>
                </div>

                <div className="two-factor-auth__info">
                    <p>
                        Two-factor authentication adds an extra verification step when you log in.
                        You'll need to enter a code from your authenticator app in addition to your password.
                    </p>
                </div>

                <div className="two-factor-auth__actions">
                    {!is2FAEnabled ? (
                        <button
                            onClick={() => { setShowModal(true); setStep('start'); }}
                            className="two-factor-auth__btn two-factor-auth__btn--primary"
                            disabled={loading}
                        >
                            {loading ? 'Setting up...' : 'Enable 2FA'}
                        </button>
                    ) : (
                        <button
                            onClick={handleDisable2FA}
                            className="two-factor-auth__btn two-factor-auth__btn--danger"
                            disabled={loading}
                        >
                            {loading ? 'Disabling...' : 'Disable 2FA'}
                        </button>
                    )}
                </div>
            </div>

            {/* 2FA Setup Modal */}
            {showModal && (
                <div className="two-factor-auth__modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="two-factor-auth__modal" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="two-factor-auth__modal-close"
                            onClick={() => setShowModal(false)}
                        >
                            ✕
                        </button>

                        {/* Step 1: Start */}
                        {step === 'start' && (
                            <div>
                                <h2 className="two-factor-auth__modal-title">Enable Two-Factor Authentication</h2>
                                <p className="two-factor-auth__modal-text">
                                    You'll need an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator.
                                </p>
                                <button
                                    onClick={handleEnable2FA}
                                    className="two-factor-auth__btn two-factor-auth__btn--primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Generating QR Code...' : 'Next: Scan QR Code'}
                                </button>
                            </div>
                        )}

                        {/* Step 2: Verify */}
                        {step === 'verify' && (
                            <div>
                                <h2 className="two-factor-auth__modal-title">Verify Code</h2>
                                <p className="two-factor-auth__modal-text">
                                    Enter the 6-digit code from your authenticator app:
                                </p>
                                <input
                                    type="text"
                                    maxLength="6"
                                    placeholder="000000"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                                    className="two-factor-auth__input"
                                    disabled={loading}
                                />
                                {error && <span className="two-factor-auth__error">{error}</span>}
                                <button
                                    onClick={handleVerify2FA}
                                    className="two-factor-auth__btn two-factor-auth__btn--primary"
                                    disabled={loading || verificationCode.length !== 6}
                                >
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                </button>
                            </div>
                        )}

                        {/* Step 3: Backup Codes */}
                        {step === 'backup-codes' && (
                            <div>
                                <h2 className="two-factor-auth__modal-title">Save Backup Codes</h2>
                                <p className="two-factor-auth__modal-text">
                                    Save these backup codes in a secure location. You can use them if you lose access to your authenticator app.
                                </p>
                                <div className="two-factor-auth__backup-codes">
                                    {backupCodes.map((code, idx) => (
                                        <code key={idx} className="two-factor-auth__backup-code">
                                            {code}
                                        </code>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowBackupCodes(!showBackupCodes)}
                                    className="two-factor-auth__link"
                                >
                                    {showBackupCodes ? 'Hide Codes' : 'Show Codes'}
                                </button>
                                <button
                                    onClick={async () => {
                                        await navigator.clipboard.writeText(backupCodes.join('\n'));
                                        alert('Codes copied to clipboard');
                                    }}
                                    className="two-factor-auth__btn two-factor-auth__btn--secondary"
                                >
                                    Copy Codes
                                </button>
                                <button
                                    onClick={handleSaveBackupCodes}
                                    className="two-factor-auth__btn two-factor-auth__btn--primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Finish Setup'}
                                </button>
                            </div>
                        )}

                        {/* Step 4: Success */}
                        {step === 'completed' && (
                            <div className="two-factor-auth__success">
                                <span className="two-factor-auth__success-icon">✓</span>
                                <h2 className="two-factor-auth__modal-title">2FA Enabled</h2>
                                <p className="two-factor-auth__modal-text">
                                    Your account is now protected with two-factor authentication.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
