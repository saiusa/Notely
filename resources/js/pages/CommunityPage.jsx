import React, { useState } from 'react';
import SocialLayout from '../components/layout/SocialLayout';
import PostCard from '../components/posts/PostCard';
import { communityCards, feedPosts } from '../utils/socialMockData';

function CommunityCard({ title, desc, members, image, actionLabel, onClick }) {
    return (
        <article className="rounded-[10px] bg-[#212633] p-0">
            <img src={image} alt={title} className="h-[146px] w-full rounded-t-[10px] object-cover" />
            <div className="space-y-2 p-3">
                <h3 className="text-[30px] font-medium">{title}</h3>
                <p className="text-[24px] text-[#e4e6ec]">{desc}</p>
                <p className="text-[28px] font-medium">{members}</p>
                <button
                    type="button"
                    onClick={onClick}
                    className="h-[38px] w-full rounded-[9px] bg-[#343b4f] text-[30px] font-medium text-white hover:bg-[#46506a]"
                >
                    {actionLabel}
                </button>
            </div>
        </article>
    );
}

export default function CommunityPage() {
    const [communitySub, setCommunitySub] = useState('browse');
    const [detailTab, setDetailTab] = useState('list');
    const [joined, setJoined] = useState(false);

    const showingDetail = detailTab !== 'list';

    return (
        <SocialLayout
            activeNav="community"
            communitySub={communitySub}
            onCommunitySubChange={setCommunitySub}
            navbarMode="title"
            title="Community"
        >
            {!showingDetail ? (
                <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {(communitySub === 'browse' ? communityCards.concat(communityCards.slice(0, 3)) : communityCards.slice(0, 2)).map((card) => (
                        <CommunityCard
                            key={`${communitySub}-${card.id}-${card.title}`}
                            {...card}
                            actionLabel={communitySub === 'browse' ? 'Explore' : 'View'}
                            onClick={() => setDetailTab('posts')}
                        />
                    ))}
                </section>
            ) : (
                <section className="space-y-3">
                    <button
                        type="button"
                        className="flex items-center text-white hover:text-[#9b84d8]"
                        onClick={() => setDetailTab('list')}
                    >
                        <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                    </button>

                    <article className="relative overflow-hidden rounded-[10px] bg-[#212633]">
                        <img
                            src="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=1600&q=80"
                            alt="Music Gremlin"
                            className="h-[225px] w-full object-cover"
                        />
                        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                            <div>
                                <h2 className="text-[44px] font-medium">Music Gremlin</h2>
                                <p className="text-[24px] text-[#d7d9e0]">Where the passion of music goes shinnin. Welcome everyone!!!</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setJoined((prev) => !prev)}
                                className={`h-[40px] min-w-[140px] rounded-full px-5 text-[28px] font-medium text-white ${
                                    joined ? 'bg-[#785ebf]' : 'bg-[#343b4f] hover:bg-[#46506a]'
                                }`}
                            >
                                {joined ? 'Joined' : 'Join Community'}
                            </button>
                        </div>
                    </article>

                    <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_315px]">
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2 rounded-[10px] bg-[#212633] p-2">
                                {[
                                    { key: 'posts', icon: 'format_size' },
                                    { key: 'members', icon: 'group' },
                                    { key: 'about', icon: 'image' },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setDetailTab(item.key)}
                                        className="flex h-[56px] items-center justify-center rounded-[8px] text-white hover:bg-[#2f3548]"
                                    >
                                        <span className="material-symbols-outlined text-[30px]">{item.icon}</span>
                                    </button>
                                ))}
                            </div>

                            {detailTab === 'posts' && feedPosts.map((post) => <PostCard key={`community-${post.id}`} post={post} />)}

                            {detailTab === 'members' && (
                                <div className="rounded-[10px] bg-[#212633] p-4">
                                    <div className="flex h-[40px] items-center gap-2 rounded-full bg-[#2b3041] px-3 text-[#6d7283]">
                                        <span className="material-symbols-outlined">search</span>
                                        <span className="text-[24px]">Search Notely</span>
                                    </div>
                                    <div className="mt-4 space-y-3">
                                        {Array.from({ length: 6 }).map((_, index) => (
                                            <article key={index} className="flex items-center gap-3 border-b border-[#303548] pb-3 last:border-b-0">
                                                <img
                                                    src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=90&q=80"
                                                    alt="member"
                                                    className="h-[42px] w-[42px] rounded-full object-cover"
                                                />
                                                <div>
                                                    <p className="text-[28px]">aiss07</p>
                                                    <p className="text-[20px] text-[#9ca0ad]">December 30, 2025</p>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {detailTab === 'about' && (
                                <div className="rounded-[10px] bg-[#212633] p-4 text-[32px] leading-[1.45] text-[#e4e6ec]">
                                    <h3 className="mb-2 text-[44px] font-medium text-white">About this community</h3>
                                    <p className="mb-4 text-[20px] text-[#9ca0ad]">Created: June 13, 2013</p>
                                    <p>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                    </p>
                                </div>
                            )}
                        </div>

                        <aside className="rounded-[10px] bg-[#212633] p-4">
                            <div className="mb-3 flex items-center gap-2.5">
                                <img
                                    src="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=120&q=80"
                                    alt="community"
                                    className="h-10 w-10 rounded-[6px] object-cover"
                                />
                                <div>
                                    <p className="text-[30px] font-medium">Music Gremlin</p>
                                    <p className="text-[20px] text-[#9ca0ad]">@music-gremlin</p>
                                </div>
                            </div>

                            {[
                                ['Post', '10k'],
                                ['Members', '10k'],
                                ['About this community', ''],
                            ].map(([label, value]) => (
                                <div key={label} className="flex items-center justify-between border-t border-[#303548] py-3">
                                    <p className="text-[32px]">{label}</p>
                                    <p className="text-[32px]">{value}</p>
                                </div>
                            ))}

                            <div className="mt-3 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCommunitySub('browse')}
                                    className={`h-[36px] rounded-[8px] px-3 text-[20px] ${communitySub === 'browse' ? 'bg-[#343b4f]' : 'bg-[#252b3b] hover:bg-[#343b4f]'}`}
                                >
                                    Browse
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCommunitySub('my')}
                                    className={`h-[36px] rounded-[8px] px-3 text-[20px] ${communitySub === 'my' ? 'bg-[#343b4f]' : 'bg-[#252b3b] hover:bg-[#343b4f]'}`}
                                >
                                    My Community
                                </button>
                            </div>
                        </aside>
                    </div>
                </section>
            )}

        </SocialLayout>
    );
}
