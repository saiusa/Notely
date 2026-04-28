/**
 * components/common/UserAvatar.jsx
 *
 * Universal avatar component. Usage: <UserAvatar user={userObject} size="md" />
 *
 * Priority chain:
 *   1. user.avatar_url              – direct upload field (future)
 *   2. user.avatar                  – legacy alias
 *   3. user.profile.profile_picture – eager-loaded relation
 *
 * Fallback (no image or broken image):
 *   - First letter of user.first_name  → else user.profile.first_name → else user.username
 *   - Background gradient is deterministic from user_id (8-color palette)
 *
 * Props:
 *   user       { avatar_url?, avatar?, profile?, first_name?, username?, user_id? }
 *   size       'xs' | 'sm' | 'md' | 'lg' | 'xl'
 *   className  extra CSS classes merged onto root element
 *   style      extra inline styles
 */
import React, { useState } from 'react';

const SIZE_MAP = {
    xs: { px: 24,  font: 10 },
    sm: { px: 32,  font: 13 },
    md: { px: 40,  font: 15 },
    lg: { px: 64,  font: 24 },
    xl: { px: 96,  font: 36 },
};

// 8 curated dark-mode-friendly gradients — deterministic by user_id
const GRADIENTS = [
    ['#7c3aed', '#6d28d9'],  // violet
    ['#2563eb', '#1d4ed8'],  // blue
    ['#0891b2', '#0e7490'],  // cyan
    ['#059669', '#047857'],  // emerald
    ['#d97706', '#b45309'],  // amber
    ['#dc2626', '#b91c1c'],  // red
    ['#db2777', '#be185d'],  // pink
    ['#4f46e5', '#7c3aed'],  // indigo-violet
];

function pickGradient(userId) {
    const id = typeof userId === 'number' ? userId : parseInt(userId, 10) || 0;
    const [from, to] = GRADIENTS[id % GRADIENTS.length];
    return `linear-gradient(135deg, ${from}, ${to})`;
}

function resolveImageSrc(raw) {
    if (!raw) return null;
    if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('data:')) {
        return raw;
    }
    return raw.startsWith('/') ? raw : `/${raw}`;
}

export default function UserAvatar({ user, size = 'md', className = '', style = {} }) {
    const [imgError, setImgError] = useState(false);

    const { px, font } = SIZE_MAP[size] ?? SIZE_MAP.md;

    // ── Resolve avatar URL (priority chain) ──────────────────────────────────
    const avatarSrc = (() => {
        const raw =
            user?.avatar_url ||
            user?.avatar ||
            user?.profile?.profile_picture ||
            null;
        return raw ? resolveImageSrc(raw) : null;
    })();

    // ── Resolve fallback initial ─────────────────────────────────────────────
    const initial = (
        user?.first_name ||
        user?.profile?.first_name ||
        user?.username ||
        user?.name ||
        '?'
    ).charAt(0).toUpperCase();

    const baseStyle = {
        width:          px,
        height:         px,
        borderRadius:   '50%',
        flexShrink:     0,
        objectFit:      'cover',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       font,
        fontWeight:     700,
        userSelect:     'none',
        ...style,
    };

    // ── Render image if available ────────────────────────────────────────────
    if (avatarSrc && !imgError) {
        return (
            <img
                src={avatarSrc}
                alt={user?.username ?? 'User'}
                onError={() => setImgError(true)}
                className={className}
                style={{ ...baseStyle, display: 'block' }}
                loading="lazy"
            />
        );
    }

    // ── Fallback: initial letter with deterministic gradient ─────────────────
    return (
        <div
            className={className}
            style={{
                ...baseStyle,
                background: pickGradient(user?.user_id ?? user?.id ?? 0),
                color: '#fff',
            }}
            aria-label={user?.username ?? 'User'}
        >
            {initial}
        </div>
    );
}
