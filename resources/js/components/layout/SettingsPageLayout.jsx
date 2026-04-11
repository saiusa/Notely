import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import notificationService from '../../services/notificationService';
import '../../../sass/components/layout/SettingsPageLayout.scss';

export default function SettingsPageLayout(props) {
    const {
        activeNav = 'settings',
        navbarMode = 'default',
        title = 'Settings',
        showBack,
        onBack,
        notificationCount = 0,
        children,
    } = props;

    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchUnreadCount();
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await notificationService.getUnreadCount();
            setUnreadCount(response.unread_count || 0);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    const handleNotificationClick = () => {
        setShowNotifications((prev) => !prev);
    };

    const handleCloseNotifications = () => {
        setShowNotifications(false);
    };

    return (
        <div className="settings-page-layout__wrapper">
            {/* Sidebar */}
            <Sidebar active={activeNav} />

            {/* Main Content */}
            <div className="settings-page-layout__main">
                {/* Top Navbar */}
                <TopNavbar
                    mode={navbarMode}
                    title={title}
                    showBack={showBack}
                    onBack={onBack}
                    notificationCount={unreadCount}
                    notificationActive={showNotifications}
                    onNotificationClick={handleNotificationClick}
                />

                {/* Content Area */}
                <div className="settings-page-layout__content-area">
                    <main className="settings-page-layout__main-content">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
