import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import RecentJournals from './RecentJournals';
import notificationService from '../../services/notificationService';
import '../../../sass/components/layout/SocialLayout.scss';

export default function SocialLayout(props) {
    const {
        activeNav,
        communitySub,
        onCommunitySubChange,
        navbarMode,
        title,
        showBack,
        onBack,
        activeTab,
        onTabChange,
        onFilterChange = () => {},
        currentFilter = 'recent',
        notificationCount = 0,
        showRecentJournals = true,
        children,
    } = props;

    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread count on mount
    useEffect(() => {
        fetchUnreadCount();
    }, []);

    /**
     * Fetch unread notification count (memoized)
     */
    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await notificationService.getUnreadCount();
            setUnreadCount(response.unread_count || 0);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, []);

    /**
     * Handle notification modal toggle (memoized)
     */
    const handleNotificationClick = useCallback(() => {
        setShowNotifications((prev) => !prev);
    }, []);

    /**
     * Close notification modal (memoized)
     */
    const handleCloseNotifications = useCallback(() => {
        setShowNotifications(false);
    }, []);

    /**
     * Update unread count when notification is read
     */
    const handleNotificationRead = () => {
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const contentContainerClassName =
        navbarMode === 'tabs' ? 'social-layout__content-container--tabs' : 'social-layout__content-container--default';

    return (
        <div className="social-layout__wrapper">
            {/* Sidebar */}
            <Sidebar
                active={activeNav}
                communitySub={communitySub}
                onCommunitySubChange={onCommunitySubChange}
            />

            {/* Main Content */}
            <div className="social-layout__main">
                {/* Top Navbar */}
                <TopNavbar
                    mode={navbarMode}
                    title={title}
                    showBack={showBack}
                    onBack={onBack}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    onFilterChange={onFilterChange}
                    currentFilter={currentFilter}
                    notificationCount={unreadCount}
                    notificationActive={showNotifications}
                    onNotificationClick={handleNotificationClick}
                    onCloseNotification={handleCloseNotifications}
                />

                <div className="social-layout__content-area">
                    {/* Main */}
                    <main className="social-layout__main-content">
                        <div className={contentContainerClassName}>
                            {children}
                        </div>
                    </main>

                    {/* Recent Journals */}
                    {showRecentJournals && (
                        <aside className="social-layout__recent-journals">
                            <RecentJournals />
                        </aside>
                    )}
                </div>
            </div>
        </div>
    );
}
