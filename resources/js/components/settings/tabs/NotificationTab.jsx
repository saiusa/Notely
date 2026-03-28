import React from 'react';
import { Switch } from '../controls';

export default function NotificationTab({ notifLikes, setNotifLikes, notifComments, setNotifComments, notifEmail, setNotifEmail }) {
    return (
        <div className="settings-tab settings-tab--notification">
            <div className="settings-tab__body settings-tab__body--large-gap">
                <div className="settings-tab__toggle-row">
                    <p className="settings-tab__toggle-label">Likes on my post</p>
                    <Switch enabled={notifLikes} onToggle={() => setNotifLikes((prev) => !prev)} />
                </div>

                <div className="settings-tab__toggle-row">
                    <p className="settings-tab__toggle-label">Comments on my post</p>
                    <Switch enabled={notifComments} onToggle={() => setNotifComments((prev) => !prev)} />
                </div>

                <div className="settings-tab__toggle-row">
                    <p className="settings-tab__toggle-label">Email Notifications</p>
                    <Switch enabled={notifEmail} onToggle={() => setNotifEmail((prev) => !prev)} />
                </div>
            </div>
        </div>
    );
}
