import React from 'react';

export default function CommunityAboutPanel({ community }) {
    return (
        <article className="rounded-[10px] bg-[#212633] p-6">
            <h3 className="text-[44px] font-medium leading-[1.1] text-white">About this community</h3>
            <p className="mt-3 text-[20px] text-[#9ca0ad]">Created: {community.createdAt}</p>
            <p className="mt-6 text-[32px] leading-[1.5] text-[#e3e7ef]">{community.about}</p>
        </article>
    );
}
