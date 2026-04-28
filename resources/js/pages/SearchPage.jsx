/**
 * pages/SearchPage.jsx
 * Full-text search page with tabs for posts, communities, and users
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import searchService from '../services/searchService';
import PostCard from '../components/posts/PostCard';
import CommunityListCard from '../components/community/CommunityListCard';
import UserAvatar from '../components/common/UserAvatar';
import Loader from '../components/common/Loader';

import SocialLayout from '../components/layout/SocialLayout';

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    
    const [activeTab, setActiveTab] = useState('all'); // all|posts|communities|people
    const [results, setResults] = useState({ users: [], communities: [], posts: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch search results
    useEffect(() => {
        if (!query.trim()) {
            setResults({ users: [], communities: [], posts: [] });
            return;
        }

        const performSearch = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch flat response from backend
                const data = await searchService.search(query);
                setResults({
                    users: data.users || [],
                    communities: data.communities || [],
                    posts: data.posts || []
                });
            } catch (err) {
                console.error('Search error:', err);
                setError('Search failed. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [query]);

    if (!query.trim()) {
        return (
            <SocialLayout navbarMode="title" title="Search" showRecentJournals={false} hideSidebar>
                <div className="search-page__container">
                    <div className="search-page__empty" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <h2 className="search-page__section-title">Search Notely</h2>
                        <p className="search-page__subtitle">Enter a query to find posts, communities, and people</p>
                    </div>
                </div>
            </SocialLayout>
        );
    }

    if (loading) {
        return (
            <SocialLayout navbarMode="title" title="Search" showRecentJournals={false} hideSidebar>
                <Loader />
            </SocialLayout>
        );
    }

    if (error) {
        return (
            <SocialLayout navbarMode="title" title="Search" showRecentJournals={false} hideSidebar>
                <div className="search-page__container">
                    <div className="search-page__error" style={{ backgroundColor: 'rgba(153, 27, 27, 0.2)', border: '1px solid #b91c1c', borderRadius: '8px', padding: '16px', color: '#f87171' }}>
                        {error}
                    </div>
                </div>
            </SocialLayout>
        );
    }

    const getTabCount = (type) => {
        if (type === 'posts') return results.posts.length;
        if (type === 'communities') return results.communities.length;
        if (type === 'people') return results.users.length;
        return 0;
    };

    const totalResults = results.posts.length + results.communities.length + results.users.length;

    const renderUsers = (usersToRender) => (
        <div className="search-page__results-grid search-page__results-grid--people">
            {usersToRender.map((user) => (
                <Link 
                    key={user.user_id} 
                    to={`/profile/${user.username}`} 
                    className="search-page__person-card"
                    style={{ textDecoration: 'none' }}
                >
                    <UserAvatar 
                        user={{
                            username: user.username,
                            first_name: user.profile?.first_name,
                            last_name: user.profile?.last_name,
                            avatar_url: user.profile?.profile_picture,
                            avatar: user.profile?.profile_picture
                        }} 
                        size="md" 
                    />
                    <div className="search-page__person-info">
                        <span className="search-page__person-name">
                            {user.profile?.first_name ? `${user.profile.first_name} ${user.profile.last_name || ''}` : `@${user.username}`}
                        </span>
                        <span className="search-page__person-username">@{user.username}</span>
                    </div>
                </Link>
            ))}
        </div>
    );

    const renderCommunities = (communitiesToRender) => (
        <div className="search-page__community-list">
            {communitiesToRender.map((community) => (
                <Link 
                    key={community.community_id} 
                    to={`/community/browse/${community.category?.slug || 'uncategorized'}/${community.community_id}`}
                    className="search-page__community-card"
                >
                    {community.image ? (
                        <img 
                            src={community.image} 
                            alt={community.name} 
                            className="search-page__community-avatar" 
                        />
                    ) : (
                        <div className="search-page__community-avatar" />
                    )}
                    <div className="search-page__community-info">
                        <span className="search-page__community-name">{community.name}</span>
                        <span className="search-page__community-meta">
                            {community.members_count || 0} members • {community.category?.name || 'Uncategorized'}
                        </span>
                    </div>
                    <div className="search-page__community-view-btn">
                        View
                    </div>
                </Link>
            ))}
        </div>
    );

    return (
        <SocialLayout navbarMode="title" title="Search" showRecentJournals={false} hideSidebar>
            <div className="search-page__container">
                {/* Header */}
                <div className="search-page__header">
                    <h1 className="search-page__title">
                        Results for "<span className="search-page__query-highlight">{query}</span>"
                    </h1>
                    <p className="search-page__subtitle">
                        Found {totalResults} results
                    </p>
                </div>

                {/* Tabs */}
                <div className="search-page__tabs">
                    {['all', 'posts', 'communities', 'people'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`search-page__tab ${activeTab === tab ? 'search-page__tab--active' : ''}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {tab !== 'all' && <span className="search-page__tab-count">({getTabCount(tab)})</span>}
                        </button>
                    ))}
                </div>

                {/* Results */}
                <div className="search-page__results search-page__results-container">
                    {activeTab === 'all' ? (
                        <>
                            {/* Posts Section */}
                            {results.posts.length > 0 && (
                                <div className="search-page__section">
                                    <h2 className="search-page__section-title">Posts</h2>
                                    <div className="search-page__results-list">
                                        {results.posts.slice(0, 3).map((post) => (
                                            <PostCard key={post.post_id} post={post} />
                                        ))}
                                    </div>
                                    {results.posts.length > 3 && (
                                        <button onClick={() => setActiveTab('posts')} className="search-page__see-all">
                                            See all {results.posts.length} posts
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Communities Section */}
                            {results.communities.length > 0 && (
                                <div className="search-page__section">
                                    <h2 className="search-page__section-title">Communities</h2>
                                    {renderCommunities(results.communities.slice(0, 3))}
                                    {results.communities.length > 3 && (
                                        <button onClick={() => setActiveTab('communities')} className="search-page__see-all">
                                            See all {results.communities.length} communities
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* People Section */}
                            {results.users.length > 0 && (
                                <div className="search-page__section">
                                    <h2 className="search-page__section-title">People</h2>
                                    {renderUsers(results.users.slice(0, 3))}
                                    {results.users.length > 3 && (
                                        <button onClick={() => setActiveTab('people')} className="search-page__see-all">
                                            See all {results.users.length} people
                                        </button>
                                    )}
                                </div>
                            )}

                            {totalResults === 0 && (
                                <div className="search-page__empty">
                                    No results found for "{query}"
                                </div>
                            )}
                        </>
                    ) : activeTab === 'posts' ? (
                        <>
                            {results.posts.length > 0 ? (
                                <div className="search-page__results-list">
                                    {results.posts.map((post) => (
                                        <PostCard key={post.post_id} post={post} />
                                    ))}
                                </div>
                            ) : (
                                <div className="search-page__empty">
                                    No posts found matching "{query}"
                                </div>
                            )}
                        </>
                    ) : activeTab === 'communities' ? (
                        <>
                            {results.communities.length > 0 ? (
                                renderCommunities(results.communities)
                            ) : (
                                <div className="search-page__empty">
                                    No communities found matching "{query}"
                                </div>
                            )}
                        </>
                    ) : activeTab === 'people' ? (
                        <>
                            {results.users.length > 0 ? (
                                renderUsers(results.users)
                            ) : (
                                <div className="search-page__empty">
                                    No people found matching "{query}"
                                </div>
                            )}
                        </>
                    ) : null}
                </div>
            </div>
        </SocialLayout>
    );
}
