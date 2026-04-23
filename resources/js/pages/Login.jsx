import '../../sass/pages/Login.scss';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
            // login() function fetches user data via getMe() and returns it
            const loginResponse = await login(email, password, rememberMe);
            
            // Check user state from AuthContext after login completes
            // Note: We use the user state from AuthContext which is set by login()
            // This component will re-render when user state changes
            // The redirect below handles the navigation after state updates
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please try again.';
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
                    <h2 className="text-2xl font-bold text-white">Sign in to Notely</h2>
                    <p className="mt-2 text-sm text-gray-400">Share your everyday journal</p>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-900 bg-opacity-30 border border-red-600 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-medium text-gray-300 mb-1.5">
                                Email address
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-2.5 bg-[#1a1b26] border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm transition-colors"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="login-password" className="block text-sm font-medium text-gray-300 mb-1.5">
                                Password
                            </label>
                            <input
                                id="login-password"
                                type="password"
                                placeholder="Enter your password"
                                className="w-full px-4 py-2.5 bg-[#1a1b26] border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm transition-colors"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Utilities */}
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center space-x-2 text-gray-400 cursor-pointer hover:text-gray-300">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-600 bg-[#1a1b26] text-purple-600 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                            />
                            <span>Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="text-purple-400 hover:text-purple-300 transition-colors">
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50"
                    >
                        Sign in
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-gray-400">
                    Need an account?{' '}
                    <Link to="/signup" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}
