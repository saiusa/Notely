import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import CommunityAboutPanel from '../components/community/CommunityAboutPanel';
import CategoryBentoCard from '../components/community/CategoryBentoCard';
import CommunityDetailHeader from '../components/community/CommunityDetailHeader';
import CommunityListCard from '../components/community/CommunityListCard';
import CommunityMembersPanel from '../components/community/CommunityMembersPanel';
import CommunityRightSidebar from '../components/community/CommunitySidebar';
import CreateCommunityModal from '../components/community/modals/CreateCommunityModal';
import EditRulesModal from '../components/community/modals/EditRulesModal';
import ComposerModal from '../components/layout/ComposerModal';
import CommunityLayout from '../components/layout/CommunityLayout';
import PostCard from '../components/posts/PostCard';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import communityService from '../services/communityService';
import '../../sass/pages/CommunityPage.scss';

/**
 * Helper function to normalize image URLs for deep routing compatibility
 * Ensures images resolve correctly regardless of current URL depth
 */
const getImageUrl = (url) => {
    if (!url) return null; // Let child components handle fallbacks
    if (url.startsWith('http')) return url; // Absolute HTTP/HTTPS URL
    if (url.startsWith('/')) return url; // Already absolute from root
    // Relative path - make absolute
    return `/${url}`;
};

export default function CommunityPage() {
    const { categorySlug, communityId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Determine the context based on the current pathname
    const context = location.pathname.startsWith('/community/my-community/created') 
        ? 'created'
        : location.pathname.startsWith('/community/my-community/joined')
        ? 'joined'
        : 'browse';

    const isBrowseRoot = location.pathname === '/community/browse';
    const isCategoryRoute = location.pathname.startsWith('/community/browse/') && !communityId;
    const isMyCommunityList = location.pathname === '/community/my-community';
    const isDetailRoute = Boolean(communityId);
    const isMyCommunityRoute = location.pathname.startsWith('/community/my-community') && context !== 'browse';

    const [activeTab, setActiveTab] = useState('posts');
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');
    const [composerMode, setComposerMode] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const [joinedIds, setJoinedIds] = useState(() => new Set());
    const [communityPosts, setCommunityPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [myCommunities, setMyCommunities] = useState([]);
    const [apiMembers, setApiMembers] = useState([]);
    const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [categoriesError, setCategoriesError] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingCommunity, setEditingCommunity] = useState(null);
    const [memberCountUpdates, setMemberCountUpdates] = useState(new Map());
    const [fullCommunityData, setFullCommunityData] = useState(null);
    const [loadingCommunityDetails, setLoadingCommunityDetails] = useState(false);
    const [isEditRulesModalOpen, setIsEditRulesModalOpen] = useState(false);

    useEffect(() => {
        setActiveTab('posts');
    }, [location.pathname]);

    // Fetch categories with communities from API
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            setCategoriesError(null);
            try {
                const data = await communityService.getCategories();
                setCategories(data || []);
            } catch (err) {
                setCategoriesError(err.message || 'Failed to load categories');
                console.error('Failed to fetch categories:', err);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // Load my communities from API to know which ones the user has joined
    const fetchMyCommunities = useCallback(async () => {
        try {
            const res = await communityService.getMyCommunities();
            console.log('getMyCommunities response:', res);
            
            // Handle response structure: { created: [...], joined: [...] }
            let data = [];
            if (res.created || res.joined) {
                // Response is { created: [...], joined: [...] }
                data = [...(res.created || []), ...(res.joined || [])];
                console.log('Combined communities:', data);
            } else if (res.data) {
                // Response has data wrapper
                const responseData = res.data;
                if (responseData.created || responseData.joined) {
                    data = [...(responseData.created || []), ...(responseData.joined || [])];
                } else {
                    data = Array.isArray(responseData) ? responseData : [];
                }
            } else if (Array.isArray(res)) {
                // Direct array response
                data = res;
            }
            
            console.log('Final communities data:', data);
            setMyCommunities(data);
            const ids = new Set(data.map((c) => String(c.community_id || c.id)));
            console.log('Joined community IDs:', Array.from(ids));
            setJoinedIds(ids);
        } catch (err) {
            console.error('Failed to fetch my communities:', err);
            setMyCommunities([]);
            setJoinedIds(new Set());
        }
    }, []);

    useEffect(() => {
        fetchMyCommunities();
    }, [fetchMyCommunities]);

    // Build lookup map from API categories and their communities ONLY
    const communityLookup = useMemo(() => {
        const lookup = new Map();
        categories.forEach(cat => {
            if (Array.isArray(cat.communities)) {
                cat.communities.forEach(community => {
                    const id = String(community.community_id || community.id);
                    lookup.set(id, {
                        id,
                        category: cat.slug,
                        name: community.name,
                        username: `@${community.name.toLowerCase().replace(/\s+/g, '-')}`,
                        description: community.description || '',
                        members: `${community.community_members_count || community.members_count || 0}`,
                        memberCount: community.community_members_count || community.members_count || 0,
                        cardImage: community.image || '',
                        coverImage: community.image || '',
                    });
                });
            }
        });
        return lookup;
    }, [categories]);

    const selectedCommunity = useMemo(() => {
        // Prefer full community data if available (from API detail fetch)
        if (fullCommunityData && communityId === String(fullCommunityData.community_id || fullCommunityData.id)) {
            const updatedMemberCount = memberCountUpdates.get(communityId);
            // Safely return the API community data
            return {
                ...fullCommunityData,
                id: String(fullCommunityData.community_id || fullCommunityData.id),
                coverImage: fullCommunityData.image || fullCommunityData.coverImage,
                cardImage: fullCommunityData.image || fullCommunityData.cardImage,
                memberCount: updatedMemberCount !== undefined ? updatedMemberCount : (fullCommunityData.community_members_count || fullCommunityData.memberCount || 0),
                members: String(updatedMemberCount !== undefined ? updatedMemberCount : (fullCommunityData.community_members_count || fullCommunityData.memberCount || 0)),
                username: fullCommunityData.username || `@${(fullCommunityData.name || '').toLowerCase().replace(/\s+/g, '-')}`,
            };
        }
        
        // Fall back to lookup table for browse view
        const community = communityId ? communityLookup.get(communityId) : null;
        if (!community) return null;
        
        // Apply member count updates if available
        const updatedMemberCount = memberCountUpdates.get(communityId);
        if (updatedMemberCount !== undefined) {
            return {
                ...community,
                memberCount: updatedMemberCount,
                members: String(updatedMemberCount),
            };
        }
        return community;
    }, [communityId, communityLookup, memberCountUpdates, fullCommunityData]);

    const filteredCommunities = useMemo(() => {
        if (!categorySlug) {
            // Return all communities from all categories
            const allCommunities = [];
            categories.forEach(cat => {
                if (Array.isArray(cat.communities)) {
                    cat.communities.forEach(community => {
                        allCommunities.push({
                            id: String(community.community_id || community.id),
                            category: cat.slug,
                            name: community.name,
                            username: `@${community.name.toLowerCase().replace(/\s+/g, '-')}`,
                            description: community.description || '',
                            members: `${community.community_members_count || community.members_count || 0}`,
                            memberCount: community.community_members_count || community.members_count || 0,
                            cardImage: community.image || '',
                            coverImage: community.image || '',
                        });
                    });
                }
            });
            return allCommunities;
        }
        
        // Find communities matching the categorySlug param
        const selectedCat = categories.find(c => c.slug === categorySlug);
        if (selectedCat && Array.isArray(selectedCat.communities)) {
            return selectedCat.communities.map(community => ({
                id: String(community.community_id || community.id),
                category: selectedCat.slug,
                name: community.name,
                username: `@${community.name.toLowerCase().replace(/\s+/g, '-')}`,
                description: community.description || '',
                members: `${community.community_members_count || community.members_count || 0}`,
                memberCount: community.community_members_count || community.members_count || 0,
                cardImage: community.image || '',
                coverImage: community.image || '',
            }));
        }
        
        return [];
    }, [categorySlug, categories]);

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
                coverImage: c.image || '',
            }));
        }
        return [];
    }, [myCommunities, joinedIds]);

    const isJoined = useMemo(() => {
        if (!selectedCommunity) {
            console.log('isJoined: selectedCommunity is null');
            return false;
        }
        
        console.log(`Checking if joined for community ${selectedCommunity.id}:`, {
            selectedCommunityId: selectedCommunity.id,
            joinedIdsArray: Array.from(joinedIds),
            hasInSet: joinedIds.has(selectedCommunity.id),
            fullCommunityDataExists: !!fullCommunityData,
        });
        
        // If we have full community data from API, check the members array for accuracy
        if (fullCommunityData && communityId === String(fullCommunityData.community_id || fullCommunityData.id)) {
            console.log('Using fullCommunityData for join check:', {
                hasMembersArray: Array.isArray(fullCommunityData.members),
                membersCount: fullCommunityData.members?.length,
                userId: user?.user_id,
            });
            if (fullCommunityData.members && Array.isArray(fullCommunityData.members)) {
                const isMember = fullCommunityData.members.some(member => member.user_id === user?.user_id);
                console.log('Is member check from members array:', isMember);
                return isMember;
            }
        }
        
        // Fall back to joinedIds state
        const joinedFromSet = joinedIds.has(selectedCommunity.id);
        console.log('Checking joinedIds set:', joinedFromSet);
        return joinedFromSet;
    }, [selectedCommunity, communityId, fullCommunityData, user, joinedIds]);

    // Fetch full community details when viewing a detail page
    useEffect(() => {
        if (!isDetailRoute || !communityId) {
            setLoadingCommunityDetails(false);
            return;
        }

        const fetchCommunityDetails = async () => {
            setLoadingCommunityDetails(true);
            try {
                const numericId = parseInt(communityId, 10);
                if (!isNaN(numericId)) {
                    const data = await communityService.getCommunity(numericId);
                    setFullCommunityData(data);
                }
            } catch (err) {
                console.error('Failed to fetch community details:', err);
            } finally {
                setLoadingCommunityDetails(false);
            }
        };

        fetchCommunityDetails();
    }, [isDetailRoute, communityId]);

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
        const source = apiMembers.length > 0 ? apiMembers : [];
        const query = memberSearch.trim().toLowerCase();
        if (!query) {
            return source;
        }
        return source.filter((member) => member.name.toLowerCase().includes(query));
    }, [memberSearch, apiMembers]);

    const handleJoinCommunity = async () => {
        if (!selectedCommunity) {
            console.log('No community selected');
            return;
        }

        const communityId = selectedCommunity.id;
        const numericId = parseInt(communityId, 10);
        if (isNaN(numericId)) {
            console.log('Invalid community ID:', communityId);
            return;
        }

        const isCurrentlyJoined = joinedIds.has(communityId);
        console.log(`Toggle join for community ${numericId}, currently joined: ${isCurrentlyJoined}`);

        // Optimistic UI update - update joined IDs
        setJoinedIds((prev) => {
            const next = new Set(prev);
            if (isCurrentlyJoined) {
                next.delete(communityId);
            } else {
                next.add(communityId);
            }
            return next;
        });

        // Update member count optimistically
        const currentMemberCount = memberCountUpdates.get(communityId) ?? selectedCommunity.memberCount;
        const newMemberCount = isCurrentlyJoined 
            ? currentMemberCount - 1 
            : currentMemberCount + 1;
        
        setMemberCountUpdates((prev) => {
            const next = new Map(prev);
            next.set(communityId, newMemberCount);
            return next;
        });

        try {
            const result = await communityService.toggleJoinCommunity(numericId, isCurrentlyJoined);
            console.log('Toggle result:', result);
            
            if (!result.success) {
                console.error('Failed to toggle membership:', result.message);
                // Revert on failure
                setJoinedIds((prev) => {
                    const next = new Set(prev);
                    if (isCurrentlyJoined) {
                        next.add(communityId);
                    } else {
                        next.delete(communityId);
                    }
                    return next;
                });
                
                // Revert member count
                setMemberCountUpdates((prev) => {
                    const next = new Map(prev);
                    next.delete(communityId);
                    return next;
                });
            } else {
                console.log('Successfully toggled membership');
                
                // Update fullCommunityData to sync the UI state
                if (fullCommunityData) {
                    const updatedMembers = isCurrentlyJoined
                        ? fullCommunityData.members.filter(m => m.user_id !== user?.user_id)
                        : [...(fullCommunityData.members || []), { user_id: user?.user_id, username: user?.username }];
                    
                    setFullCommunityData({
                        ...fullCommunityData,
                        members: updatedMembers,
                        community_members_count: isCurrentlyJoined 
                            ? (fullCommunityData.community_members_count || 1) - 1
                            : (fullCommunityData.community_members_count || 0) + 1,
                    });
                }
                
                // When leaving, close the composer and menu
                if (isCurrentlyJoined) {
                    setComposerMode(null);
                    setShowHeaderMenu(false);
                }
                
                // Refresh my communities list to keep it up to date
                await fetchMyCommunities();
            }
        } catch (error) {
            console.error('Error toggling community membership:', error);
            // Revert on failure
            setJoinedIds((prev) => {
                const next = new Set(prev);
                if (isCurrentlyJoined) {
                    next.add(communityId);
                } else {
                    next.delete(communityId);
                }
                return next;
            });
            
            // Revert member count
            setMemberCountUpdates((prev) => {
                const next = new Map(prev);
                next.delete(communityId);
                return next;
            });
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setIsCopied(true);
            
            // Auto-reset after 2 seconds and close menu
            setTimeout(() => {
                setIsCopied(false);
                setShowHeaderMenu(false);
            }, 2000);
        } catch (_) {
            // no-op, just close menu silently
            setShowHeaderMenu(false);
        }
    };

    const handleReport = () => {
        setShowHeaderMenu(false);
    };

    // Handle edit community
    const handleEditCommunity = useCallback((community) => {
        setEditingCommunity({
            community_id: community.community_id || community.id,
            name: community.name,
            description: community.description,
            category_id: community.category_id,
            cardImage: community.image || community.coverImage,
            user_id: community.user_id,
        });
        setEditModalOpen(true);
    }, []);

    // Handle submit edit
    const handleEditSubmit = useCallback(async (formData) => {
        if (!editingCommunity) return;

        try {
            await communityService.updateCommunity(editingCommunity.community_id, formData);
            
            // Refresh categories to get updated community data
            const data = await communityService.getCategories();
            setCategories(data || []);
            
            setEditModalOpen(false);
            setEditingCommunity(null);
        } catch (err) {
            console.error('Failed to update community:', err);
            alert('Failed to update community. Please try again.');
        }
    }, [editingCommunity]);

    const handleSaveRules = useCallback(async (updatedRules) => {
        if (!selectedCommunity || !fullCommunityData) return;

        try {
            // Prepare update payload with rules
            const updatePayload = {
                name: fullCommunityData.name,
                description: fullCommunityData.description,
                category_id: fullCommunityData.category_id || fullCommunityData.category?.category_id,
                rules: updatedRules,
            };

            // Send API request to update community with new rules
            await communityService.updateCommunity(
                fullCommunityData.community_id || fullCommunityData.id,
                updatePayload
            );

            // Update local state after successful API call
            setFullCommunityData((prev) => {
                if (prev) {
                    return {
                        ...prev,
                        rules: updatedRules,
                    };
                }
                return prev;
            });
            
            setIsEditRulesModalOpen(false);
        } catch (err) {
            console.error('Failed to save rules:', err);
            alert('Failed to save rules. Please try again.');
        }
    }, [selectedCommunity, fullCommunityData]);

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
        if (!categorySlug) {
            return '';
        }

        // Try API categories first
        const apiCat = categories.find((item) => item.slug === categorySlug);
        if (apiCat) {
            return apiCat.name;
        }

        return categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
    }, [categorySlug, categories]);

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
            formData.append('category_id', data.category_id);
            formData.append('description', data.description);
            if (data.image) {
                formData.append('image', data.image);
            }

            const response = await communityService.createCommunity(formData);
            console.log('Community created successfully:', response);
            setShowCreateCommunityModal(false);
            await fetchMyCommunities();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to create community';
            console.error('Failed to create community:', err);
            alert(`Error creating community: ${errorMessage}`);
        }
    };

    const communityNav = isMyCommunityRoute ? 'community-my' : 'community-browse';

    /**
     * Loading Gate: Prevent rendering until community data is fetched
     * This prevents the "Community not found" flash on page refresh
     */
    if (isDetailRoute && loadingCommunityDetails) {
        return (
            <CommunityLayout activeNav={communityNav} navbarMode="title" title="Loading...">
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <Loader />
                </div>
            </CommunityLayout>
        );
    }

    if (isDetailRoute && !selectedCommunity) {
        return (
            <CommunityLayout activeNav={communityNav} navbarMode="title" title="Community">
                <p className="community-page__not-found">Community not found.</p>
            </CommunityLayout>
        );
    }

    return (
        <CommunityLayout
            activeNav={communityNav}
            navbarMode="title"
            title={showBackButton ? '' : 'Community'}
            showBack={showBackButton}
            onBack={handleBack}
        >
            {isBrowseRoot ? (
                <section className="community-page__section">
                    {loadingCategories ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                            <Loader />
                        </div>
                    ) : categoriesError ? (
                        <p style={{ color: '#ff6b6b', padding: '40px 0', textAlign: 'center' }}>{categoriesError}</p>
                    ) : (
                        <div className="community-page__category-grid">
                            {categories.length > 0 ? (
                                categories.map((categoryItem, index) => (
                                    <CategoryBentoCard key={`${categoryItem.category_id || categoryItem.id}-${index}`} category={categoryItem} />
                                ))
                            ) : (
                                <p style={{ color: '#a5abb9', padding: '40px 0' }}>No categories available.</p>
                            )}
                        </div>
                    )}
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

                    <div className="community-grid">
                        {filteredCommunities.map((community) => (
                            <CommunityListCard
                                key={community.id}
                                community={community}
                                actionLabel="Explore"
                                navContext="browse"
                                categoryName={selectedCategoryLabel}
                            />
                        ))}
                    </div>
                </section>
            ) : null}

            {isMyCommunityList ? (
                <section className="community-page__section">
                    <div className="community-grid">
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
                        currentUser={user}
                        isJoined={isJoined}
                        showHeaderMenu={showHeaderMenu}
                        onToggleMenu={() => setShowHeaderMenu((prev) => !prev)}
                        onCopyLink={handleCopyLink}
                        isCopied={isCopied}
                        onReport={handleReport}
                        onEdit={handleEditCommunity}
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
                                        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                                            <Loader />
                                        </div>
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
                                    getImageUrl={getImageUrl}
                                />
                            ) : null}

                            {activeTab === 'about' ? (
                                <CommunityAboutPanel
                                    community={selectedCommunity}
                                    isCreator={user && selectedCommunity?.user_id && user.user_id === selectedCommunity.user_id}
                                    getImageUrl={getImageUrl}
                                    onEditRules={() => setIsEditRulesModalOpen(true)}
                                />
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
                            community={selectedCommunity || fullCommunityData}
                        />
                    ) : null}
                </section>
            ) : null}

            <CreateCommunityModal
                open={showCreateCommunityModal}
                onCancel={() => setShowCreateCommunityModal(false)}
                onCreate={handleCreateCommunity}
                categories={categories}
                defaultCategoryId={categorySlug ? categories.find(c => c.slug === categorySlug)?.category_id : null}
            />

            {/* Edit Community Modal */}
            <CreateCommunityModal
                open={editModalOpen}
                onCancel={() => {
                    setEditModalOpen(false);
                    setEditingCommunity(null);
                }}
                onCreate={handleEditSubmit}
                categories={categories}
                communityData={editingCommunity}
            />

            {/* Edit Rules Modal */}
            <EditRulesModal
                open={isEditRulesModalOpen}
                onCancel={() => setIsEditRulesModalOpen(false)}
                onSave={handleSaveRules}
                rules={fullCommunityData?.rules || selectedCommunity?.rules || []}
            />
        </CommunityLayout>
    );
}
