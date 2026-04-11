import '../../sass/pages/Auth.scss';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');

    if (isAuthenticated) {
        navigate('/home', { replace: true });
        return null;
    }

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setFieldErrors({});
        try {
            await register({
                username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
                email,
                password,
                password_confirmation: password,
                phone_number: phone || undefined,
            });
            navigate('/home', { replace: true });
        } catch (err) {
            if (err.response?.data?.errors) {
                setFieldErrors(err.response.data.errors);
            }
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page auth-page--signup">
            <div className="auth-page__container auth-page__container--signup">
                <section className="auth-page__content">
                    <div className="auth-page__brand">
                        <img src="/storage/logo/Notely-Logo.svg" alt="Notely" className="auth-page__logo" />
                    </div>

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
                            {error && (
                                <div style={{ color: '#ff6b6b', fontSize: '13px', textAlign: 'center', marginBottom: '8px' }}>
                                    {error}
                                </div>
                            )}
                            <div className="auth-page__grid auth-page__grid--two-columns">
                                <div className="auth-page__field">
                                    <label className="auth-page__label">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John"
                                        className="auth-page__input"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                    {fieldErrors.username && (
                                        <span style={{ color: '#ff6b6b', fontSize: '11px' }}>{fieldErrors.username[0]}</span>
                                    )}
                                </div>

                                <div className="auth-page__field">
                                    <label className="auth-page__label">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Doe"
                                        className="auth-page__input"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                {fieldErrors.email && (
                                    <span style={{ color: '#ff6b6b', fontSize: '11px' }}>{fieldErrors.email[0]}</span>
                                )}
                            </div>

                            <div className="auth-page__field">
                                <label className="auth-page__label">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    className="auth-page__input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                {fieldErrors.password && (
                                    <span style={{ color: '#ff6b6b', fontSize: '11px' }}>{fieldErrors.password[0]}</span>
                                )}
                            </div>

                            <div className="auth-page__field">
                                <label className="auth-page__label">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    className="auth-page__input"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="auth-page__submit"
                            >
                                Create Account
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
