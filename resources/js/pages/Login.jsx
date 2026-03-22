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
        <div className="relative min-h-screen bg-[#1b1c24]">
            <div className="mx-auto flex w-full max-w-[1440px] justify-center px-6 pt-[140px] sm:px-8 sm:pt-[170px]">
                <section className="flex w-full max-w-[440px] flex-col items-center gap-[80px]">
                    <h1 className="font-['Sansita_Swashed'] text-[48px] font-semibold leading-none text-[#785ebf]">
                        Notely
                    </h1>

                    <form onSubmit={onSubmit} className="w-full space-y-[30px]">
                        <div className="space-y-[30px]">
                            {loginFields.map((field) => (
                                <div key={field.id} className="space-y-1">
                                    <label
                                        htmlFor={field.id}
                                        className="block font-['Roboto'] text-[14px] font-medium leading-5 tracking-[0.1px] text-white"
                                    >
                                        {field.label}
                                    </label>
                                    <input
                                        id={field.id}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        className="h-[52px] w-full rounded-[10px] border-[1.604px] border-[#323848] bg-transparent px-4 font-['Roboto'] text-[16px] font-normal leading-6 tracking-[0.5px] text-white outline-none placeholder:text-[#757575]"
                                        required
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-[10px]">
                                <span className="material-symbols-outlined text-[24px] text-white">check_box_outline_blank</span>
                                <span className="font-['Roboto'] text-[14px] font-normal leading-5 tracking-[0.1px] text-white">
                                    Remember me
                                </span>
                            </div>

                            <Link
                                to="/forgot-password"
                                className="font-['Roboto'] text-[14px] font-medium leading-5 tracking-[0.1px] text-[#785ebf]"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="h-[52px] w-full rounded-[10px] bg-[#785ebf] font-['Roboto'] text-[18px] font-semibold leading-[1.2] tracking-[-0.18px] text-white disabled:opacity-80"
                        >
                            {loading ? 'Loading...' : 'Sign in'}
                        </button>

                        <p className="text-center font-['Roboto'] text-[18px] font-normal leading-[1.5] text-[#6c6c6c]">
                            Need an account?{' '}
                            <Link to="/signup" className="font-semibold text-[#785ebf] underline">
                                Create one
                            </Link>
                        </p>
                    </form>
                </section>
            </div>
        </div>
    );
}
