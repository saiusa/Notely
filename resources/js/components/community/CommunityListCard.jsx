import React from 'react';
import { Link } from 'react-router-dom';

export default function CommunityListCard({ community, actionLabel, to }) {
    return (
        <article className="h-[280px] w-full max-w-[280px] rounded-[10px] bg-[#212633] p-0">
            <img src={community.cardImage} alt={community.name} className="h-[100px] w-full rounded-t-[10px] object-cover" />
            <div className="space-y-1.5 p-4">
                <h3 className="text-[16px] font-medium leading-[1.2] text-white">{community.name}</h3>
                <p className="min-h-[44px] text-[14px] leading-[1.45] text-[#cfd3df]">{community.description}</p>
                <p className="pt-1 text-[#dfe2ec]">
                    <span className="text-[16px] font-medium">{community.members}</span>
                    <span className="ml-1 text-[14px]">members</span>
                </p>
                <Link
                    to={to}
                    className="mt-2 flex h-[38px] items-center justify-center rounded-[8px] bg-[#343b4f] text-[16px] font-normal text-white transition-colors hover:bg-[#46506a]"
                >
                    {actionLabel}
                </Link>
            </div>
        </article>
    );
}
