import '../../sass/pages/Auth.scss';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // If already authenticated, redirect to home
    if (isAuthenticated) {
        navigate('/home', { replace: true });
        return null;
    }

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/home', { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
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
                            {error && (
                                <div style={{ color: '#ff6b6b', fontSize: '13px', textAlign: 'center', marginBottom: '8px' }}>
                                    {error}
                                </div>
                            )}
                            <div className="auth-page__field">
                                <label
                                    htmlFor="login-email"
                                    className="auth-page__label"
                                >
                                    Email address
                                </label>
                                <input
                                    id="login-email"
                                    type="email"
                                    placeholder="Enter your email"
                                    className="auth-page__input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="auth-page__field">
                                <label
                                    htmlFor="login-password"
                                    className="auth-page__label"
                                >
                                    Password
                                </label>
                                <input
                                    id="login-password"
                                    type="password"
                                    placeholder="Enter your password"
                                    className="auth-page__input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
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
                            {loading ? 'Signing in...' : 'Sign in'}
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
