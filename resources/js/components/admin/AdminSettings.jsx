/**
 * components/admin/AdminSettings.jsx
 * Admin System Settings — global app-wide configuration controls
 *
 * Features:
 *  - Card 1: Feature Toggles (maintenance mode, disable registrations)
 *  - Card 2: Global Announcement banner textarea
 *  - Save button with loading state + inline success / error toast
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../services/api';
import '../../../sass/components/admin/AdminSettings.scss';

const MAX_ANNOUNCEMENT = 500;

// ─── Reusable Toggle Switch ───────────────────────────────────────────────────
function ToggleSwitch({ id, checked, onChange, danger = false }) {
    return (
        <label
            className={`toggle-switch${danger ? ' toggle-switch--danger' : ''}`}
            htmlFor={id}
        >
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={e => onChange(e.target.checked)}
            />
            <span className="toggle-switch__track">
                <span className="toggle-switch__thumb" />
            </span>
        </label>
    );
}

// ─── Settings Card wrapper ────────────────────────────────────────────────────
function SettingsCard({ iconName, iconVariant = 'info', title, description, children }) {
    return (
        <div className="settings-card">
            <div className="settings-card__header">
                <div className={`settings-card__icon settings-card__icon--${iconVariant}`}>
                    <span className="material-symbols-outlined">{iconName}</span>
                </div>
                <div className="settings-card__title-wrap">
                    <h3 className="settings-card__title">{title}</h3>
                    {description && <p className="settings-card__desc">{description}</p>}
                </div>
            </div>
            <div className="settings-card__body">{children}</div>
        </div>
    );
}

// ─── AdminSettings (page) ─────────────────────────────────────────────────────
export default function AdminSettings() {
    const [settings,  setSettings]  = useState(null);
    const [loading,   setLoading]   = useState(true);
    const [saving,    setSaving]    = useState(false);
    const [toast,     setToast]     = useState(null); // { type: 'success'|'error', msg }
    const toastTimer = useRef(null);

    // Local form state — broken out for controlled inputs
    const [maintenanceMode,      setMaintenanceMode]      = useState(false);
    const [disableRegistrations, setDisableRegistrations] = useState(false);
    const [announcement,         setAnnouncement]         = useState('');

    // ── Fetch ────────────────────────────────────────────────────────────────
    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/settings');
            if (res.data?.success) {
                const s = res.data.settings;
                setSettings(s);
                setMaintenanceMode(!!s.maintenance_mode);
                setDisableRegistrations(!!s.disable_registrations);
                setAnnouncement(s.global_announcement ?? '');
            }
        } catch (err) {
            console.error('Failed to load settings:', err);
            showToast('error', 'Could not load settings. Please refresh.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSettings(); }, [fetchSettings]);

    // ── Toast helper ─────────────────────────────────────────────────────────
    const showToast = (type, msg) => {
        setToast({ type, msg });
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 4000);
    };

    // ── Save ─────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (announcement.length > MAX_ANNOUNCEMENT) {
            showToast('error', `Announcement must be ${MAX_ANNOUNCEMENT} characters or fewer.`);
            return;
        }

        setSaving(true);
        try {
            const res = await api.put('/admin/settings', {
                maintenance_mode:      maintenanceMode,
                disable_registrations: disableRegistrations,
                global_announcement:   announcement.trim() || null,
            });

            if (res.data?.success) {
                setSettings(res.data.settings);
                showToast('success', 'Settings saved successfully!');
            }
        } catch (err) {
            const msg = err.response?.data?.message ?? 'Failed to save settings. Please try again.';
            showToast('error', msg);
            console.error('Save settings error:', err);
        } finally {
            setSaving(false);
        }
    };

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="admin-settings">
                {/* Card skeletons — one for toggles, one for announcement */}
                {[{ lines: 2, bodyH: 110 }, { lines: 0, bodyH: 130 }].map((card, i) => (
                    <div key={i} className="animate-pulse settings-card" style={{ opacity: 0.65 }}>
                        {/* Card header */}
                        <div className="settings-card__header">
                            <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(255,255,255,0.09)', flexShrink: 0 }} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
                                <div style={{ width: '38%', height: 14, borderRadius: 4, background: 'rgba(255,255,255,0.09)' }} />
                                <div style={{ width: '62%', height: 10, borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
                            </div>
                        </div>
                        {/* Card body */}
                        <div style={{ height: card.bodyH, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {card.lines > 0
                                ? [...Array(card.lines)].map((_, j) => (
                                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                                            <div style={{ height: 12, width: '45%', borderRadius: 4, background: 'rgba(255,255,255,0.08)' }} />
                                            <div style={{ height: 9, width: '70%', borderRadius: 4, background: 'rgba(255,255,255,0.05)' }} />
                                        </div>
                                        <div style={{ width: 44, height: 24, borderRadius: 9999, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
                                    </div>
                                ))
                                : <div style={{ height: '100%', borderRadius: 8, background: 'rgba(255,255,255,0.06)' }} />
                            }
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const announcementLen = announcement.length;
    const overLimit = announcementLen > MAX_ANNOUNCEMENT;

    return (
        <div className="admin-settings">

            {/* ── Card 1: Feature Toggles ────────────────────────────── */}
            <SettingsCard
                iconName="tune"
                iconVariant="info"
                title="Feature Controls"
                description="Toggle global app states. Changes take effect immediately for all users."
            >
                {/* Maintenance Mode */}
                <div className="toggle-row">
                    <div className="toggle-row__info">
                        <span className="toggle-row__label">Maintenance Mode</span>
                        <span className="toggle-row__sublabel">
                            Non-admin users will be shown a maintenance screen and cannot access the app.
                        </span>
                        {maintenanceMode && (
                            <span className="toggle-row__warning">
                                <span className="material-symbols-outlined">warning</span>
                                App is currently locked down for regular users
                            </span>
                        )}
                    </div>
                    <ToggleSwitch
                        id="toggle-maintenance"
                        checked={maintenanceMode}
                        onChange={setMaintenanceMode}
                        danger
                    />
                </div>

                {/* Disable Registrations */}
                <div className="toggle-row">
                    <div className="toggle-row__info">
                        <span className="toggle-row__label">Disable New Sign-ups</span>
                        <span className="toggle-row__sublabel">
                            Prevents new accounts from being created. Existing users can still log in.
                        </span>
                        {disableRegistrations && (
                            <span className="toggle-row__warning">
                                <span className="material-symbols-outlined">block</span>
                                Registration is currently closed
                            </span>
                        )}
                    </div>
                    <ToggleSwitch
                        id="toggle-registrations"
                        checked={disableRegistrations}
                        onChange={setDisableRegistrations}
                    />
                </div>
            </SettingsCard>

            {/* ── Card 2: Global Announcement ────────────────────────── */}
            <SettingsCard
                iconName="campaign"
                iconVariant="warning"
                title="Global Announcement"
                description="Displays a banner message to all logged-in users on every page."
            >
                <div className="announcement-row">
                    <label className="announcement-row__label" htmlFor="global-announcement">
                        Banner Message
                    </label>
                    <textarea
                        id="global-announcement"
                        className="announcement-row__textarea"
                        placeholder="e.g. We will be undergoing scheduled maintenance on Saturday at 2 AM UTC..."
                        value={announcement}
                        onChange={e => setAnnouncement(e.target.value)}
                        rows={4}
                    />
                    <div className={`announcement-row__hint${overLimit ? ' over-limit' : ''}`}>
                        <span>Leave empty to hide the banner</span>
                        <span className="hint-max">
                            {announcementLen} / {MAX_ANNOUNCEMENT}
                        </span>
                    </div>
                </div>
            </SettingsCard>

            {/* ── Save Bar ───────────────────────────────────────────── */}
            <div className="admin-settings__save-bar">
                {/* Inline toast */}
                {toast && (
                    <div className={`admin-settings__toast admin-settings__toast--${toast.type}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                            {toast.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        {toast.msg}
                    </div>
                )}

                <button
                    className="admin-settings__save-btn"
                    onClick={handleSave}
                    disabled={saving || overLimit}
                    id="save-system-settings"
                >
                    {saving ? (
                        <><span className="btn-spinner" />Saving...</>
                    ) : (
                        <><span className="material-symbols-outlined" style={{ fontSize: 17 }}>save</span>Save Changes</>
                    )}
                </button>
            </div>
        </div>
    );
}
