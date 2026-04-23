import '../../sass/pages/ForgotPassword.scss';
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
        <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#16171c] text-gray-200">
            <div className="max-w-md w-full space-y-8">
                {/* Logo */}
                <div className="flex justify-center">
                    <h1 className="text-2xl font-bold text-white">Notely</h1>
                </div>

                {/* Heading */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">Reset your password</h2>
                    <p className="mt-2 text-sm text-gray-400">Enter your email address and we&apos;ll send you instructions to reset your password.</p>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-6">
                    {message && (
                        <div className="p-3 bg-green-900 bg-opacity-30 border border-green-600 rounded-lg text-green-400 text-sm text-center">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="p-3 bg-red-900 bg-opacity-30 border border-red-600 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-300 mb-1.5">
                                Email address
                            </label>
                            <input
                                id="forgot-email"
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-2.5 bg-[#1a1b26] border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm transition-colors"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader /> : 'Send reset link'}
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
