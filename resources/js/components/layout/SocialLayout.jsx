import React from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import RecentJournals from './RecentJournals';

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
        navbarMode === 'tabs' ? 'mx-auto w-full max-w-[720px]' : 'w-full';

    return (
        <div className="flex min-h-screen bg-[#1B1C24] text-white">
            {/* Sidebar */}
            <Sidebar
                active={activeNav}
                communitySub={communitySub}
                onCommunitySubChange={onCommunitySubChange}
            />

            {/* Main Content */}
            <div className="flex min-h-screen min-w-0 flex-1 flex-col">
                {/* Top Navbar */}
                <TopNavbar
                    mode={navbarMode}
                    title={title}
                    showBack={showBack}
                    onBack={onBack}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                />

                <div className="flex min-h-0 flex-1">
                    {/* Main */}
                    <main className="flex-1 px-8 pt-[24px] pb-6">
                        <div className={contentContainerClassName}>
                            {children}
                        </div>
                    </main>

                    {/* Recent Journals */}
                    {recentJournals && (
                        <aside className="hidden w-[320px] border-l border-[#323848] bg-[#1B1C24] xl:flex">
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