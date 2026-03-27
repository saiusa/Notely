import React from 'react';

export default function CommunityRightSidebar({ community, activeTab, onTabChange }) {
    return (
        <aside className="h-fit rounded-[10px] bg-[#212633] p-4">
            <div className="mb-4 flex items-center gap-2.5">
                <img src={community.cardImage} alt={community.name} className="h-12 w-12 rounded-[6px] object-cover" />
                <div>
                    <p className="text-[30px] font-medium leading-[1.2] text-white">{community.name}</p>
                    <p className="text-[20px] text-[#9ca0ad]">{community.username}</p>
                </div>
            </div>

            <button
                type="button"
                onClick={() => onTabChange('posts')}
                className={`flex w-full items-center justify-between border-t border-[#303548] py-3 text-left transition-colors ${
                    activeTab === 'posts' ? 'text-white' : 'text-[#b3b7c4] hover:text-white'
                }`}
            >
                <span className="text-[32px]">Post</span>
                <span className="text-[32px]">{community.posts}</span>
            </button>
            <button
                type="button"
                onClick={() => onTabChange('members')}
                className={`flex w-full items-center justify-between border-t border-[#303548] py-3 text-left transition-colors ${
                    activeTab === 'members' ? 'text-white' : 'text-[#b3b7c4] hover:text-white'
                }`}
            >
                <span className="text-[32px]">Members</span>
                <span className="text-[32px]">{community.memberCount}</span>
            </button>
            <button
                type="button"
                onClick={() => onTabChange('about')}
                className={`flex w-full items-center justify-between border-y border-[#303548] py-3 text-left transition-colors ${
                    activeTab === 'about' ? 'text-white' : 'text-[#b3b7c4] hover:text-white'
                }`}
            >
                <span className="text-[32px]">About this community</span>
            </button>
        </aside>
    );
}
