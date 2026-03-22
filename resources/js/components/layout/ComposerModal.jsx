import React from 'react';

const modeConfig = {
    text: {
        header: 'Title',
        placeholder: 'Start writing your day...',
    },
    quote: {
        header: '',
        placeholder: 'Start writing quotes...',
    },
    image: {
        header: '',
        placeholder: 'Start writing your day...',
    },
};

export default function ComposerModal({ mode, onClose }) {
    const config = modeConfig[mode] || modeConfig.text;

    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/55 px-4">
            <section className="w-full max-w-[600px] rounded-[16px] bg-[#232838] p-6">
                <div className="flex justify-between">
                    <div className="w-full">
                        {config.header ? <p className="text-[32px] text-[#8a8f9f]">{config.header}</p> : null}
                        <p className="mt-2 text-[16px] text-[#8a8f9f]">{config.placeholder}</p>
                    </div>
                    <span className="material-symbols-outlined text-[#9aa0ae]">more_vert</span>
                </div>

                {mode === 'image' && (
                    <img
                        src="https://images.unsplash.com/photo-1516534775068-ba3e7458af70?auto=format&fit=crop&w=1100&q=80"
                        alt="preview"
                        className="mt-4 h-[220px] w-full rounded-[6px] object-cover"
                    />
                )}

                <div className="mt-6 flex items-center gap-3 text-white">
                    {mode !== 'image' && (
                        <>
                            <button type="button" className="text-[24px] font-semibold transition-colors hover:text-[#9b84d8]">
                                B
                            </button>
                            <button type="button" className="text-[24px] italic transition-colors hover:text-[#9b84d8]">
                                I
                            </button>
                        </>
                    )}
                </div>

                <div className="mt-2 flex items-center gap-3 text-[16px] text-[#83899a]">
                    <button
                        type="button"
                        className="flex items-center gap-1 rounded-full bg-[#666a75] px-3 py-1 text-[14px] text-white transition-colors hover:bg-[#7a7f8b]"
                    >
                        Mood
                        <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
                    </button>
                    <button type="button" className="transition-colors hover:text-[#a0a6b8]">#add tags</button>
                </div>

                <div className="mt-8 flex items-center justify-between">
                    <button type="button" onClick={onClose} className="text-[28px] text-white transition-colors hover:text-[#9b84d8]">
                        Cancel
                    </button>
                    <button type="button" className="h-[36px] w-[76px] rounded-[8px] bg-[#785ebf] text-[20px] font-medium text-white transition-colors hover:bg-[#8c72d4]">
                        Post
                    </button>
                </div>
            </section>
        </div>
    );
}
