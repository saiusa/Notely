import React from 'react';
import { Switch } from '../controls';

export default function PrivacyTab({ defaultPrivacy, setDefaultPrivacy, hideComments, setHideComments, showReactions, setShowReactions }) {
    return (
        <div className="settings-tab settings-tab--privacy">
            <div className="settings-tab__body settings-tab__body--large-gap">
                <div>
                    <p className="settings-tab__toggle-title settings-tab__toggle-title--small-gap">Default Post Privacy</p>
                    <label className="settings-tab__checkbox-row settings-tab__checkbox-row--spaced">
                        <input
                            type="checkbox"
                            checked={defaultPrivacy === 'public'}
                            onChange={() => setDefaultPrivacy('public')}
                            className="settings-tab__checkbox"
                        />
                        Public
                    </label>
                    <label className="settings-tab__checkbox-row">
                        <input
                            type="checkbox"
                            checked={defaultPrivacy === 'private'}
                            onChange={() => setDefaultPrivacy('private')}
                            className="settings-tab__checkbox"
                        />
                        Private
                    </label>
                </div>

                <div className="settings-tab__toggle-row">
                    <p className="settings-tab__toggle-label">Hide comments on my posts</p>
                    <Switch enabled={hideComments} onToggle={() => setHideComments((prev) => !prev)} />
                </div>

                <div className="settings-tab__toggle-row">
                    <p className="settings-tab__toggle-label">Show reaction counts</p>
                    <Switch enabled={showReactions} onToggle={() => setShowReactions((prev) => !prev)} />
                </div>
            </div>
        </div>
    );
}
