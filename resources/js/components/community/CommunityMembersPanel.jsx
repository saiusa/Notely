import React from 'react';

export default function CommunityMembersPanel({ memberSearch, onSearchChange, visibleMembers }) {
    return (
        <div className="rounded-[10px] bg-[#212633] p-4">
            <label className="flex h-[40px] items-center gap-2 rounded-full bg-[#2b3041] px-3 text-[#8c93a7]">
                <span className="material-symbols-outlined text-[20px]">search</span>
                <input
                    value={memberSearch}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Search Notely"
                    className="w-full bg-transparent text-[24px] text-white placeholder:text-[#7d8498] focus:outline-none"
                />
            </label>

            <div className="mt-4 space-y-3">
                {visibleMembers.map((member) => (
                    <article key={member.id} className="flex items-center gap-3 border-b border-[#303548] pb-3 last:border-b-0">
                        <img src={member.avatar} alt={member.name} className="h-[40px] w-[40px] rounded-full object-cover" />
                        <div>
                            <p className="text-[28px] font-medium text-white">{member.name}</p>
                            <p className="text-[20px] text-[#9ca0ad]">{member.joinedDate}</p>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
