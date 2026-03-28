import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CommunityAboutPanel from '../components/community/CommunityAboutPanel';
import CategoryBentoCard from '../components/community/CategoryBentoCard';
import CommunityDetailHeader from '../components/community/CommunityDetailHeader';
import CommunityListCard from '../components/community/CommunityListCard';
import CommunityMembersPanel from '../components/community/CommunityMembersPanel';
import CommunityRightSidebar from '../components/community/CommunitySidebar';
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
import '../../sass/pages/CommunityPage.scss';

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
    const [joinedIds, setJoinedIds] = useState(() => new Set(myCommunityIds));

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
        return communities.filter((community) => joinedIds.has(community.id));
    }, [joinedIds]);

    const isJoined = selectedCommunity ? joinedIds.has(selectedCommunity.id) : false;

    const visibleMembers = useMemo(() => {
        const query = memberSearch.trim().toLowerCase();
        if (!query) {
            return memberDirectory;
        }
        return memberDirectory.filter((member) => member.name.toLowerCase().includes(query));
    }, [memberSearch]);

    const handleJoinCommunity = () => {
        if (!selectedCommunity || joinedIds.has(selectedCommunity.id)) {
            return;
        }

        setJoinedIds((prev) => {
            const next = new Set(prev);
            next.add(selectedCommunity.id);
            return next;
        });
    };

    const handleLeaveCommunity = () => {
        if (!selectedCommunity || !joinedIds.has(selectedCommunity.id)) {
            return;
        }

        setJoinedIds((prev) => {
            const next = new Set(prev);
            next.delete(selectedCommunity.id);
            return next;
        });
        setComposerMode(null);
        setShowHeaderMenu(false);
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
                <p className="community-page__not-found">Community not found.</p>
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
                <section className="community-page__section">
                    <div className="community-page__category-grid">
                        {categoryCards.concat(categoryCards).map((categoryItem, index) => (
                            <CategoryBentoCard key={`${categoryItem.id}-${index}`} category={categoryItem} />
                        ))}
                    </div>
                </section>
            ) : null}

            {isCategoryRoute ? (
                <section className="community-page__section">
                    <div className="community-page__header-row">
                        <h2 className="community-page__header-title">{selectedCategoryLabel}</h2>
                        <button
                            type="button"
                            className="community-page__create-btn"
                        >
                            Create Community
                        </button>
                    </div>

                    <div className="community-page__community-grid">
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
                <section className="community-page__section">
                    <div className="community-page__community-grid">
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
                <section className="community-page__detail-section">
                    <CommunityDetailHeader
                        community={selectedCommunity}
                        isJoined={isJoined}
                        showHeaderMenu={showHeaderMenu}
                        onToggleMenu={() => setShowHeaderMenu((prev) => !prev)}
                        onLeaveCommunity={handleLeaveCommunity}
                        onCopyLink={handleCopyLink}
                        onReport={handleReport}
                        onJoinCommunity={handleJoinCommunity}
                    />

                    <div className="community-page__detail-grid">
                        <div className="community-page__detail-main">
                            {activeTab === 'posts' && isJoined ? (
                                <div className="community-page__composer-wrap">
                                    <div className="community-page__composer-grid">
                                        {[
                                            { key: 'text', icon: 'format_size' },
                                            { key: 'quote', icon: 'format_quote' },
                                            { key: 'image', icon: 'image' },
                                        ].map((item) => (
                                            <button
                                                key={item.key}
                                                type="button"
                                                onClick={() => setComposerMode(item.key)}
                                                className="community-page__composer-btn"
                                            >
                                                <span className="material-symbols-outlined community-page__composer-icon">{item.icon}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {activeTab === 'posts' ? (
                                <div className="community-page__posts-lane">
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
                                    memberCount={selectedCommunity.memberCount}
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
                        <ComposerModal mode={composerMode} onClose={() => setComposerMode(null)} />
                    ) : null}
                </section>
            ) : null}
        </SocialLayout>
    );
}
