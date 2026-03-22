import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SignUp() {
    const [loading, setLoading] = useState(false);

    const onSubmit = (event) => {
        event.preventDefault();
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
    };

    return (
        <div className="relative min-h-screen bg-[#1b1c24]">
            <div className="mx-auto flex w-full max-w-[1440px] justify-center px-6 pt-[80px] sm:px-8 sm:pt-[83px]">
                <section className="flex w-full max-w-[440px] flex-col items-center gap-[80px]">
                    <h1 className="font-['Sansita_Swashed'] text-[48px] font-semibold leading-none text-[#785ebf]">
                        Notely
                    </h1>

                    <div className="w-full space-y-10">
                        <div className="space-y-5 text-center">
                            <h2 className="font-['Roboto'] text-[28px] font-medium leading-[1.286] text-white">
                                Create your account
                            </h2>
                            <p className="font-['Roboto'] text-[18px] font-normal leading-[1.5] text-[#b3b3b3]">
                                Join Notely and share your everyday journal
                            </p>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-[30px]">
                            <div className="grid grid-cols-1 gap-[20px] sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="block font-['Roboto'] text-[14px] font-medium leading-5 tracking-[0.1px] text-white">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="John"
                                        className="h-[52px] w-full rounded-[10px] border-[1.604px] border-[#323848] bg-transparent px-4 font-['Roboto'] text-[16px] font-normal leading-6 tracking-[0.5px] text-white outline-none placeholder:text-[#757575]"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block font-['Roboto'] text-[14px] font-medium leading-5 tracking-[0.1px] text-white">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Doe"
                                        className="h-[52px] w-full rounded-[10px] border-[1.604px] border-[#323848] bg-transparent px-4 font-['Roboto'] text-[16px] font-normal leading-6 tracking-[0.5px] text-white outline-none placeholder:text-[#757575]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="block font-['Roboto'] text-[14px] font-medium leading-5 tracking-[0.1px] text-white">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="h-[52px] w-full rounded-[10px] border-[1.604px] border-[#323848] bg-transparent px-4 font-['Roboto'] text-[16px] font-normal leading-6 tracking-[0.5px] text-white outline-none placeholder:text-[#757575]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block font-['Roboto'] text-[14px] font-medium leading-5 tracking-[0.1px] text-white">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    className="h-[52px] w-full rounded-[10px] border-[1.604px] border-[#323848] bg-transparent px-4 font-['Roboto'] text-[16px] font-normal leading-6 tracking-[0.5px] text-white outline-none placeholder:text-[#757575]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block font-['Roboto'] text-[14px] font-medium leading-5 tracking-[0.1px] text-white">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Enter your password"
                                    className="h-[52px] w-full rounded-[10px] border-[1.604px] border-[#323848] bg-transparent px-4 font-['Roboto'] text-[16px] font-normal leading-6 tracking-[0.5px] text-white outline-none placeholder:text-[#757575]"
                                />
                            </div>

                        

                            <button
                                type="submit"
                                disabled={loading}
                                className="h-[52px] w-full rounded-[10px] bg-[#785ebf] font-['Roboto'] text-[18px] font-semibold leading-[1.2] tracking-[-0.18px] text-white disabled:opacity-80"
                            >
                                {loading ? 'Loading...' : 'Create Account'}
                            </button>
                        </form>

                        <p className="text-center font-['Roboto'] text-[18px] font-normal leading-[1.5] text-[#6c6c6c]">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-[#785ebf] underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
