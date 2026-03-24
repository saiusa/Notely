import React, { useMemo, useState } from 'react';
import SocialLayout from '../components/layout/SocialLayout';
import SettingsLayout from '../components/settings/SettingsLayout';
import { COUNTRY_OPTIONS } from '../components/settings/constants';
import AccountTab from '../components/settings/tabs/AccountTab';
import SecurityTab from '../components/settings/tabs/SecurityTab';
import PrivacyTab from '../components/settings/tabs/PrivacyTab';
import NotificationTab from '../components/settings/tabs/NotificationTab';
import DeactivateAccountModal from '../components/settings/modals/DeactivateAccountModal';
import TwoFactorModal from '../components/settings/modals/TwoFactorModal';

export default function SettingsPage() {
    const [activeMenu, setActiveMenu] = useState('account');

    const [username, setUsername] = useState('jin.bts');
    const [email, setEmail] = useState('jin.bts@gmail.com');
    const [country, setCountry] = useState(COUNTRY_OPTIONS[0]);
    const [phone, setPhone] = useState('000-0000-000');
    const [showCountryMenu, setShowCountryMenu] = useState(false);

    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [deactivateInput, setDeactivateInput] = useState('');
    const [deactivateDone, setDeactivateDone] = useState(false);

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
    const [twoFactorStep, setTwoFactorStep] = useState('credentials');
    const [twoFactorUsername, setTwoFactorUsername] = useState('');
    const [twoFactorPassword, setTwoFactorPassword] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [sampleCode, setSampleCode] = useState('');

    const [defaultPrivacy, setDefaultPrivacy] = useState('public');
    const [hideComments, setHideComments] = useState(false);
    const [showReactions, setShowReactions] = useState(true);

    const [notifLikes, setNotifLikes] = useState(true);
    const [notifComments, setNotifComments] = useState(true);
    const [notifEmail, setNotifEmail] = useState(true);

    const deactivateMatches = useMemo(() => deactivateInput.trim() === username.trim(), [deactivateInput, username]);

    const handleCountrySelect = (selected) => {
        setCountry(selected);
        setPhone(selected.placeholder);
        setShowCountryMenu(false);
    };

    const handleDeactivateConfirm = () => {
        if (!deactivateMatches) return;
        setDeactivateDone(true);
        setShowDeactivateModal(false);
        setDeactivateInput('');
    };

    const handleToggleTwoFactor = () => {
        if (twoFactorEnabled) {
            setTwoFactorEnabled(false);
            return;
        }

        setTwoFactorStep('credentials');
        setTwoFactorUsername(username);
        setTwoFactorPassword('');
        setTwoFactorCode('');
        setSampleCode('');
        setShowTwoFactorModal(true);
    };

    const handleSendCode = () => {
        if (!twoFactorUsername.trim() || !twoFactorPassword.trim()) return;

        const generated = String(Math.floor(100000 + Math.random() * 900000));
        setSampleCode(generated);
        setTwoFactorStep('code');
    };

    const handleActivateTwoFactor = () => {
        if (twoFactorCode.trim() !== sampleCode) return;

        setTwoFactorEnabled(true);
        setShowTwoFactorModal(false);
        setTwoFactorCode('');
        setTwoFactorPassword('');
    };

    return (
        <SocialLayout activeNav="settings" navbarMode="title" title="Settings">
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
                        onOpenDeactivate={() => setShowDeactivateModal(true)}
                        deactivateDone={deactivateDone}
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
                    />
                )}

                {activeMenu === 'privacy' && (
                    <PrivacyTab
                        defaultPrivacy={defaultPrivacy}
                        setDefaultPrivacy={setDefaultPrivacy}
                        hideComments={hideComments}
                        setHideComments={setHideComments}
                        showReactions={showReactions}
                        setShowReactions={setShowReactions}
                    />
                )}

                {activeMenu === 'notification' && (
                    <NotificationTab
                        notifLikes={notifLikes}
                        setNotifLikes={setNotifLikes}
                        notifComments={notifComments}
                        setNotifComments={setNotifComments}
                        notifEmail={notifEmail}
                        setNotifEmail={setNotifEmail}
                    />
                )}
            </SettingsLayout>

            <DeactivateAccountModal
                open={showDeactivateModal}
                usernameInput={deactivateInput}
                setUsernameInput={setDeactivateInput}
                canConfirm={deactivateMatches}
                onCancel={() => {
                    setShowDeactivateModal(false);
                    setDeactivateInput('');
                }}
                onConfirm={handleDeactivateConfirm}
            />

            <TwoFactorModal
                open={showTwoFactorModal}
                step={twoFactorStep}
                username={twoFactorUsername}
                setUsername={setTwoFactorUsername}
                password={twoFactorPassword}
                setPassword={setTwoFactorPassword}
                code={twoFactorCode}
                setCode={setTwoFactorCode}
                sampleCode={sampleCode}
                onCancel={() => setShowTwoFactorModal(false)}
                onSendCode={handleSendCode}
                onActivate={handleActivateTwoFactor}
            />
        </SocialLayout>
    );
}
