/**
 * components/common/SearchBar.jsx
 * Search input with autocomplete suggestions
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import searchService from '../../services/searchService';

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
                const data = await searchService.getSuggestions(query);
                setSuggestions(data.suggestions);
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
        <div className="relative w-full max-w-md">
            <form onSubmit={handleSearch} className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim().length >= 2 && setShowSuggestions(true)}
                    placeholder="Search..."
                    className="w-full px-4 py-2 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                    style={{
                        backgroundColor: '#21232c',
                        borderColor: '#323848',
                        border: '1px solid #323848'
                    }}
                />
                <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </form>

            {/* Autocomplete Suggestions Dropdown */}
            {showSuggestions && suggestions && (
                <div
                    ref={suggestionsRef}
                    className="absolute top-full mt-1 w-full rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
                    style={{ backgroundColor: '#1b1c24', border: '1px solid #323848' }}
                >
                    {/* Posts Suggestions */}
                    {suggestions.posts?.length > 0 && (
                        <div>
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase" style={{ backgroundColor: '#121318' }}>Posts</div>
                            {suggestions.posts.slice(0, 3).map((post) => (
                                <button
                                    key={post.post_id}
                                    onClick={() => handleSuggestionClick(post.title || post.content?.substring(0, 50))}
                                    className="w-full text-left px-4 py-2 hover:bg-opacity-80 text-gray-300 transition border-b"
                                    style={{
                                        backgroundColor: 'transparent',
                                        borderBottomColor: '#323848',
                                        color: '#d4d8e6'
                                    }}
                                >
                                    <div className="text-sm font-medium">{(post.title || post.content?.substring(0, 50))}</div>
                                    <div className="text-xs text-gray-500">{post.author?.username}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Communities Suggestions */}
                    {suggestions.communities?.length > 0 && (
                        <div>
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase" style={{ backgroundColor: '#121318' }}>Communities</div>
                            {suggestions.communities.slice(0, 3).map((community) => (
                                <button
                                    key={community.community_id}
                                    onClick={() => handleSuggestionClick(community.name)}
                                    className="w-full text-left px-4 py-2 hover:bg-opacity-80 text-gray-300 transition border-b"
                                    style={{
                                        backgroundColor: 'transparent',
                                        borderBottomColor: '#323848',
                                        color: '#d4d8e6'
                                    }}
                                >
                                    <div className="text-sm font-medium">{community.name}</div>
                                    <div className="text-xs text-gray-500">{community.members_count} members</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Users Suggestions */}
                    {suggestions.users?.length > 0 && (
                        <div>
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase" style={{ backgroundColor: '#121318' }}>Users</div>
                            {suggestions.users.slice(0, 3).map((user) => (
                                <button
                                    key={user.user_id}
                                    onClick={() => handleSuggestionClick(user.username)}
                                    className="w-full text-left px-4 py-2 hover:bg-opacity-80 text-gray-300 transition border-b"
                                    style={{
                                        backgroundColor: 'transparent',
                                        borderBottomColor: '#323848',
                                        color: '#d4d8e6'
                                    }}
                                >
                                    <div className="text-sm font-medium">@{user.username}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {!suggestions.posts?.length && !suggestions.communities?.length && !suggestions.users?.length && (
                        <div className="px-4 py-3 text-center text-gray-400 text-sm">No suggestions found</div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="px-4 py-3 text-center text-gray-400 text-sm">Searching...</div>
                    )}

                    {/* View All Results */}
                    {(suggestions.posts?.length > 0 || suggestions.communities?.length > 0 || suggestions.users?.length > 0) && (
                        <button
                            onClick={() => {
                                setShowSuggestions(false);
                                handleSearch({ preventDefault: () => {} });
                            }}
                            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium text-center transition"
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
