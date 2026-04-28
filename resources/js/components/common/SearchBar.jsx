/**
 * components/common/SearchBar.jsx
 * Search input with autocomplete suggestions
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import searchService from '../../services/searchService';
import '../../../sass/components/common/SearchBar.scss';

export default function SearchBar() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Fetch autocomplete suggestions
    useEffect(() => {
        if (query.trim().length < 2) {
            setSuggestions(null);
            setShowSuggestions(false);
            return;
        }

        const fetchSuggestions = async () => {
            try {
                setLoading(true);
                const data = await searchService.search(query);
                setSuggestions(data); // data is { users, communities, posts }
                setShowSuggestions(true);
            } catch (err) {
                console.error('Suggestions error:', err);
                setSuggestions(null);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [query]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) && inputRef.current && !inputRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (text) => {
        setQuery(text);
        navigate(`/search?q=${encodeURIComponent(text)}`);
        setShowSuggestions(false);
    };

    return (
        <div className="search-bar">
            <form onSubmit={handleSearch} className="search-bar__form">
                <div className="search-bar__input-wrapper">
                    <span className="material-symbols-outlined search-bar__icon">search</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
                        placeholder="Search Notely"
                        className="search-bar__input"
                    />
                </div>
            </form>

            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestions && (
                <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-[#25252b] border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50"
                >
                    {/* Posts Suggestions */}
                    {suggestions.posts?.length > 0 && (
                        <div className="py-2 border-b border-gray-700/50 last:border-0">
                            <div className="px-4 py-1 text-xs text-gray-400 uppercase tracking-wider font-semibold">Posts</div>
                            {suggestions.posts.slice(0, 3).map((post) => (
                                <button
                                    key={post?.post_id || post?.id}
                                    onClick={() => handleSuggestionClick(post?.content?.substring(0, 50) || 'Post')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors flex flex-col"
                                >
                                    <div className="text-sm text-gray-200 font-medium truncate w-full">{post?.content?.substring(0, 50) || 'Untitled'}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">@{post?.user?.username || 'user'}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Communities Suggestions */}
                    {suggestions.communities?.length > 0 && (
                        <div className="py-2 border-b border-gray-700/50 last:border-0">
                            <div className="px-4 py-1 text-xs text-gray-400 uppercase tracking-wider font-semibold">Communities</div>
                            {suggestions.communities.slice(0, 3).map((community) => (
                                <button
                                    key={community?.community_id || community?.id}
                                    onClick={() => handleSuggestionClick(community?.name || 'Community')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors flex flex-col"
                                >
                                    <div className="text-sm text-gray-200 font-medium truncate w-full">{community?.name || 'Unnamed Community'}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{community?.category?.name || 'Community'}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Users Suggestions */}
                    {suggestions.users?.length > 0 && (
                        <div className="py-2 border-b border-gray-700/50 last:border-0">
                            <div className="px-4 py-1 text-xs text-gray-400 uppercase tracking-wider font-semibold">Users</div>
                            {suggestions.users.slice(0, 3).map((user) => (
                                <button
                                    key={user?.user_id || user?.id}
                                    onClick={() => handleSuggestionClick(user?.username || '')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors flex flex-col"
                                >
                                    <div className="text-sm text-gray-200 font-medium truncate w-full">@{user?.username || 'user'}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {!suggestions.posts?.length && !suggestions.communities?.length && !suggestions.users?.length && (
                        <div className="px-4 py-6 text-center">
                            <span className="text-sm text-gray-500">No suggestions found</span>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="px-4 py-6 text-center">
                            <span className="text-sm text-gray-500">Searching...</span>
                        </div>
                    )}

                    {/* View All Results */}
                    {(suggestions.posts?.length > 0 || suggestions.communities?.length > 0 || suggestions.users?.length > 0) && (
                        <button
                            onClick={() => {
                                setShowSuggestions(false);
                                handleSearch({ preventDefault: () => {} });
                            }}
                            className="w-full px-4 py-3 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 hover:text-purple-300 text-sm font-medium text-center transition-colors border-t border-gray-700/50"
                        >
                            View all results →
                        </button>
                    )}
                </div>
            )}

            {/* Loading State */}
            {loading && query.trim().length >= 2 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin text-purple-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}
