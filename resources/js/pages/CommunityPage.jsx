import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CommunityAboutPanel from '../components/community/CommunityAboutPanel';
import CategoryBentoCard from '../components/community/CategoryBentoCard';
import CommunityDetailHeader from '../components/community/CommunityDetailHeader';
import CommunityListCard from '../components/community/CommunityListCard';
import CommunityMembersPanel from '../components/community/CommunityMembersPanel';
import CommunityRightSidebar from '../components/community/CommunitySidebar';
import CreateCommunityModal from '../components/community/modals/CreateCommunityModal';
import {
    categoryCards,
    communities as mockCommunities,
    memberDirectory,
} from '../components/community/communityData';
import ComposerModal from '../components/layout/ComposerModal';
import SocialLayout from '../components/layout/SocialLayout';
import PostCard from '../components/posts/PostCard';
import communityService from '../services/communityService';
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
    const [joinedIds, setJoinedIds] = useState(() => new Set());
    const [communityPosts, setCommunityPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [myCommunities, setMyCommunities] = useState([]);
    const [apiMembers, setApiMembers] = useState([]);
    const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);

    useEffect(() => {
        setActiveTab('posts');
    }, [location.pathname]);

    // Load my communities from API to know which ones the user has joined
    const fetchMyCommunities = useCallback(async () => {
        try {
            const res = await communityService.getMyCommunities();
            const data = res.data || res || [];
            setMyCommunities(data);
            const ids = new Set(data.map((c) => String(c.community_id || c.id)));
            setJoinedIds(ids);
        } catch (_) {
            // Fall back to empty
        }
    }, []);

    useEffect(() => {
        fetchMyCommunities();
    }, [fetchMyCommunities]);

    // Use mock communities lookup (community detail pages use string IDs from the URL)
    const communityLookup = useMemo(() => {
        return new Map(mockCommunities.map((item) => [item.id, item]));
    }, []);

    const selectedCommunity = communityId ? communityLookup.get(communityId) : null;

    const filteredCommunities = useMemo(() => {
        if (!category) {
            return mockCommunities;
        }
        return mockCommunities.filter((community) => community.category === category);
    }, [category]);

    const myCommunitiesList = useMemo(() => {
        // Prefer API data if available, else fall back to mock
        if (myCommunities.length > 0) {
            return myCommunities.map((c) => ({
                id: String(c.community_id || c.id),
                category: '',
                name: c.name,
                username: `@${c.name.toLowerCase().replace(/\s+/g, '-')}`,
                description: c.description || '',
                members: '',
                cardImage: c.image || '',
            }));
        }
        return mockCommunities.filter((community) => joinedIds.has(community.id));
    }, [myCommunities, joinedIds]);

    const isJoined = selectedCommunity ? joinedIds.has(selectedCommunity.id) : false;

    // Load community posts when viewing a detail page
    useEffect(() => {
        if (!isDetailRoute || !communityId) return;

        const fetchPosts = async () => {
            setLoadingPosts(true);
            try {
                // Try API first with the numeric ID
                const numericId = parseInt(communityId, 10);
                if (!isNaN(numericId)) {
                    const res = await communityService.getCommunityPosts(numericId);
                    setCommunityPosts(res.data || res || []);
                } else {
                    setCommunityPosts([]);
                }
            } catch (_) {
                setCommunityPosts([]);
            } finally {
                setLoadingPosts(false);
            }
        };

        fetchPosts();
    }, [isDetailRoute, communityId]);

    // Load members for detail view
    useEffect(() => {
        if (!isDetailRoute || !communityId) return;

        const fetchMembers = async () => {
            try {
                const numericId = parseInt(communityId, 10);
                if (!isNaN(numericId)) {
                    const res = await communityService.getMembers(numericId);
                    const data = res.data || res || [];
                    setApiMembers(data.map((m) => ({
                        id: m.user_id || m.id,
                        name: m.username || '',
                        joinedDate: m.joined_at || '',
                        avatar: m.profile?.profile_picture || '',
                    })));
                }
            } catch (_) {
                // Fall back to mock
            }
        };

        fetchMembers();
    }, [isDetailRoute, communityId]);

    const visibleMembers = useMemo(() => {
        const source = apiMembers.length > 0 ? apiMembers : memberDirectory;
        const query = memberSearch.trim().toLowerCase();
        if (!query) {
            return source;
        }
        return source.filter((member) => member.name.toLowerCase().includes(query));
    }, [memberSearch, apiMembers]);

    const handleJoinCommunity = async () => {
        if (!selectedCommunity || joinedIds.has(selectedCommunity.id)) {
            return;
        }

        // Optimistic UI update
        setJoinedIds((prev) => {
            const next = new Set(prev);
            next.add(selectedCommunity.id);
            return next;
        });

        try {
            const numericId = parseInt(selectedCommunity.id, 10);
            if (!isNaN(numericId)) {
                await communityService.joinCommunity(numericId);
            }
        } catch (_) {
            // Revert on failure
            setJoinedIds((prev) => {
                const next = new Set(prev);
                next.delete(selectedCommunity.id);
                return next;
            });
        }
    };

    const handleLeaveCommunity = async () => {
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

        try {
            const numericId = parseInt(selectedCommunity.id, 10);
            if (!isNaN(numericId)) {
                await communityService.leaveCommunity(numericId);
            }
        } catch (_) {
            // Revert
            setJoinedIds((prev) => {
                const next = new Set(prev);
                next.add(selectedCommunity.id);
                return next;
            });
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch (_) {
            // no-op
        }
        setShowHeaderMenu(false);
    };

    const handleReport = () => {
        setShowHeaderMenu(false);
    };

    const handlePostCreated = () => {
        // Refresh community posts
        if (communityId) {
            const numericId = parseInt(communityId, 10);
            if (!isNaN(numericId)) {
                communityService.getCommunityPosts(numericId)
                    .then((res) => setCommunityPosts(res.data || res || []))
                    .catch(() => {});
            }
        }
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

    const handleCreateCommunity = async (data) => {
        try {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description);
            formData.append('handle', data.handle);
            if (data.image) {
                formData.append('image', data.image);
            }

            await communityService.createCommunity(formData);
            setShowCreateCommunityModal(false);
            await fetchMyCommunities();
        } catch (err) {
            console.error('Failed to create community:', err);
        }
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
                            onClick={() => setShowCreateCommunityModal(true)}
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
                        {myCommunitiesList.length === 0 ? (
                            <p style={{ color: '#a5abb9', padding: '40px 0' }}>You haven't joined any communities yet.</p>
                        ) : (
                            myCommunitiesList.map((community) => (
                                <CommunityListCard
                                    key={community.id}
                                    community={community}
                                    actionLabel="View"
                                    to={`/community/my-community/${community.id}`}
                                />
                            ))
                        )}
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
                                <div className="community-page__compose-bar">
                                    {[
                                        { key: 'text', icon: 'format_size' },
                                        { key: 'quote', icon: 'format_quote' },
                                        { key: 'image', icon: 'image' },
                                    ].map((item) => (
                                        <button
                                            key={item.key}
                                            type="button"
                                            onClick={() => setComposerMode(item.key)}
                                            className="community-page__compose-btn"
                                        >
                                            <span className="material-symbols-outlined community-page__compose-icon">{item.icon}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : null}

                            {activeTab === 'posts' ? (
                                <div className="community-page__posts-lane">
                                    {loadingPosts ? (
                                        <p style={{ color: '#a5abb9', padding: '20px 0', textAlign: 'center' }}>Loading posts...</p>
                                    ) : communityPosts.length === 0 ? (
                                        <p style={{ color: '#a5abb9', padding: '20px 0', textAlign: 'center' }}>No posts in this community yet.</p>
                                    ) : (
                                        communityPosts.map((post) => (
                                            <PostCard key={`community-${communityId}-${post.post_id || post.id}`} post={post} />
                                        ))
                                    )}
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
                        <ComposerModal
                            mode={composerMode}
                            onClose={() => setComposerMode(null)}
                            onPostCreated={handlePostCreated}
                            communityId={parseInt(communityId, 10) || undefined}
                        />
                    ) : null}
                </section>
            ) : null}

            <CreateCommunityModal
                open={showCreateCommunityModal}
                onCancel={() => setShowCreateCommunityModal(false)}
                onCreate={handleCreateCommunity}
            />
        </SocialLayout>
    );
}
