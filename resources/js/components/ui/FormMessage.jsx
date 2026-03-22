import React from 'react';

export default function FormMessage({ tone = 'neutral', children }) {
    const styles = {
        neutral: 'border-slate-700/80 bg-slate-900/70 text-slate-300',
        error: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
        success: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    };

    return (
        <div className={`rounded-xl border px-3 py-2 text-sm ${styles[tone] || styles.neutral}`}>
            {children}
        </div>
    );
}
