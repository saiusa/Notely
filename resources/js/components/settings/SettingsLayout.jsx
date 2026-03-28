import React from 'react';
import { SETTINGS_MENU_ITEMS } from './constants';

function SettingsTabsNav({ activeMenu, onMenuChange }) {
    return (
        <aside className="settings-layout__nav">
            {SETTINGS_MENU_ITEMS.map(([key, label, icon]) => (
                <button
                    key={key}
                    type="button"
                    onClick={() => onMenuChange(key)}
                    className={`settings-layout__nav-item ${activeMenu === key ? 'settings-layout__nav-item--active' : ''}`}
                >
                    <span className="material-symbols-outlined settings-layout__nav-icon">{icon}</span>
                    {label}
                </button>
            ))}
        </aside>
    );
}

export default function SettingsLayout({ activeMenu, onMenuChange, children }) {
    return (
        <div className="settings-layout__grid">
            <SettingsTabsNav activeMenu={activeMenu} onMenuChange={onMenuChange} />
            <section className="settings-layout__content">{children}</section>
        </div>
    );
}
