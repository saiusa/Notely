import React, { useRef, useEffect, useState } from 'react';
import '../../../sass/components/community/CommunityDetailHeader.scss';

/**
 * SVG placeholder for missing images
 */
const PLACEHOLDER_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%234a5568" width="400" height="300"/%3E%3Ctext x="50%" y="50%" font-family="system-ui" font-size="18" fill="%8e92a7" text-anchor="middle" dy=".3em"%3EImage unavailable%3C/text%3E%3C/svg%3E';

/**
 * Normalize image paths to ensure they're absolute from root
 */
const normalizeImagePath = (imagePath) => {
    if (!imagePath) return PLACEHOLDER_SVG;
    // If it already starts with /, return as-is
    if (imagePath.startsWith('/')) return imagePath;
    // Otherwise prepend /
    return `/${imagePath}`;
};

const handleImageError = (e) => {
    e.target.src = PLACEHOLDER_SVG;
    e.target.onerror = null; // Prevent infinite loop
};

export default function CommunityDetailHeader({
    community,
    currentUser,
    isJoined,
    showHeaderMenu,
    onToggleMenu,
    onCopyLink,
    isCopied,
    onReport,
    onEdit,
    onJoinCommunity,
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Derive user state variables
    const isCreator = currentUser && community?.user_id && currentUser.user_id === community.user_id;
    const userIsJoined = isJoined || isCreator; // Creators are always considered "joined"

    const handleEditClick = () => {
        setMenuOpen(false);
        if (onEdit) {
            onEdit(community);
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setMenuOpen(false);
        setShowToast(true);
        
        // Automatically close the notification after exactly 4 seconds (4000ms)
        setTimeout(() => setShowToast(false), 4000);
    };

    const handleCopyLinkClick = () => {
        handleCopyLink();
        if (onCopyLink) {
            onCopyLink();
        }
    };

    const handleReportClick = () => {
        setMenuOpen(false);
        if (onReport) {
            onReport();
        }
    };

    const handleLeaveClick = () => {
        setMenuOpen(false);
        if (onJoinCommunity) {
            onJoinCommunity(); // Toggle join/leave - since isJoined is true, this will leave
        }
    };
    return (
        <article className="community-detail-header__container">
            <img 
                src={normalizeImagePath(community.coverImage)} 
                alt={community.name} 
                className="community-detail-header__cover"
                onError={handleImageError}
            />

            <div className="community-detail-header__menu-container">
                <div className="community-detail-header__menu-wrap" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="community-detail-header__menu-btn"
                        aria-label="Community menu"
                    >
                        <span className="material-symbols-outlined community-detail-header__menu-icon">more_vert</span>
                    </button>

                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-[#1a1b26] rounded-xl shadow-2xl overflow-hidden z-50 py-1">
                            {isCreator ? (
                                // Creator menu: Edit, Copy link
                                <>
                                    <button
                                        type="button"
                                        onClick={handleEditClick}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-200 hover:bg-gray-800 active:text-purple-500 active:bg-purple-500/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            edit
                                        </span>
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCopyLinkClick}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-200 hover:bg-gray-800 active:text-purple-500 active:bg-purple-500/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            link
                                        </span>
                                        <span>Copy link</span>
                                    </button>
                                </>
                            ) : userIsJoined ? (
                                // Non-creator, joined member menu: Leave, Copy link, Report
                                <>
                                    <button
                                        type="button"
                                        onClick={handleLeaveClick}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-200 hover:bg-gray-800 active:text-red-500 active:bg-red-500/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            logout
                                        </span>
                                        <span>Leave</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCopyLinkClick}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-200 hover:bg-gray-800 active:text-purple-500 active:bg-purple-500/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            link
                                        </span>
                                        <span>Copy link</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleReportClick}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-200 hover:bg-gray-800 active:text-yellow-500 active:bg-yellow-500/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            report
                                        </span>
                                        <span>Report</span>
                                    </button>
                                </>
                            ) : (
                                // Non-creator, non-member menu: Copy link, Report
                                <>
                                    <button
                                        type="button"
                                        onClick={handleCopyLinkClick}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-200 hover:bg-gray-800 active:text-purple-500 active:bg-purple-500/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            link
                                        </span>
                                        <span>Copy link</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleReportClick}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-200 hover:bg-gray-800 active:text-yellow-500 active:bg-yellow-500/10 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">
                                            report
                                        </span>
                                        <span>Report</span>
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3 px-6 py-3 bg-[#785ebf] text-white rounded-lg shadow-2xl">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        <span className="font-medium">Community link copied</span>
                    </div>
                </div>
            )}

            <div className="community-detail-header__bottom">
                <div className="community-detail-header__info">
                    <h2 className="community-detail-header__name">{community.name}</h2>
                    <p className="community-detail-header__description">{community.description}</p>
                </div>

                <div className="community-detail-header__actions">
                    {/* Join button - one-way action: only clickable when NOT joined */}
                    <button
                        type="button"
                        onClick={!userIsJoined ? onJoinCommunity : undefined}
                        disabled={userIsJoined}
                        className={`community-detail-header__join-btn ${
                            isCreator
                                ? 'community-detail-header__join-btn--owner'
                                : userIsJoined
                                ? 'community-detail-header__join-btn--joined'
                                : 'community-detail-header__join-btn--default'
                        }`}
                    >
                        {isCreator ? 'Owner' : userIsJoined ? 'Joined' : 'Join Community'}
                    </button>
                </div>
            </div>
        </article>
    );
}

