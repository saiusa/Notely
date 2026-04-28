import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
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
        <AuthLayout>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
                    Reset Password
                </h2>
                <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                    Enter your email address and we'll send you instructions to reset your password.
                </p>
            </div>

            {message && (
                <div style={{ 
                    padding: '0.875rem', 
                    marginBottom: '1.5rem', 
                    textAlign: 'center', 
                    fontSize: '0.875rem', 
                    color: '#10b981', 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                    border: '1px solid rgba(16, 185, 129, 0.2)', 
                    borderRadius: '0.75rem' 
                }}>
                    {message}
                </div>
            )}

            {error && (
                <div className="error-box">
                    {error}
                </div>
            )}

            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label htmlFor="forgot-email">Email Address</label>
                    <input
                        id="forgot-email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>

            <div className="auth-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>arrow_back</span>
                <Link to="/login">
                    Back to login
                </Link>
            </div>
        </AuthLayout>
    );
}
