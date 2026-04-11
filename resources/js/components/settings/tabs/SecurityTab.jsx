import React from 'react';
import Loader from '../../common/Loader';
import { Input, Label, Switch } from '../controls';

export default function SecurityTab({
    showChangePassword,
    setShowChangePassword,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    twoFactorEnabled,
    onToggleTwoFactor,
    saving = false,
    onSavePassword,
}) {
    return (
        <div className="settings-tab settings-tab--security">
            {!showChangePassword ? (
                <div className="settings-tab__body settings-tab__body--large-gap">
                    <button
                        type="button"
                        onClick={() => setShowChangePassword(true)}
                        className="settings-tab__link-button"
                    >
                        Change Password
                    </button>

                    <div className="settings-tab__toggle-row settings-tab__toggle-row--title">
                        <p className="settings-tab__toggle-title">Two-Factor Authentication</p>
                        <Switch enabled={twoFactorEnabled} onToggle={onToggleTwoFactor} />
                    </div>
                </div>
            ) : (
                <div className="settings-tab__body settings-tab__body--compact-gap">
                    <label className="settings-tab__label-wrap">
                        <Label>Current Password</Label>
                        <Input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                        />
                    </label>
                    <label className="settings-tab__label-wrap">
                        <Label>New Password</Label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter New Password"
                        />
                    </label>
                    <label className="settings-tab__label-wrap">
                        <Label>Confirm Password</Label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </label>
                </div>
            )}

            {showChangePassword && (
                <div className="settings-tab__actions">
                    <button
                        type="button"
                        onClick={() => {
                            setShowChangePassword(false);
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                        }}
                        className="settings-tab__text-button"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={onSavePassword}
                        className="settings-tab__primary-button settings-tab__primary-button--small"
                    >
                        {saving ? <Loader /> : 'Save'}
                    </button>
                </div>
            )}
        </div>
    );
}
