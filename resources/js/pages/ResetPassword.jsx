import '../../sass/pages/ResetPassword.scss';
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Extract token and email from URL query parameters
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // Redirect if token or email is missing
    if (!token || !email) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#16171c] text-gray-200">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white">Invalid Reset Link</h2>
                        <p className="mt-2 text-sm text-gray-400">The password reset link is invalid or has expired.</p>
                    </div>
                    <div className="flex justify-center">
                        <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const onSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        setFieldErrors({});

        // Client-side validation
        if (password !== passwordConfirmation) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('/api/reset-password', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });

            setSuccess(response.data?.message || 'Password reset successfully! Redirecting to login...');
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 2000);
        } catch (err) {
            if (err.response?.data?.errors) {
                setFieldErrors(err.response.data.errors);
            }
            const msg = err.response?.data?.message || 'Failed to reset password. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#16171c] text-gray-200">
            <div className="max-w-md w-full space-y-8">
                {/* Logo */}
                <div className="flex justify-center">
                    <img src="/storage/logo/Notely-Logo.svg" alt="Notely" className="h-12 w-auto" />
                </div>

                {/* Heading */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">Reset your password</h2>
                    <p className="mt-2 text-sm text-gray-400">Enter your new password below</p>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Success Message */}
                    {success && (
                        <div className="p-3 bg-green-900 bg-opacity-30 border border-green-600 rounded-lg text-green-400 text-sm text-center">
                            {success}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-900 bg-opacity-30 border border-red-600 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* New Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                                New Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your new password"
                                className="w-full px-4 py-2.5 bg-[#1a1b26] border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm transition-colors"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {fieldErrors.password && (
                                <span className="text-red-400 text-xs mt-1 block">{fieldErrors.password[0]}</span>
                            )}
                            <p className="text-gray-500 text-xs mt-1">Minimum 8 characters</p>
                        </div>

                        {/* Confirm New Password Field */}
                        <div>
                            <label htmlFor="passwordConfirmation" className="block text-sm font-medium text-gray-300 mb-1.5">
                                Confirm New Password
                            </label>
                            <input
                                id="passwordConfirmation"
                                type="password"
                                placeholder="Confirm your new password"
                                className="w-full px-4 py-2.5 bg-[#1a1b26] border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm transition-colors"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                required
                            />
                            {fieldErrors.password_confirmation && (
                                <span className="text-red-400 text-xs mt-1 block">{fieldErrors.password_confirmation[0]}</span>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Resetting password...' : 'Reset Password'}
                    </button>
                </form>

                {/* Back Link */}
                <div className="flex items-center justify-center text-sm">
                    <span className="material-symbols-outlined text-base text-gray-400 mr-2">arrow_back</span>
                    <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}
