/**
 * pages/SearchPage.jsx
 * Full-text search page with tabs for posts, communities, and users
 * Displays search results with pagination and filtering
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import searchService from '../services/searchService';
import PostCard from '../components/posts/PostCard';
import CommunityListCard from '../components/community/CommunityListCard';
import Loader from '../components/common/Loader';

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    
    const [activeTab, setActiveTab] = useState('all'); // all|posts|communities|users
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch search results
    useEffect(() => {
        if (!query.trim()) {
            setResults(null);
            return;
        }

        const performSearch = async () => {
            try {
                setLoading(true);
                setError(null);
                setCurrentPage(1);

                let data;
                if (activeTab === 'all') {
                    data = await searchService.search(query);
                } else if (activeTab === 'posts') {
                    data = await searchService.searchPosts(query, currentPage);
                } else if (activeTab === 'communities') {
                    data = await searchService.searchCommunities(query, currentPage);
                } else if (activeTab === 'users') {
                    data = await searchService.searchUsers(query, currentPage);
                }

                setResults(data);
            } catch (err) {
                console.error('Search error:', err);
                setError(err.response?.data?.message || 'Search failed. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        performSearch();
    }, [query, activeTab]);

    if (!query.trim()) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <h2 className="text-2xl font-semibold text-gray-400 mb-2">Search Notely</h2>
                <p className="text-gray-500">Enter a query to find posts, communities, and users</p>
            </div>
        );
    }

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-red-400">
                {error}
            </div>
        );
    }

    const getTabCount = (type) => {
        if (!results) return 0;
        if (type === 'posts') return results.results?.posts?.data?.length || 0;
        if (type === 'communities') return results.results?.communities?.data?.length || 0;
        if (type === 'users') return results.results?.users?.data?.length || 0;
        return 0;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mg-b-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Search Results for "<span className="text-purple-400">{query}</span>"
                </h1>
                <p className="text-gray-400">
                    Found {results?.results ? Object.values(results.results).reduce((sum, cat) => sum + (cat.data?.length || 0), 0) : 0} results
                </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-700 gap-8">
                {['all', 'posts', 'communities'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 font-medium transition ${
                            activeTab === tab
                                ? 'text-purple-400 border-b-2 border-purple-400'
                                : 'text-gray-400 hover:text-gray-300'
                        }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {tab !== 'all' && <span className="ml-1 text-xs">({getTabCount(tab)})</span>}
                    </button>
                ))}
            </div>

            {/* Results */}
            <div className="space-y-4">
                {activeTab === 'all' ? (
                    <>
                        {/* Posts Section */}
                        {results?.results?.posts?.data?.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-3">Posts</h2>
                                <div className="space-y-3">
                                    {results.results.posts.data.map((post) => (
                                        <PostCard key={post.post_id} post={post} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Communities Section */}
                        {results?.results?.communities?.data?.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-3 mt-8">Communities</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {results.results.communities.data.map((community) => (
                                        <CommunityListCard key={community.community_id} community={community} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {!results?.results?.posts?.data?.length &&
                            !results?.results?.communities?.data?.length && (
                                <div className="text-center py-12 text-gray-400">
                                    No results found for "{query}"
                                </div>
                            )}
                    </>
                ) : activeTab === 'posts' ? (
                    <>
                        {results?.results?.posts?.data?.length > 0 ? (
                            <div className="space-y-3">
                                {results.results.posts.data.map((post) => (
                                    <PostCard key={post.post_id} post={post} />
                                ))}
                                {/* Pagination */}
                                {results.results.posts.last_page > 1 && (
                                    <PaginationControls
                                        current={results.results.posts.current_page}
                                        last={results.results.posts.last_page}
                                        onPageChange={setCurrentPage}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                No posts found matching "{query}"
                            </div>
                        )}
                    </>
                ) : activeTab === 'communities' ? (
                    <>
                        {results?.results?.communities?.data?.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {results.results.communities.data.map((community) => (
                                        <CommunityListCard key={community.community_id} community={community} />
                                    ))}
                                </div>
                                {/* Pagination */}
                                {results.results.communities.last_page > 1 && (
                                    <PaginationControls
                                        current={results.results.communities.current_page}
                                        last={results.results.communities.last_page}
                                        onPageChange={setCurrentPage}
                                    />
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                No communities found matching "{query}"
                            </div>
                        )}
                    </>
                ) : null}
            </div>
        </div>
    );
}

/**
 * Pagination controls component
 */
function PaginationControls({ current, last, onPageChange }) {
    return (
        <div className="flex items-center justify-center gap-2 mt-6 pb-6">
            <button
                onClick={() => onPageChange(current - 1)}
                disabled={current === 1}
                className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white"
            >
                Previous
            </button>

            <div className="text-gray-400">
                Page {current} of {last}
            </div>

            <button
                onClick={() => onPageChange(current + 1)}
                disabled={current === last}
                className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white"
            >
                Next
            </button>
        </div>
    );
}
