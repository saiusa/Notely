import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);

    const onSubmit = (event) => {
        event.preventDefault();
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
    };

    return (
        <div className="relative min-h-screen bg-[#1b1c24]">
            <div className="mx-auto flex w-full max-w-[1440px] justify-center px-6 pt-[150px] sm:px-8 sm:pt-[220px]">
                <section className="flex w-full max-w-[440px] flex-col items-center gap-[80px]">
                    <h1 className="font-['Sansita_Swashed'] text-[48px] font-semibold leading-none text-[#785ebf]">
                        Notely
                    </h1>

                    <div className="w-full space-y-10">
                        <div className="space-y-5 text-center">
                            <h2 className="font-['Roboto'] text-[28px] font-medium leading-[1.286] text-white">
                                Reset your password
                            </h2>
                            <p className="font-['Roboto'] text-[18px] font-normal leading-[1.5] text-[#b3b3b3]">
                                Enter your email address and we&apos;ll send you instructions to reset your password.
                            </p>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-[30px]">
                            <div className="space-y-1">
                                <label
                                    htmlFor="forgot-email"
                                    className="block font-['Roboto'] text-[14px] font-medium leading-5 tracking-[0.1px] text-white"
                                >
                                    Email address
                                </label>
                                <input
                                    id="forgot-email"
                                    type="email"
                                    placeholder="Enter your email"
                                    className="h-[52px] w-full rounded-[10px] border-[1.604px] border-[#323848] bg-transparent px-4 font-['Roboto'] text-[16px] font-normal leading-6 tracking-[0.5px] text-white outline-none placeholder:text-[#757575]"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="h-[52px] w-full rounded-[10px] bg-[#785ebf] font-['Roboto'] text-[18px] font-semibold leading-[1.2] tracking-[-0.18px] text-white disabled:opacity-80"
                            >
                                {loading ? 'Loading...' : 'Send reset link'}
                            </button>
                        </form>

                        <div className="flex items-center justify-center gap-[10px] text-[#6c6c6c]">
                            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                            <Link to="/login" className="font-['Roboto'] text-[18px] font-normal leading-[1.5]">
                                Back to login
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
