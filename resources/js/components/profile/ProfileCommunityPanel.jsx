import React, { useMemo, useState } from 'react';

export default function ProfileCommunityPanel({ communities }) {
    const [expanded, setExpanded] = useState(false);

    const visibleCommunities = useMemo(() => {
        if (expanded) {
            return communities;
        }
        return communities.slice(0, 6);
    }, [communities, expanded]);

    return (
        <aside className="sticky top-[96px] h-fit rounded-[10px] bg-[#212633] p-6">
            <h4 className="mb-4 text-[14px] font-medium tracking-[0.02em]">COMMUNITIES</h4>

            <div className="space-y-2.5">
                {visibleCommunities.map((community) => (
                    <div key={community.id} className="flex items-center gap-2.5">
                        <img
                            src="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=110&q=80"
                            alt={community.name}
                            className="h-12 w-12 rounded-[6px] object-cover"
                        />
                        <div>
                            <p className="text-[16px] font-normal leading-[1.25]">{community.name}</p>
                            <p className="text-[14px] font-normal leading-[1.25] text-[#8f94a2]">{community.handle}</p>
                        </div>
                    </div>
                ))}
            </div>

            {communities.length > 4 ? (
                <button
                    type="button"
                    onClick={() => setExpanded((prev) => !prev)}
                    className="mt-4 flex items-center gap-1 text-[14px] font-normal leading-[1.2] text-[#cacddd] transition-colors hover:text-[#785EBF]"
                >
                    {expanded ? 'Show less' : 'Show more'}
                    <span className={`material-symbols-outlined text-[18px] transition-transform ${expanded ? 'rotate-90' : ''}`}>
                        chevron_right
                    </span>
                </button>
            ) : null}
        </aside>
    );
}
