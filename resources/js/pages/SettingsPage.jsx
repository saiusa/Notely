import '../../sass/components/settings/index.scss';
import React, { useEffect, useState } from 'react';
import SocialLayout from '../components/layout/SocialLayout';
import SettingsLayout from '../components/settings/SettingsLayout';
import { COUNTRY_OPTIONS } from '../components/settings/constants';
import AccountTab from '../components/settings/tabs/AccountTab';
import SecurityTab from '../components/settings/tabs/SecurityTab';
import PrivacyTab from '../components/settings/tabs/PrivacyTab';
import NotificationTab from '../components/settings/tabs/NotificationTab';
import TwoFactorModal from '../components/settings/modals/TwoFactorModal';
import { useAuth } from '../context/AuthContext';
import settingsService from '../services/settingsService';

export default function SettingsPage() {
    const { user, logout, refreshUser } = useAuth();
    const [activeMenu, setActiveMenu] = useState('account');
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // Account fields — initialized from auth user
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [country, setCountry] = useState(COUNTRY_OPTIONS[0]);
    const [phone, setPhone] = useState('');
    const [showCountryMenu, setShowCountryMenu] = useState(false);

    // Security
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);

    // Privacy
    const [defaultPrivacy, setDefaultPrivacy] = useState('public');
    const [hideComments, setHideComments] = useState(false);
    const [showReactions, setShowReactions] = useState(true);

    // Notifications
    const [notifLikes, setNotifLikes] = useState(true);
    const [notifComments, setNotifComments] = useState(true);
    const [notifEmail, setNotifEmail] = useState(true);

    // Load user settings on mount
    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setEmail(user.email || '');
            setPhone(user.phone_number || '');

            if (user.setting) {
                setTwoFactorEnabled(user.setting.two_factor_enabled || false);
                setDefaultPrivacy(user.setting.default_post_privacy || 'public');
                setHideComments(user.setting.hide_comments || false);
                setShowReactions(user.setting.show_reaction_counts !== false);
                setNotifLikes(user.setting.notify_likes !== false);
                setNotifComments(user.setting.notify_comments !== false);
                setNotifEmail(user.setting.email_notifications !== false);
            }
        }
    }, [user]);

    const handleCountrySelect = (selected) => {
        setCountry(selected);
        setPhone(selected.placeholder);
        setShowCountryMenu(false);
    };

    // ── Save Account ──
    const handleSaveAccount = async () => {
        setSaving(true);
        setSaveMessage('');
        try {
            await settingsService.updateAccount({ username, email, phone_number: phone });
            await refreshUser();
            setSaveMessage('Account updated successfully.');
        } catch (err) {
            setSaveMessage(err.response?.data?.message || 'Failed to update account.');
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    // ── Save Password ──
    const handleSavePassword = async () => {
        if (newPassword !== confirmPassword) {
            setSaveMessage('Passwords do not match.');
            return;
        }
        setSaving(true);
        setSaveMessage('');
        try {
            await settingsService.updatePassword({
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowChangePassword(false);
            setSaveMessage('Password updated successfully.');
        } catch (err) {
            setSaveMessage(err.response?.data?.message || 'Failed to update password.');
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    // ── Save Privacy ──
    const handleSavePrivacy = async (field, value) => {
        try {
            await settingsService.updatePrivacy({
                default_post_privacy: field === 'defaultPrivacy' ? value : defaultPrivacy,
                hide_comments: field === 'hideComments' ? value : hideComments,
                show_reaction_counts: field === 'showReactions' ? value : showReactions,
            });
        } catch (_) {
            // ignore
        }
    };

    // ── Save Notifications ──
    const handleSaveNotifications = async (field, value) => {
        try {
            await settingsService.updateNotifications({
                notify_likes: field === 'notifLikes' ? value : notifLikes,
                notify_comments: field === 'notifComments' ? value : notifComments,
                email_notifications: field === 'notifEmail' ? value : notifEmail,
            });
        } catch (_) {
            // ignore
        }
    };

    // ── 2FA ──
    const handleToggleTwoFactor = () => {
        if (twoFactorEnabled) {
            setTwoFactorEnabled(false);
            settingsService.updateTwoFactor({ two_factor_enabled: false }).catch(() => {});
            return;
        }
        setShowTwoFactorModal(true);
    };

    const handleActivateTwoFactor = async () => {
        try {
            await settingsService.updateTwoFactor({ two_factor_enabled: true });
        } catch (_) {
            // ignore
        }
        setTwoFactorEnabled(true);
        setShowTwoFactorModal(false);
    };

    return (
        <SocialLayout activeNav="settings" navbarMode="title" title="Settings">
            {saveMessage && (
                <div style={{
                    padding: '8px 16px',
                    marginBottom: '12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    background: saveMessage.includes('Failed') || saveMessage.includes('match') ? '#3a1c1c' : '#1c3a2a',
                    color: saveMessage.includes('Failed') || saveMessage.includes('match') ? '#ff6b6b' : '#4ade80',
                }}>
                    {saveMessage}
                </div>
            )}
            <SettingsLayout activeMenu={activeMenu} onMenuChange={setActiveMenu}>
                {activeMenu === 'account' && (
                    <AccountTab
                        username={username}
                        setUsername={setUsername}
                        email={email}
                        setEmail={setEmail}
                        country={country}
                        phone={phone}
                        setPhone={setPhone}
                        countries={COUNTRY_OPTIONS}
                        showCountryMenu={showCountryMenu}
                        setShowCountryMenu={setShowCountryMenu}
                        onCountrySelect={handleCountrySelect}
                        onSave={handleSaveAccount}
                        saving={saving}
                    />
                )}

                {activeMenu === 'security' && (
                    <SecurityTab
                        showChangePassword={showChangePassword}
                        setShowChangePassword={setShowChangePassword}
                        currentPassword={currentPassword}
                        setCurrentPassword={setCurrentPassword}
                        newPassword={newPassword}
                        setNewPassword={setNewPassword}
                        confirmPassword={confirmPassword}
                        setConfirmPassword={setConfirmPassword}
                        twoFactorEnabled={twoFactorEnabled}
                        onToggleTwoFactor={handleToggleTwoFactor}
                        onSavePassword={handleSavePassword}
                        saving={saving}
                    />
                )}

                {activeMenu === 'privacy' && (
                    <PrivacyTab
                        defaultPrivacy={defaultPrivacy}
                        setDefaultPrivacy={(v) => { setDefaultPrivacy(v); handleSavePrivacy('defaultPrivacy', v); }}
                        hideComments={hideComments}
                        setHideComments={(v) => { setHideComments(v); handleSavePrivacy('hideComments', v); }}
                        showReactions={showReactions}
                        setShowReactions={(v) => { setShowReactions(v); handleSavePrivacy('showReactions', v); }}
                    />
                )}

                {activeMenu === 'notification' && (
                    <NotificationTab
                        notifLikes={notifLikes}
                        setNotifLikes={(v) => { setNotifLikes(v); handleSaveNotifications('notifLikes', v); }}
                        notifComments={notifComments}
                        setNotifComments={(v) => { setNotifComments(v); handleSaveNotifications('notifComments', v); }}
                        notifEmail={notifEmail}
                        setNotifEmail={(v) => { setNotifEmail(v); handleSaveNotifications('notifEmail', v); }}
                    />
                )}
            </SettingsLayout>

            <TwoFactorModal
                open={showTwoFactorModal}
                onCancel={() => setShowTwoFactorModal(false)}
                onActivate={handleActivateTwoFactor}
            />
        </SocialLayout>
    );
}
