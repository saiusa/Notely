import React, { useState } from 'react';
import Loader from '../../common/Loader';
import { Input, Label } from '../controls';

export default function SecurityTab({
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    saving = false,
    onSavePassword,
    onDeleteAccount,
    isDirty = false,
    onCancel,
}) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        setShowDeleteConfirm(false);
        onDeleteAccount();
    };

    return (
        <div className="settings-tab settings-tab--security">
            {/* Change Password Section - Always Visible */}
            <div className="settings-tab__body settings-tab__body--compact-gap">
                <h3 className="settings-tab__section-title">Change Password</h3>
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
                        placeholder="Enter new password"
                    />
                </label>
                <label className="settings-tab__label-wrap">
                    <Label>Confirm Password</Label>
                    <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                    />
                </label>
            </div>

            {/* Password Action Buttons - Only show if isDirty */}
            {isDirty && (
                <div className="settings-tab__actions">
                    <button type="button" onClick={onCancel} className="settings-tab__text-button">
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

            {/* Delete Account Section - Danger Zone */}
            <div className="settings-tab__danger-zone">
                <h3 className="settings-tab__danger-zone-title">Danger Zone</h3>
                <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="settings-tab__danger-button"
                >
                    Delete Account
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="settings-tab__delete-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="settings-tab__delete-modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="settings-tab__delete-modal-title">Delete Account?</h2>
                        <p className="settings-tab__delete-modal-message">
                            This action will deactivate your account and hide all your journal entries.
                        </p>
                        <p className="settings-tab__delete-modal-warning">
                            This action cannot be undone.
                        </p>
                        <div className="settings-tab__delete-modal-actions">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="settings-tab__text-button"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDelete}
                                className="settings-tab__delete-confirm-button"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
