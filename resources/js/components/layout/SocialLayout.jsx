import React from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import RecentJournals from './RecentJournals';
import '../../../sass/components/layout/SocialLayout.scss';

export default function SocialLayout({
    activeNav,
    communitySub,
    onCommunitySubChange,
    navbarMode,
    title,
    showBack,
    onBack,
    activeTab,
    onTabChange,
    recentJournals,
    onClearRecentJournals,
    children,
}) {
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
                />

                <div className="social-layout__content-area">
                    {/* Main */}
                    <main className="social-layout__main-content">
                        <div className={contentContainerClassName}>
                            {children}
                        </div>
                    </main>

                    {/* Recent Journals */}
                    {recentJournals && (
                        <aside className="social-layout__recent-journals">
                            <RecentJournals
                                journals={recentJournals}
                                onClear={onClearRecentJournals}
                            />
                        </aside>
                    )}
                </div>
            </div>
        </div>
    );
}