import React, { useState } from 'react';
import SocialLayout from '../components/layout/SocialLayout';
import PostCard from '../components/posts/PostCard';
import { feedPosts, profileCommunities } from '../utils/socialMockData';

function ProfileEditModal({ onClose }) {
    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/55 px-4">
            <section className="w-full max-w-[1100px] rounded-[20px] bg-[#232838] p-6">
                <h2 className="text-[48px] font-medium text-white">Edit Profile</h2>

                <div className="mt-6 flex items-center gap-4">
                    <img
                        src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=130&q=80"
                        alt="avatar"
                        className="h-[72px] w-[72px] rounded-full object-cover"
                    />
                    <div className="flex gap-2">
                        <button type="button" className="h-[38px] rounded-[8px] border border-[#785ebf] px-4 text-[28px] text-[#9b84d8]">
                            <span className="material-symbols-outlined mr-1 align-middle text-[20px]">image</span>
                            Change
                        </button>
                        <button type="button" className="h-[38px] rounded-[8px] border border-[#785ebf] px-4 text-[28px] text-[#9b84d8]">
                            <span className="material-symbols-outlined mr-1 align-middle text-[20px]">delete</span>
                            Remove
                        </button>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="text-[20px] text-white">
                        First Name
                        <input className="mt-1 h-[40px] w-full rounded-[8px] border border-[#3b4257] bg-transparent px-3 text-[28px]" defaultValue="Jungkook" />
                    </label>
                    <label className="text-[20px] text-white">
                        Last Name
                        <input className="mt-1 h-[40px] w-full rounded-[8px] border border-[#3b4257] bg-transparent px-3 text-[28px]" defaultValue="Jeon" />
                    </label>
                    <label className="text-[20px] text-white">
                        Birthday
                        <div className="mt-1 flex h-[40px] items-center gap-2 rounded-[8px] border border-[#3b4257] px-3 text-[28px]">
                            <span className="material-symbols-outlined text-[20px]">event</span>
                            09/01/1997
                        </div>
                    </label>
                    <label className="text-[20px] text-white">
                        Country
                        <div className="mt-1 flex h-[40px] items-center gap-2 rounded-[8px] border border-[#3b4257] px-3 text-[28px]">
                            <span>🇰🇷</span>
                            Seoul, South Korea
                        </div>
                    </label>
                    <label className="text-[20px] text-white md:col-span-1">
                        Gender
                        <div className="mt-1 flex h-[40px] items-center justify-between rounded-[8px] border border-[#3b4257] px-3 text-[28px]">
                            Male
                            <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
                        </div>
                    </label>
                </div>

                <label className="mt-4 block text-[20px] text-white">
                    Description
                    <textarea
                        className="mt-1 h-[100px] w-full resize-none rounded-[8px] border border-[#3b4257] bg-transparent px-3 py-2 text-[28px]"
                        defaultValue="Anyeong hasaeyeo jeoneun bangtan sonyeondan hwangeum maknae jeon jungkook imnida."
                    />
                </label>

                <div className="mt-6 flex items-center justify-end gap-5">
                    <button type="button" onClick={onClose} className="text-[38px] text-white hover:text-[#9b84d8]">
                        Cancel
                    </button>
                    <button type="button" className="h-[50px] w-[120px] rounded-[8px] bg-[#785ebf] text-[30px] font-medium text-white hover:bg-[#8c72d4]">
                        Save
                    </button>
                </div>
            </section>
        </div>
    );
}

export default function ProfilePage() {
    const [profileMode, setProfileMode] = useState('overview');
    const [showEdit, setShowEdit] = useState(false);

    return (
        <SocialLayout activeNav="profile" navbarMode="title" title="Profile">
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_315px]">
                <section>
                    {profileMode === 'overview' ? (
                        <>
                            <article className="overflow-hidden rounded-[10px] bg-[#212633]">
                                <img
                                    src="https://images.unsplash.com/photo-1473643068424-cd2485f9a97f?auto=format&fit=crop&w=1400&q=80"
                                    alt="cover"
                                    className="h-[180px] w-full object-cover"
                                />
                                <div className="relative p-4 pt-10">
                                    <img
                                        src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=130&q=80"
                                        alt="avatar"
                                        className="absolute -top-[44px] left-4 h-[88px] w-[88px] rounded-full border-2 border-[#212633] object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEdit(true)}
                                        className="absolute right-4 top-4 h-[38px] rounded-full bg-[#343b4f] px-5 text-[30px] font-medium hover:bg-[#46506a]"
                                    >
                                        Edit Profile
                                    </button>
                                    <h2 className="text-[46px] font-medium">Jungkook Jeon</h2>
                                    <p className="text-[24px] text-[#a2a7b7]">@jungkook.bts</p>
                                    <div className="mt-3 flex gap-4 text-[24px] text-[#d4d8e3]">
                                        <p>🇰🇷 Seoul, South Korea</p>
                                        <p>09/01/1997</p>
                                    </div>
                                    <p className="mt-2 text-[30px] leading-[1.4]">
                                        Anyeong hasaeyeo jeoneun bangtan sonyeondan hwangeum maknae jeon jungkook imnida.
                                    </p>
                                </div>
                            </article>

                            <div className="mt-4 flex items-center justify-between">
                                <h3 className="text-[48px] font-medium">Post</h3>
                                <button
                                    type="button"
                                    onClick={() => setProfileMode('posts')}
                                    className="flex items-center gap-1 text-[26px] text-[#cacddd] hover:text-white"
                                >
                                    Show all
                                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                </button>
                            </div>

                            <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
                                {feedPosts.map((post) => (
                                    <PostCard key={`profile-overview-${post.id}`} post={post} compact />
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => setProfileMode('overview')}
                                className="mb-3 flex items-center text-white hover:text-[#9b84d8]"
                            >
                                <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                            </button>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-[48px] font-medium">Post</h3>
                                <span className="material-symbols-outlined text-[22px]">tune</span>
                            </div>
                            <div className="space-y-3">
                                {feedPosts.map((post) => (
                                    <PostCard key={`profile-posts-${post.id}`} post={post} />
                                ))}
                            </div>
                        </>
                    )}
                </section>

                <aside className="h-fit rounded-[10px] bg-[#212633] p-4">
                    <h4 className="mb-3 text-[20px] font-semibold">COMMUNITIES</h4>
                    <div className="space-y-2">
                        {profileCommunities.map((community) => (
                            <div key={community.id} className="flex items-center gap-2.5">
                                <img
                                    src="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=110&q=80"
                                    alt={community.name}
                                    className="h-10 w-10 rounded-[6px] object-cover"
                                />
                                <div>
                                    <p className="text-[30px]">{community.name}</p>
                                    <p className="text-[20px] text-[#8f94a2]">{community.handle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </div>

            {showEdit && <ProfileEditModal onClose={() => setShowEdit(false)} />}
        </SocialLayout>
    );
}
