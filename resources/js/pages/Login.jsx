import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';

export default function Login() {
    const { login, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');

    // If already authenticated, redirect based on admin status
    if (isAuthenticated) {
        if (user?.is_admin === true) {
            navigate('/admin/dashboard', { replace: true });
        } else {
            navigate('/home', { replace: true });
        }
        return null;
    }

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password, rememberMe);
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
                    Welcome Back
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                    Share your everyday journal
                </p>
            </div>

            {error && (
                <div className="error-box">
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor="login-email">Email Address</label>
                    <input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="auth-utilities">
                    <label className="remember-me">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span>Remember me</span>
                    </label>
                    <Link to="/forgot-password">
                        Forgot Password?
                    </Link>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <div className="auth-footer">
                Don't have an account?{' '}
                <Link to="/signup">
                    Create one
                </Link>
            </div>
        </AuthLayout>
    );
}
