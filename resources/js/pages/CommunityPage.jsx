import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CommunityAboutPanel from '../components/community/CommunityAboutPanel';
import CategoryBentoCard from '../components/community/CategoryBentoCard';
import CommunityDetailHeader from '../components/community/CommunityDetailHeader';
import CommunityListCard from '../components/community/CommunityListCard';
import CommunityMembersPanel from '../components/community/CommunityMembersPanel';
import CommunityRightSidebar from '../components/community/CommunityRightSidebar';
import {
    categoryCards,
    communities,
    memberDirectory,
    myCommunityIds,
} from '../components/community/communityData';
import ComposerModal from '../components/layout/ComposerModal';
import SocialLayout from '../components/layout/SocialLayout';
import PostCard from '../components/posts/PostCard';
import { feedPosts } from '../utils/socialMockData';

export default function CommunityPage() {
    const { category, communityId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const isBrowseRoot = location.pathname === '/community/browse';
    const isCategoryRoute = location.pathname.startsWith('/community/browse/') && !communityId;
    const isMyCommunityList = location.pathname === '/community/my-community';
    const isDetailRoute = Boolean(communityId);
    const isMyCommunityRoute = location.pathname.startsWith('/community/my-community');

    const [activeTab, setActiveTab] = useState('posts');
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');
    const [composerMode, setComposerMode] = useState(null);
    const [joinedIds, setJoinedIds] = useState(new Set(myCommunityIds));

    useEffect(() => {
        setActiveTab('posts');
    }, [location.pathname]);

    const communityLookup = useMemo(() => {
        return new Map(communities.map((item) => [item.id, item]));
    }, []);

    const selectedCommunity = communityId ? communityLookup.get(communityId) : null;

    const filteredCommunities = useMemo(() => {
        if (!category) {
            return communities;
        }
        return communities.filter((community) => community.category === category);
    }, [category]);

    const myCommunities = useMemo(() => {
        return communities.filter((community) => myCommunityIds.includes(community.id));
    }, []);

    const isJoined = selectedCommunity
        ? isMyCommunityRoute || joinedIds.has(selectedCommunity.id)
        : false;

    const visibleMembers = useMemo(() => {
        const query = memberSearch.trim().toLowerCase();
        if (!query) {
            return memberDirectory;
        }
        return memberDirectory.filter((member) => member.name.toLowerCase().includes(query));
    }, [memberSearch]);

    const handleJoinToggle = () => {
        if (!selectedCommunity || isMyCommunityRoute) {
            return;
        }

        setJoinedIds((prev) => {
            const next = new Set(prev);
            if (next.has(selectedCommunity.id)) {
                next.delete(selectedCommunity.id);
            } else {
                next.add(selectedCommunity.id);
            }
            return next;
        });
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch (error) {
            // no-op
        }
        setShowHeaderMenu(false);
    };

    const handleReport = () => {
        setShowHeaderMenu(false);
    };

    const showBackButton = isDetailRoute || isCategoryRoute;

    const selectedCategoryLabel = useMemo(() => {
        if (!category) {
            return '';
        }

        const matchedCategory = categoryCards.find((item) => item.id === category);
        if (matchedCategory) {
            return matchedCategory.name;
        }

        return category.charAt(0).toUpperCase() + category.slice(1);
    }, [category]);

    const handleBack = () => {
        if (isCategoryRoute) {
            navigate('/community/browse');
            return;
        }
        navigate(-1);
    };

    const communityNav = isMyCommunityRoute ? 'community-my' : 'community-browse';

    if (isDetailRoute && !selectedCommunity) {
        return (
            <SocialLayout activeNav={communityNav} navbarMode="title" title="Community">
                <p className="text-[16px] text-[#c9cdd8]">Community not found.</p>
            </SocialLayout>
        );
    }

    return (
        <SocialLayout
            activeNav={communityNav}
            navbarMode="title"
            title={showBackButton ? '' : 'Community'}
            showBack={showBackButton}
            onBack={handleBack}
        >
            {isBrowseRoot ? (
                <section>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {categoryCards.concat(categoryCards).map((categoryItem, index) => (
                            <CategoryBentoCard key={`${categoryItem.id}-${index}`} category={categoryItem} />
                        ))}
                    </div>
                </section>
            ) : null}

            {isCategoryRoute ? (
                <section>
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <h2 className="text-[24px] font-semibold leading-[1.2] text-white">{selectedCategoryLabel}</h2>
                        <button
                            type="button"
                            className="h-[44px] rounded-[9px] bg-[#785ebf] px-7 text-[16px] font-normal text-white transition-colors hover:bg-[#8b70d4]"
                        >
                            Create Community
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {filteredCommunities.map((community) => (
                            <CommunityListCard
                                key={community.id}
                                community={community}
                                actionLabel="Explore"
                                to={`/community/browse/${community.category}/${community.id}`}
                            />
                        ))}
                    </div>
                </section>
            ) : null}

            {isMyCommunityList ? (
                <section>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {myCommunities.map((community) => (
                            <CommunityListCard
                                key={community.id}
                                community={community}
                                actionLabel="View"
                                to={`/community/my-community/${community.id}`}
                            />
                        ))}
                    </div>
                </section>
            ) : null}

            {isDetailRoute ? (
                <section className="space-y-4">
                    <CommunityDetailHeader
                        community={selectedCommunity}
                        isJoined={isJoined}
                        isMyCommunityRoute={isMyCommunityRoute}
                        showHeaderMenu={showHeaderMenu}
                        onToggleMenu={() => setShowHeaderMenu((prev) => !prev)}
                        onCopyLink={handleCopyLink}
                        onReport={handleReport}
                        onJoinToggle={handleJoinToggle}
                    />

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                        <div className="space-y-4">
                            {activeTab === 'posts' && isJoined ? (
                                <div className="grid grid-cols-3 gap-2 rounded-[10px] bg-[#212633] p-2">
                                    {[
                                        { key: 'text', icon: 'format_size' },
                                        { key: 'quote', icon: 'format_quote' },
                                        { key: 'image', icon: 'image' },
                                    ].map((item) => (
                                        <button
                                            key={item.key}
                                            type="button"
                                            onClick={() => setComposerMode(item.key)}
                                            className="flex h-[56px] items-center justify-center rounded-[8px] text-white transition-colors hover:bg-[#2f3548]"
                                        >
                                            <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : null}

                            {activeTab === 'posts' ? (
                                <div className="space-y-3">
                                    {feedPosts.map((post) => (
                                        <PostCard key={`community-${selectedCommunity.id}-${post.id}`} post={post} />
                                    ))}
                                </div>
                            ) : null}

                            {activeTab === 'members' ? (
                                <CommunityMembersPanel
                                    memberSearch={memberSearch}
                                    onSearchChange={setMemberSearch}
                                    visibleMembers={visibleMembers}
                                />
                            ) : null}

                            {activeTab === 'about' ? (
                                <CommunityAboutPanel community={selectedCommunity} />
                            ) : null}
                        </div>

                        <CommunityRightSidebar
                            community={selectedCommunity}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />
                    </div>

                    {composerMode ? (
                        <div className="fixed left-[260px] right-0 top-0 z-[60] flex justify-center px-4 xl:right-[360px]">
                            <ComposerModal mode={composerMode} onClose={() => setComposerMode(null)} />
                        </div>
                    ) : null}
                </section>
            ) : null}
        </SocialLayout>
    );
}
