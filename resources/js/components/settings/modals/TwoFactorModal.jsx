import React from 'react';
import { Input } from '../controls';

export default function TwoFactorModal({
    open,
    step,
    username,
    setUsername,
    password,
    setPassword,
    code,
    setCode,
    sampleCode,
    onCancel,
    onSendCode,
    onActivate,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-[460px] rounded-[12px] bg-[#212633] p-6 shadow-[0_14px_42px_rgba(0,0,0,0.45)]">
                {step === 'credentials' ? (
                    <>
                        <p className="mb-4 text-[16px] font-medium text-white">Enable 2FA</p>
                        <div className="space-y-3">
                            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
                            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
                        </div>
                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="h-[34px] rounded-[8px] px-4 text-[14px] text-white transition-colors hover:text-[#9b84d8]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onSendCode}
                                className="h-[34px] rounded-[8px] bg-[#785ebf] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#8c72d4]"
                            >
                                Send Code
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="mb-2 text-[16px] font-medium text-white">Enter verification code</p>
                        <p className="mb-3 text-[13px] text-[#b8bed0]">
                            Sample code sent to email (simulation): <span className="font-semibold text-white">{sampleCode}</span>
                        </p>
                        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" />
                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="h-[34px] rounded-[8px] px-4 text-[14px] text-white transition-colors hover:text-[#9b84d8]"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={onActivate}
                                className="h-[34px] rounded-[8px] bg-[#785ebf] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#8c72d4]"
                            >
                                Activate 2FA
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
