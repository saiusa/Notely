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
        <div className="settings-tab settings-tab--account">
            <div className="settings-tab__body settings-tab__body--compact-gap">
                <label className="settings-tab__label-wrap">
                    <Label>Username</Label>
                    <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>

                <label className="settings-tab__label-wrap">
                    <Label>Email</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>

                <div className="settings-tab__phone-section">
                    <Label>Phone Number</Label>
                    <div className="settings-tab__phone-row">
                        <div className="settings-tab__country-select-wrap">
                            <button
                                type="button"
                                onClick={() => setShowCountryMenu((prev) => !prev)}
                                className="settings-tab__country-select"
                            >
                                {country.code}
                                <span className="material-symbols-outlined settings-tab__country-select-icon">keyboard_arrow_down</span>
                            </button>

                            {showCountryMenu && (
                                <div className="settings-tab__country-menu">
                                    {countries.map((item) => (
                                        <button
                                            key={item.key}
                                            type="button"
                                            onClick={() => onCountrySelect(item)}
                                            className="settings-tab__country-menu-item"
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

            </div>

            <div className="settings-tab__actions">
                <button type="button" className="settings-tab__text-button">
                    Cancel
                </button>
                <button
                    type="button"
                    className="settings-tab__primary-button settings-tab__primary-button--small"
                >
                    Save
                </button>
            </div>
        </div>
    );
}
