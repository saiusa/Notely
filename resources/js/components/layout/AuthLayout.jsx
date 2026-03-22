import React from 'react';

export default function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#161929] text-slate-100">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(122,82,230,0.12),transparent_42%),radial-gradient(circle_at_84%_14%,rgba(56,89,189,0.09),transparent_42%)]" />
            <div className="relative flex min-h-screen items-center justify-center px-6 py-12 sm:px-8">
                <section className="w-full max-w-[332px] sm:max-w-[420px]">
                    <div className="mb-14 text-center sm:mb-16">
                        <h1 className="font-notely text-[54px] leading-none tracking-tight text-[#7B5CCF] sm:text-[62px]">
                            Notely
                        </h1>
                    </div>

                    <div>
                        {title ? <h2 className="text-center text-[27px] font-semibold leading-tight text-slate-100 sm:text-[42px]">{title}</h2> : null}
                        {subtitle ? <p className="mt-3 text-center text-[16px] leading-relaxed text-[#8A8FA8] sm:text-[31px]">{subtitle}</p> : null}
                        <div className="mt-7 sm:mt-8">{children}</div>
                    </div>
                </section>
            </div>
        </div>
    );
}
