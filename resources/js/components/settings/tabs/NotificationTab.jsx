import React from 'react';
import { Switch } from '../controls';

export default function NotificationTab({ 
    notifLikes, 
    setNotifLikes, 
    notifComments, 
    setNotifComments, 
    notifReplies, 
    setNotifReplies 
}) {
    return (
        <div className="settings-tab settings-tab--notification">
            <div className="settings-tab__body settings-tab__body--large-gap">
                <div className="settings-tab__notification-group">
                    <h3 className="settings-tab__group-title">In-App Notifications</h3>
                    <div className="settings-tab__group-content">
                        <div className="settings-tab__toggle-row">
                            <p className="settings-tab__toggle-label">Likes on post</p>
                            <Switch enabled={notifLikes} onToggle={() => setNotifLikes((prev) => !prev)} />
                        </div>

                        <div className="settings-tab__toggle-row">
                            <p className="settings-tab__toggle-label">Comments on post</p>
                            <Switch enabled={notifComments} onToggle={() => setNotifComments((prev) => !prev)} />
                        </div>

                        <div className="settings-tab__toggle-row">
                            <p className="settings-tab__toggle-label">Reply on post</p>
                            <Switch enabled={notifReplies} onToggle={() => setNotifReplies((prev) => !prev)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
