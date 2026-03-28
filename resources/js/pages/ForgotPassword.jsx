import '../../sass/pages/Auth.scss';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);

    const onSubmit = (event) => {
        event.preventDefault();
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
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
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="auth-page__submit"
                            >
                                {loading ? 'Loading...' : 'Send reset link'}
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
