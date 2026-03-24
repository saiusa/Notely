import React from 'react';
import { Switch } from '../controls';

export default function PrivacyTab({ defaultPrivacy, setDefaultPrivacy, hideComments, setHideComments, showReactions, setShowReactions }) {
    return (
        <div className="space-y-6">
            <div>
                <p className="mb-2 text-[16px] font-semibold text-white">Default Post Privacy</p>
                <label className="mb-2 flex items-center gap-2 text-[14px] text-white">
                    <input
                        type="checkbox"
                        checked={defaultPrivacy === 'public'}
                        onChange={() => setDefaultPrivacy('public')}
                        className="h-4 w-4 accent-[#785ebf]"
                    />
                    Public
                </label>
                <label className="flex items-center gap-2 text-[14px] text-white">
                    <input
                        type="checkbox"
                        checked={defaultPrivacy === 'private'}
                        onChange={() => setDefaultPrivacy('private')}
                        className="h-4 w-4 accent-[#785ebf]"
                    />
                    Private
                </label>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-[14px] font-medium text-white">Hide comments on my posts</p>
                <Switch enabled={hideComments} onToggle={() => setHideComments((prev) => !prev)} />
            </div>

            <div className="flex items-center justify-between">
                <p className="text-[14px] font-medium text-white">Show reaction counts</p>
                <Switch enabled={showReactions} onToggle={() => setShowReactions((prev) => !prev)} />
            </div>
        </div>
    );
}
