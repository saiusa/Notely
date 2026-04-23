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
                    className="search-bar__suggestions"
                >
                    {/* Posts Suggestions */}
                    {suggestions.posts?.length > 0 && (
                        <div>
                            <div className="search-bar__suggestions-header">Posts</div>
                            {suggestions.posts.slice(0, 3).map((post) => (
                                <button
                                    key={post.post_id}
                                    onClick={() => handleSuggestionClick(post.title || post.content?.substring(0, 50))}
                                    className="search-bar__suggestion-item"
                                >
                                    <div className="search-bar__suggestion-title">{(post.title || post.content?.substring(0, 50))}</div>
                                    <div className="search-bar__suggestion-meta">{post.author?.username}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Communities Suggestions */}
                    {suggestions.communities?.length > 0 && (
                        <div>
                            <div className="search-bar__suggestions-header">Communities</div>
                            {suggestions.communities.slice(0, 3).map((community) => (
                                <button
                                    key={community.community_id}
                                    onClick={() => handleSuggestionClick(community.name)}
                                    className="search-bar__suggestion-item"
                                >
                                    <div className="search-bar__suggestion-title">{community.name}</div>
                                    <div className="search-bar__suggestion-meta">{community.members_count} members</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Users Suggestions */}
                    {suggestions.users?.length > 0 && (
                        <div>
                            <div className="search-bar__suggestions-header">Users</div>
                            {suggestions.users.slice(0, 3).map((user) => (
                                <button
                                    key={user.user_id}
                                    onClick={() => handleSuggestionClick(user.username)}
                                    className="search-bar__suggestion-item"
                                >
                                    <div className="search-bar__suggestion-title">@{user.username}</div>
                                    <div className="search-bar__suggestion-meta">{user.email}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {!suggestions.posts?.length && !suggestions.communities?.length && !suggestions.users?.length && (
                        <div className="search-bar__suggestion-item" style={{padding: '12px 16px', textAlign: 'center', borderBottom: 'none'}}>
                            <span style={{color: '#757575', fontSize: '13px'}}>No suggestions found</span>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className="search-bar__suggestion-item" style={{padding: '12px 16px', textAlign: 'center', borderBottom: 'none'}}>
                            <span style={{color: '#757575', fontSize: '13px'}}>Searching...</span>
                        </div>
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
