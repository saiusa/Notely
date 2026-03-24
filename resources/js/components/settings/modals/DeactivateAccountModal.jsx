import React from 'react';
import { Input } from '../controls';

export default function DeactivateAccountModal({ open, usernameInput, setUsernameInput, canConfirm, onCancel, onConfirm }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-[460px] rounded-[12px] bg-[#212633] p-6 shadow-[0_14px_42px_rgba(0,0,0,0.45)]">
                <p className="mb-4 text-[16px] font-medium text-white">
                    Please enter your username to confirm the deactivation.
                </p>
                <Input value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Username" />
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
                        onClick={onConfirm}
                        disabled={!canConfirm}
                        className="h-[34px] rounded-[8px] bg-[#ef3d35] px-4 text-[14px] font-semibold text-white transition-colors enabled:hover:bg-[#f0564f] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}
