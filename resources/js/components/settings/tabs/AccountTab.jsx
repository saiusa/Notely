import React from 'react';
import Loader from '../../common/Loader';
import { Input, Label } from '../controls';

export default function AccountTab({
    username,
    setUsername,
    email,
    setEmail,
    onOpenDeactivate,
    deactivateDone,
    saving = false,
    onSave,
    isDirty = false,
    onCancel,
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
            </div>

            {isDirty && (
                <div className="settings-tab__actions">
                    <button type="button" onClick={onCancel} className="settings-tab__text-button">
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={onSave}
                        className="settings-tab__primary-button settings-tab__primary-button--small"
                    >
                        {saving ? <Loader /> : 'Save'}
                    </button>
                </div>
            )}
        </div>
    );
}
