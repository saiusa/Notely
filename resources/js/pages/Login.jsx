import '../../sass/pages/Auth.scss';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
    const [loading, setLoading] = useState(false);

    const loginFields = [
        { id: 'login-email', label: 'Email address', type: 'email', placeholder: 'Enter your email' },
        { id: 'login-password', label: 'Password', type: 'password', placeholder: 'Enter your password' },
    ];

    const onSubmit = (event) => {
        event.preventDefault();
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
    };

    return (
        <div className="auth-page auth-page--login">
            <div className="auth-page__container auth-page__container--login">
                <section className="auth-page__content">
                    <h1 className="auth-page__brand">
                        Notely
                    </h1>

                    <form onSubmit={onSubmit} className="auth-page__form">
                        <div className="auth-page__fields auth-page__fields--spaced">
                            {loginFields.map((field) => (
                                <div key={field.id} className="auth-page__field">
                                    <label
                                        htmlFor={field.id}
                                        className="auth-page__label"
                                    >
                                        {field.label}
                                    </label>
                                    <input
                                        id={field.id}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        className="auth-page__input"
                                        required
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="auth-page__utility-row">
                            <div className="auth-page__remember">
                                <span className="material-symbols-outlined auth-page__remember-icon">check_box_outline_blank</span>
                                <span className="auth-page__remember-text">
                                    Remember me
                                </span>
                            </div>

                            <Link
                                to="/forgot-password"
                                className="auth-page__utility-link"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="auth-page__submit"
                        >
                            {loading ? 'Loading...' : 'Sign in'}
                        </button>

                        <p className="auth-page__footer-text">
                            Need an account?{' '}
                            <Link to="/signup" className="auth-page__footer-link">
                                Create one
                            </Link>
                        </p>
                    </form>
                </section>
            </div>
        </div>
    );
}
