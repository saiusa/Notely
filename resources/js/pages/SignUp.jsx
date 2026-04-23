import '../../sass/pages/SignUp.scss';
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
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

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
        <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#16171c] text-gray-200">
            <div className="max-w-md w-full space-y-8">
                {/* Logo */}
                <div className="flex justify-center">
                    <img src="/storage/logo/Notely-Logo.svg" alt="Notely" className="h-12 w-auto" />
                </div>

                {/* Heading */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">Create your account</h2>
                    <p className="mt-2 text-sm text-gray-400">Join Notely and share your everyday journal</p>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-900 bg-opacity-30 border border-red-600 rounded-lg text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* First Name & Last Name Row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="John"
                                    className="w-full px-4 py-2.5 bg-[#1a1b26] border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm transition-colors"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                                {fieldErrors.username && (
                                    <span className="text-red-400 text-xs mt-1 block">{fieldErrors.username[0]}</span>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Doe"
                                    className="w-full px-4 py-2.5 bg-[#1a1b26] border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm transition-colors"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Email address
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-2.5 bg-[#1a1b26] border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm transition-colors"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            {fieldErrors.email && (
                                <span className="text-red-400 text-xs mt-1 block">{fieldErrors.email[0]}</span>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                className="w-full px-4 py-2.5 bg-[#1a1b26] border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm transition-colors"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {fieldErrors.password && (
                                <span className="text-red-400 text-xs mt-1 block">{fieldErrors.password[0]}</span>
                            )}
                        </div>

                        {/* Password Confirmation Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                placeholder="Confirm your password"
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
                        Create Account
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
