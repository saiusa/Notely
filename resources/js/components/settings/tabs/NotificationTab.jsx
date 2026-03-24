import React from 'react';
import { Switch } from '../controls';

export default function NotificationTab({ notifLikes, setNotifLikes, notifComments, setNotifComments, notifEmail, setNotifEmail }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <p className="text-[14px] font-medium text-white">Likes on my post</p>
                <Switch enabled={notifLikes} onToggle={() => setNotifLikes((prev) => !prev)} />
            </div>

            <div className="flex items-center justify-between">
                <p className="text-[14px] font-medium text-white">Comments on my post</p>
                <Switch enabled={notifComments} onToggle={() => setNotifComments((prev) => !prev)} />
            </div>

            <div className="flex items-center justify-between">
                <p className="text-[14px] font-medium text-white">Email Notifications</p>
                <Switch enabled={notifEmail} onToggle={() => setNotifEmail((prev) => !prev)} />
            </div>
        </div>
    );
}
