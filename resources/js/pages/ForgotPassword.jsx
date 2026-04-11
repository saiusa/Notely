import '../../sass/pages/Auth.scss';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../components/common/Loader';
import authService from '../services/authService';

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        try {
            const data = await authService.forgotPassword({ email });
            setMessage(data.message || 'If the email exists, a password reset link has been sent.');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send reset link. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page auth-page--forgot-password">
            <div className="auth-page__container auth-page__container--forgot-password">
                <section className="auth-page__content">
                    <h1 className="auth-page__brand">
                        Notely
                    </h1>

                    <div className="auth-page__panel">
                        <div className="auth-page__intro">
                            <h2 className="auth-page__heading">
                                Reset your password
                            </h2>
                            <p className="auth-page__description">
                                Enter your email address and we&apos;ll send you instructions to reset your password.
                            </p>
                        </div>

                        <form onSubmit={onSubmit} className="auth-page__form">
                            {message && (
                                <div style={{ color: '#4ade80', fontSize: '13px', textAlign: 'center', marginBottom: '8px' }}>
                                    {message}
                                </div>
                            )}
                            {error && (
                                <div style={{ color: '#ff6b6b', fontSize: '13px', textAlign: 'center', marginBottom: '8px' }}>
                                    {error}
                                </div>
                            )}
                            <div className="auth-page__field">
                                <label
                                    htmlFor="forgot-email"
                                    className="auth-page__label"
                                >
                                    Email address
                                </label>
                                <input
                                    id="forgot-email"
                                    type="email"
                                    placeholder="Enter your email"
                                    className="auth-page__input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="auth-page__submit"
                            >
                                {loading ? <Loader /> : 'Send reset link'}
                            </button>
                        </form>

                        <div className="auth-page__back-link-row">
                            <span className="material-symbols-outlined auth-page__back-icon">arrow_back</span>
                            <Link to="/login" className="auth-page__back-link">
                                Back to login
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
