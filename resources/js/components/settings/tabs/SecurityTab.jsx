import React from 'react';
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
}) {
    return (
        <div className="flex min-h-[420px] flex-col">
            {!showChangePassword ? (
                <div className="space-y-6">
                    <button
                        type="button"
                        onClick={() => setShowChangePassword(true)}
                        className="text-left text-[16px] font-semibold text-white transition-colors hover:text-[#9b84d8]"
                    >
                        Change Password
                    </button>

                    <div className="flex items-center justify-between">
                        <p className="text-[16px] font-semibold text-white">Two-Factor Authentication</p>
                        <Switch enabled={twoFactorEnabled} onToggle={onToggleTwoFactor} />
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <label className="block">
                        <Label>Current Password</Label>
                        <Input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                        />
                    </label>
                    <label className="block">
                        <Label>New Password</Label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter New Password"
                        />
                    </label>
                    <label className="block">
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
                <div className="mt-auto flex justify-end gap-5 pt-8">
                    <button
                        type="button"
                        onClick={() => {
                            setShowChangePassword(false);
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                        }}
                        className="text-[16px] font-medium text-[#e6e8ef] transition-colors hover:text-[#9b84d8]"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="h-[34px] w-[80px] rounded-[8px] bg-[#785ebf] text-[14px] font-semibold text-white transition-colors hover:bg-[#8c72d4]"
                    >
                        Save
                    </button>
                </div>
            )}
        </div>
    );
}
