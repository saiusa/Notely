import React from 'react';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';

export default function SocialLayout({
    activeNav,
    communitySub,
    onCommunitySubChange,
    navbarMode,
    title,
    activeTab,
    onTabChange,
    children,
}) {
    return (
        <div className="flex min-h-screen bg-[#1B1C24] text-white">
            <Sidebar active={activeNav} communitySub={communitySub} onCommunitySubChange={onCommunitySubChange} />
            <div className="flex min-h-screen flex-1 flex-col">
                <TopNavbar mode={navbarMode} title={title} activeTab={activeTab} onTabChange={onTabChange} />
                <main className="flex-1 px-7 py-5">{children}</main>
            </div>
        </div>
    );
}
