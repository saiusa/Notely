import React from 'react';
import { Input, Label } from '../controls';

export default function AccountTab({
    username,
    setUsername,
    email,
    setEmail,
    country,
    phone,
    setPhone,
    countries,
    showCountryMenu,
    setShowCountryMenu,
    onCountrySelect,
    onOpenDeactivate,
    deactivateDone,
}) {
    return (
        <div className="flex min-h-[420px] flex-col">
            <div className="space-y-4">
                <label className="block">
                    <Label>Username</Label>
                    <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>

                <label className="block">
                    <Label>Email</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>

                <div>
                    <Label>Phone Number</Label>
                    <div className="flex max-w-[420px] gap-2">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowCountryMenu((prev) => !prev)}
                                className="flex h-[40px] items-center gap-1 rounded-[8px] border border-[#38405a] px-3 text-[18px]"
                            >
                                {country.code}
                                <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
                            </button>

                            {showCountryMenu && (
                                <div className="absolute left-0 top-[44px] z-30 w-[220px] rounded-[10px] border border-[#323848] bg-[#1f2332] p-1.5 text-[13px] shadow-xl">
                                    {countries.map((item) => (
                                        <button
                                            key={item.key}
                                            type="button"
                                            onClick={() => onCountrySelect(item)}
                                            className="block h-8 w-full rounded px-2 text-left text-white transition-colors hover:bg-[#2a3043]"
                                        >
                                            {item.label} ({item.code})
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={country.placeholder} />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onOpenDeactivate}
                    className="mt-5 h-[34px] rounded-[8px] bg-[#ef3d35] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#f0564f]"
                >
                    Deactivate Account
                </button>

                {deactivateDone && <p className="text-[13px] text-[#8fd3a8]">Account deactivation confirmed (simulation only).</p>}
            </div>

            <div className="mt-auto flex justify-end gap-5 pt-8">
                <button type="button" className="text-[16px] font-medium text-[#e6e8ef] transition-colors hover:text-[#9b84d8]">
                    Cancel
                </button>
                <button
                    type="button"
                    className="h-[34px] w-[80px] rounded-[8px] bg-[#785ebf] text-[14px] font-semibold text-white transition-colors hover:bg-[#8c72d4]"
                >
                    Save
                </button>
            </div>
        </div>
    );
}
