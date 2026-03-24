import React from 'react';
import { SETTINGS_MENU_ITEMS } from './constants';

function SettingsTabsNav({ activeMenu, onMenuChange }) {
    return (
        <aside className="rounded-[10px] bg-[#212633] p-4">
            {SETTINGS_MENU_ITEMS.map(([key, label, icon]) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => onMenuChange(key)}
                    className={`mb-2 flex h-[36px] w-full items-center gap-2 rounded-[9px] px-3 text-[14px] transition-colors ${
                        activeMenu === key ? 'bg-[#343b4f] text-white' : 'text-white hover:bg-[#2a3042]'
                    }`}
                >
                    <span className="material-symbols-outlined text-[18px]">{icon}</span>
                    {label}
                </button>
            ))}
        </aside>
    );
}

export default function SettingsLayout({ activeMenu, onMenuChange, children }) {
    return (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[225px_minmax(0,1fr)]">
            <SettingsTabsNav activeMenu={activeMenu} onMenuChange={onMenuChange} />
            <section className="rounded-[10px] bg-[#212633] p-6">{children}</section>
        </div>
    );
}
