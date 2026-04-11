import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomDropdown from '../components/common/CustomDropdown';
import CommunityListCard from '../components/community/CommunityListCard';
import CommunityLayout from '../components/layout/CommunityLayout';
import Loader from '../components/common/Loader';
import communityService from '../services/communityService';
import '../../sass/pages/MyCommunityPage.scss';

export default function MyCommunityPage() {
    const { tab } = useParams();
    const navigate = useNavigate();
    
    // Default to 'created' if tab is undefined
    const activeTab = tab || 'created';
    
    const [categories, setCategories] = useState([]);
    const [myCommunities, setMyCommunities] = useState({
        created: [],
        joined: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [typeFilter, setTypeFilter] = useState(activeTab);
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await communityService.getCategories();
                setCategories(data || []);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            }
        };

        fetchCategories();
    }, []);

    // Fetch user's communities
    useEffect(() => {
        const fetchMyCommunities = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await communityService.getMyCommunities();
                setMyCommunities(response || { created: [], joined: [] });
            } catch (err) {
                setError(err.message || 'Failed to load communities');
                console.error('Failed to fetch my communities:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMyCommunities();
    }, []);

    // Type filter options
    const typeOptions = useMemo(() => [
        { value: 'created', label: 'Created Communities' },
        { value: 'joined', label: 'Joined Communities' },
    ], []);

    // Category filter options
    const categoryOptions = useMemo(() => [
        { value: 'all', label: 'All Categories' },
        ...categories.map(cat => ({
            value: cat.category_id,
            label: cat.name,
        })),
    ], [categories]);

    // Get trigger text for Category dropdown
    const getCategoryTriggerText = useCallback(() => {
        if (categoryFilter === 'all') return 'Category';
        const category = categories.find(cat => cat.category_id === parseInt(categoryFilter));
        return category?.name || 'Category';
    }, [categoryFilter, categories]);

    // Filter communities based on selected filters
    const filteredCommunities = useMemo(() => {
        const communities = activeTab === 'created' ? myCommunities.created : myCommunities.joined;

        if (categoryFilter === 'all') {
            return communities;
        }

        return communities.filter(community => {
            const categoryId = typeof categoryFilter === 'string' 
                ? parseInt(categoryFilter) 
                : categoryFilter;
            return community.category_id === categoryId;
        });
    }, [activeTab, categoryFilter, myCommunities]);

    // Get the display label for current filters
    const getFilterLabel = () => {
        const typeLabel = activeTab === 'created' ? 'Created' : 'Joined';
        if (categoryFilter === 'all') {
            return `${typeLabel} Communities`;
        }
        const category = categories.find(cat => cat.category_id === parseInt(categoryFilter));
        return `${category?.name} - ${typeLabel}`;
    };

    return (
        <CommunityLayout>
            <div className="my-community-page__container">
                <div className="my-community-page__toolbar">
                    <div className="my-community-page__type-tabs">
                        {typeOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => navigate(`/community/my-community/${option.value}`)}
                                className={`my-community-page__type-tab ${
                                    activeTab === option.value ? 'my-community-page__type-tab--active' : ''
                                }`}
                            >
                                {option.label.split(' ')[0]}
                            </button>
                        ))}
                    </div>
                    <div className="my-community-page__category-filter">
                        <CustomDropdown
                            trigger={getCategoryTriggerText()}
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                            options={categoryOptions}
                        />
                    </div>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="my-community-page__loader-container">
                        <Loader />
                    </div>
                ) : error ? (
                    <div className="my-community-page__error">
                        <svg className="my-community-page__error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
                            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
                        </svg>
                        <p>{error}</p>
                    </div>
                ) : filteredCommunities.length === 0 ? (
                    <div className="my-community-page__empty">
                        <svg className="my-community-page__empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="none" stroke="currentColor" strokeWidth="1"/>
                        </svg>
                        <p className="my-community-page__empty-text">No {typeFilter === 'created' ? 'created' : 'joined'} communities found.</p>
                        <p className="my-community-page__empty-subtext">Try adjusting your filters or create a new community</p>
                    </div>
                ) : (
                    <section className="my-community-page__section">
                        <div className="my-community-page__section-header">
                            <h2 className="my-community-page__section-title">{getFilterLabel()}</h2>
                            <span className="my-community-page__count">{filteredCommunities.length} {filteredCommunities.length === 1 ? 'community' : 'communities'}</span>
                        </div>

                        <div className="my-community-page__grid">
                            {filteredCommunities.map((community) => {
                                const category = categories.find(c => c.category_id === community.category_id);
                                const categoryName = category?.name || '';
                                
                                return (
                                    <CommunityListCard
                                        key={community.community_id}
                                        community={{
                                            id: String(community.community_id),
                                            name: community.name,
                                            description: community.description || '',
                                            members: String(community.community_members_count || 0),
                                            memberCount: community.community_members_count || 0,
                                            cardImage: community.image || '',
                                        }}
                                        actionLabel={activeTab === 'created' ? 'Manage' : 'View'}
                                        navContext={activeTab}
                                        categoryName={categoryName}
                                    />
                                );
                            })}
                        </div>
                    </section>
                )}
            </div>
        </CommunityLayout>
    );
}
