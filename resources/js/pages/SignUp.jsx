import '../../sass/pages/Auth.scss';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SignUp() {
    const [loading, setLoading] = useState(false);

    const onSubmit = (event) => {
        event.preventDefault();
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
    };

    return (
        <div className="auth-page auth-page--signup">
            <div className="auth-page__container auth-page__container--signup">
                <section className="auth-page__content">
                    <h1 className="auth-page__brand">
                        Notely
                    </h1>

                    <div className="auth-page__panel">
                        <div className="auth-page__intro">
                            <h2 className="auth-page__heading">
                                Create your account
                            </h2>
                            <p className="auth-page__description">
                                Join Notely and share your everyday journal
                            </p>
                        </div>

                        <form onSubmit={onSubmit} className="auth-page__form">
                            <div className="auth-page__grid auth-page__grid--two-columns">
                                <div className="auth-page__field">
                                    <label className="auth-page__label">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John"
                                        className="auth-page__input"
                                    />
                                </div>

                                <div className="auth-page__field">
                                    <label className="auth-page__label">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Doe"
                                        className="auth-page__input"
                                    />
                                </div>
                            </div>

                            <div className="auth-page__field">
                                <label className="auth-page__label">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="auth-page__input"
                                />
                            </div>

                            <div className="auth-page__field">
                                <label className="auth-page__label">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    className="auth-page__input"
                                />
                            </div>

                            <div className="auth-page__field">
                                <label className="auth-page__label">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Enter your password"
                                    className="auth-page__input"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="auth-page__submit"
                            >
                                {loading ? 'Loading...' : 'Create Account'}
                            </button>
                        </form>

                        <p className="auth-page__footer-text">
                            Already have an account?{' '}
                            <Link to="/login" className="auth-page__footer-link">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
