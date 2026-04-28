/**
 * components/layout/SystemStateWrapper.jsx
 *
 * Wraps all NON-admin routes.
 * - Polls GET /system-status every 60 s (no auth required)
 * - Shows a dismissible top banner if global_announcement is set
 * - Shows a full-screen maintenance overlay for non-admin users
 *   when maintenance_mode is true
 */
import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import GlobalPostModal from './GlobalPostModal';
import '../../../sass/components/layout/SystemStateWrapper.scss';

const POLL_INTERVAL_MS = 60_000; // re-check every 60 s

export default function SystemStateWrapper({ children }) {
    const { user } = useAuth();
    const { pathname } = useLocation();

    const [status, setStatus] = useState({
        maintenance_mode:      false,
        disable_registrations: false,
        global_announcement:   null,
    });
    const [bannerDismissed, setBannerDismissed] = useState(false);
    const intervalRef = useRef(null);

    // ── Never run on admin routes — admins must never get locked out ──────────
    const isAdminRoute = pathname.startsWith('/admin');

    const fetchStatus = async () => {
        try {
            const res = await api.get('/system-status');
            setStatus({
                maintenance_mode:      !!res.data.maintenance_mode,
                disable_registrations: !!res.data.disable_registrations,
                global_announcement:   res.data.global_announcement ?? null,
            });
        } catch {
            // silently ignore — don't disrupt the app on network errors
        }
    };

    useEffect(() => {
        if (isAdminRoute) return; // skip entirely for admin pages

        fetchStatus();
        intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);

        return () => clearInterval(intervalRef.current);
    }, [isAdminRoute]);

    // Reset banner dismiss when the announcement text changes
    useEffect(() => {
        setBannerDismissed(false);
    }, [status.global_announcement]);

    // ── Derived display flags ──────────────────────────────────────────────────
    const showBanner      = !isAdminRoute && !!status.global_announcement && !bannerDismissed;
    const showMaintenance = !isAdminRoute && status.maintenance_mode && !user?.is_admin;

    return (
        <>
            {/* ── Announcement Banner ─────────────────────────────────────── */}
            {showBanner && (
                <div className="system-banner" role="alert" aria-live="polite">
                    <span className="material-symbols-outlined">campaign</span>
                    <span className="system-banner__text">{status.global_announcement}</span>
                    <button
                        className="system-banner__close"
                        onClick={() => setBannerDismissed(true)}
                        aria-label="Dismiss announcement"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                    </button>
                </div>
            )}

            {/* ── Offset wrapper so banner doesn't cover the navbar ───────── */}
            <div className={showBanner ? 'system-banner-offset' : ''}>
                {children}
            </div>

            {/* ── Maintenance Overlay ─────────────────────────────────────── */}
            {showMaintenance && (
                <div className="maintenance-overlay" role="dialog" aria-modal="true" aria-label="Maintenance mode">
                    <span className="maintenance-overlay__icon material-symbols-outlined">
                        engineering
                    </span>
                    <h1 className="maintenance-overlay__title">Under Scheduled Maintenance</h1>
                    <p className="maintenance-overlay__subtitle">
                        We are currently upgrading our systems. Please check back later.
                        Your data is safe.
                    </p>
                    <div className="maintenance-overlay__badge">
                        <span className="material-symbols-outlined">schedule</span>
                        We&apos;ll be back shortly
                    </div>
                </div>
            )}

            {/* ── Global Post Modal (Intercepts ?postId=xxx) ───────────────── */}
            <GlobalPostModal />
        </>
    );
}
