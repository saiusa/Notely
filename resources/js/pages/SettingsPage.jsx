import React, { useState } from 'react';
import SocialLayout from '../components/layout/SocialLayout';

const menuItems = [
    ['account', 'Account', 'person'],
    ['security', 'Sign in & security', 'lock'],
    ['privacy', 'Privacy', 'shield'],
    ['notification', 'Notification', 'notifications_none'],
];

function Toggle({ enabled }) {
    return (
        <span className={`relative inline-flex h-[24px] w-[40px] items-center rounded-full ${enabled ? 'bg-[#785ebf]' : 'bg-[#61656f]'}`}>
            <span className={`h-[18px] w-[18px] rounded-full bg-white transition-transform ${enabled ? 'translate-x-[20px]' : 'translate-x-[2px]'}`} />
        </span>
    );
}

export default function SettingsPage() {
    const [activeMenu, setActiveMenu] = useState('account');

    return (
        <SocialLayout activeNav="settings" navbarMode="title" title="Settings">
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[250px_minmax(0,1fr)]">
                <aside className="rounded-[10px] bg-[#212633] p-3">
                    {menuItems.map(([key, label, icon]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setActiveMenu(key)}
                            className={`mb-1 flex h-[36px] w-full items-center gap-2 rounded-[9px] px-3 text-[13px] transition-colors ${
                                activeMenu === key ? 'bg-[#343b4f] text-white' : 'text-white hover:bg-[#2a3042]'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{icon}</span>
                            {label}
                        </button>
                    ))}
                </aside>

                <section className="rounded-[10px] bg-[#212633] p-4">
                    {activeMenu === 'account' && (
                        <div className="space-y-4">
                            <label className="block text-[20px]">
                                Username
                                <input defaultValue="jin.bts" className="mt-1 h-[40px] w-full rounded-[8px] border border-[#3b4257] bg-transparent px-3 text-[28px]" />
                            </label>
                            <label className="block text-[20px]">
                                Email
                                <input defaultValue="jin.bts@gmail.com" className="mt-1 h-[40px] w-full rounded-[8px] border border-[#3b4257] bg-transparent px-3 text-[28px]" />
                            </label>
                            <label className="block text-[20px]">
                                Phone Number
                                <div className="mt-1 flex gap-1">
                                    <button type="button" className="h-[40px] rounded-[8px] border border-[#3b4257] px-3 text-[28px]">
                                        +82
                                        <span className="material-symbols-outlined align-middle text-[18px]">keyboard_arrow_down</span>
                                    </button>
                                    <input defaultValue="1012345678" className="h-[40px] w-[180px] rounded-[8px] border border-[#3b4257] bg-transparent px-3 text-[28px]" />
                                </div>
                            </label>
                            <button type="button" className="h-[38px] rounded-[8px] bg-[#ef4444] px-5 text-[24px] font-medium">
                                Delete Account
                            </button>
                            <div className="flex justify-end gap-5 pt-6">
                                <button type="button" className="text-[38px] hover:text-[#9b84d8]">Cancel</button>
                                <button type="button" className="h-[50px] w-[120px] rounded-[8px] bg-[#785ebf] text-[30px] font-medium hover:bg-[#8c72d4]">
                                    Save
                                </button>
                            </div>
                        </div>
                    )}

                    {activeMenu === 'security' && (
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <p className="text-[30px]">Two-Factor Authentication</p>
                                <Toggle enabled />
                            </div>
                            <label className="block text-[20px]">
                                Current Password
                                <input placeholder="Enter current password" className="mt-1 h-[40px] w-full rounded-[8px] border border-[#3b4257] bg-transparent px-3 text-[28px] placeholder:text-[#707487]" />
                            </label>
                            <label className="block text-[20px]">
                                New Password
                                <input placeholder="Enter New Password" className="mt-1 h-[40px] w-full rounded-[8px] border border-[#3b4257] bg-transparent px-3 text-[28px] placeholder:text-[#707487]" />
                            </label>
                            <label className="block text-[20px]">
                                Confirm Password
                                <input className="mt-1 h-[40px] w-full rounded-[8px] border border-[#3b4257] bg-transparent px-3 text-[28px]" />
                            </label>
                            <div className="flex justify-end gap-5 pt-6">
                                <button type="button" className="text-[38px] hover:text-[#9b84d8]">Cancel</button>
                                <button type="button" className="h-[50px] w-[120px] rounded-[8px] bg-[#785ebf] text-[30px] font-medium hover:bg-[#8c72d4]">
                                    Save
                                </button>
                            </div>
                        </div>
                    )}

                    {activeMenu === 'privacy' && (
                        <div className="space-y-5 text-[30px]">
                            <div>
                                <p className="mb-2">Default Post Privacy</p>
                                <label className="mb-2 flex items-center gap-2">
                                    <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#785ebf]" /> Public
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" className="h-4 w-4 accent-[#785ebf]" /> Private
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <p>Hide comments on my posts</p>
                                <Toggle enabled={false} />
                            </div>
                            <div className="flex items-center justify-between">
                                <p>Show reaction counts</p>
                                <Toggle enabled />
                            </div>
                        </div>
                    )}

                    {activeMenu === 'notification' && (
                        <div className="space-y-5 text-[30px]">
                            <div className="flex items-center justify-between">
                                <p>Likes on my post</p>
                                <Toggle enabled />
                            </div>
                            <div className="flex items-center justify-between">
                                <p>Comments on my post</p>
                                <Toggle enabled />
                            </div>
                            <div className="flex items-center justify-between">
                                <p>Email Notifications</p>
                                <Toggle enabled />
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </SocialLayout>
    );
}
