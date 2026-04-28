import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';

export default function SignUp() {
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    if (isAuthenticated) {
        navigate('/home', { replace: true });
        return null;
    }

    // Auto-suggest username from name
    const buildUsername = (fn, ln) =>
        `${fn.toLowerCase()}.${ln.toLowerCase()}`.replace(/[^a-z0-9._]/g, '');

    const handleFirstNameChange = (e) => {
        const val = e.target.value;
        setFirstName(val);
        setUsername((prev) => {
            if (!prev || prev === buildUsername(firstName, lastName)) {
                return buildUsername(val, lastName);
            }
            return prev;
        });
    };

    const handleLastNameChange = (e) => {
        const val = e.target.value;
        setLastName(val);
        setUsername((prev) => {
            if (!prev || prev === buildUsername(firstName, lastName)) {
                return buildUsername(firstName, val);
            }
            return prev;
        });
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setFieldErrors({});
        try {
            await register({
                first_name: firstName,
                last_name: lastName,
                username,
                email,
                password,
                password_confirmation: passwordConfirmation,
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
        <AuthLayout>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
                    Create Account
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                    Join Notely and share your everyday journal
                </p>
            </div>

            {error && (
                <div className="error-box">
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="signup-firstname">First Name</label>
                        <input
                            id="signup-firstname"
                            type="text"
                            placeholder="John"
                            value={firstName}
                            onChange={handleFirstNameChange}
                            required
                            disabled={loading}
                        />
                        {fieldErrors.first_name && (
                            <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                {fieldErrors.first_name[0]}
                            </span>
                        )}
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="signup-lastname">Last Name</label>
                        <input
                            id="signup-lastname"
                            type="text"
                            placeholder="Doe"
                            value={lastName}
                            onChange={handleLastNameChange}
                            required
                            disabled={loading}
                        />
                        {fieldErrors.last_name && (
                            <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                {fieldErrors.last_name[0]}
                            </span>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="signup-username">Username</label>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>@</span>
                        <input
                            id="signup-username"
                            type="text"
                            placeholder="username"
                            style={{ paddingLeft: '2.25rem' }}
                            value={username}
                            onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9._]/gi, '').toLowerCase())}
                            required
                            disabled={loading}
                        />
                    </div>
                    {fieldErrors.username && (
                        <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {fieldErrors.username[0]}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="signup-email">Email Address</label>
                    <input
                        id="signup-email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                    {fieldErrors.email && (
                        <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {fieldErrors.email[0]}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="signup-password">Password</label>
                    <input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                    {fieldErrors.password && (
                        <span style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            {fieldErrors.password[0]}
                        </span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="signup-confirm-password">Confirm Password</label>
                    <input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>
            </form>

            <div className="auth-footer">
                Already have an account?{' '}
                <Link to="/login">
                    Sign in
                </Link>
            </div>
        </AuthLayout>
    );
}
