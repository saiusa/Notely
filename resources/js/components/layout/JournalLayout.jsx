import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import notificationService from '../../services/notificationService';
import '../../../sass/components/layout/JournalLayout.scss';

export default function JournalLayout(props) {
    const {
        activeNav = 'journal',
        navbarMode = 'default',
        title = 'Journal',
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
        <div className="journal-layout__wrapper">
            {/* Sidebar */}
            <Sidebar active={activeNav} />

            {/* Main Content */}
            <div className="journal-layout__main">
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
                <div className="journal-layout__content-area">
                    <main className="journal-layout__main-content">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
