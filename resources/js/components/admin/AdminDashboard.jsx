/**
 * components/admin/AdminDashboard.jsx
 * Admin dashboard landing page.
 * - Fetches stats from api.get('/admin/stats')
 * - Displays grid of summary cards (Total Users, Active Posts, Pending Reports, etc.)
 * - Shows last update timestamp
 */
import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import StatCard from './StatCard';
import UserAvatar from '../common/UserAvatar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../../../sass/components/admin/AdminDashboard.scss';

export default function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState({ metrics: {}, topPosts: [], chartData: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    /**
     * Fetch admin statistics from backend
     */
    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/dashboard');
            if (response.data) {
                setDashboardData({
                    metrics: response.data.metrics || {},
                    topPosts: response.data.topPosts || [],
                    chartData: response.data.chartData || []
                });
                setLastUpdated(new Date(response.data.metrics?.timestamp || Date.now()));
            }
        } catch (err) {
            console.error('Failed to fetch admin dashboard data:', err);
            setError('Failed to load dashboard statistics. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch stats on component mount
    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Handle manual refresh
    const handleRefresh = () => {
        fetchStats();
    };

    // Format timestamp for display
    const formatTimestamp = (date) => {
        if (!date) return '';
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(date);
    };

    return (
        <div className="admin-dashboard__container">
            {/* Header Section */}
            <div className="admin-dashboard__header">
                <div className="admin-dashboard__header-text">
                    <p className="admin-dashboard__subheading">
                        Monitor key metrics and platform health
                    </p>
                </div>

                {/* Refresh Button */}
                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading}
                    className="admin-dashboard__refresh-btn"
                    aria-label="Refresh statistics"
                >
                    <span className="material-symbols-outlined">refresh</span>
                </button>
            </div>

            {/* Error State */}
            {error && (
                <div className="admin-dashboard__error">
                    <span className="material-symbols-outlined admin-dashboard__error-icon">
                        error
                    </span>
                    <p className="admin-dashboard__error-text">{error}</p>
                </div>
            )}

            {/* Skeleton loading state */}
            {loading ? (
                <>
                    {/* Stat card skeletons */}
                    <div className="admin-dashboard__grid">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse rounded-xl h-32"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                            >
                                <div className="p-5 h-full flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div className="h-3 rounded w-1/3" style={{ background: 'rgba(255,255,255,0.09)' }} />
                                        <div className="w-8 h-8 rounded-lg" style={{ background: 'rgba(255,255,255,0.09)' }} />
                                    </div>
                                    <div className="h-8 rounded w-1/2" style={{ background: 'rgba(255,255,255,0.09)' }} />
                                    <div className="h-3 rounded w-2/5" style={{ background: 'rgba(255,255,255,0.06)' }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick action skeletons */}
                    <div className="admin-dashboard__quick-actions">
                        <div className="h-4 rounded w-28 mb-4 animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
                        <div className="admin-dashboard__actions-grid">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="animate-pulse rounded-xl h-24"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                                />
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="admin-dashboard__grid">
                        {/* Total Users */}
                        <StatCard
                            label="Total Users"
                            value={dashboardData.metrics?.total_users || '0'}
                            icon="people"
                            subtitle="Registered users"
                            variant="default"
                        />

                        {/* Total Posts */}
                        <StatCard
                            label="Active Posts"
                            value={dashboardData.metrics?.total_posts || '0'}
                            icon="article"
                            subtitle="Published posts"
                            variant="success"
                        />

                        {/* Total Communities */}
                        <StatCard
                            label="Communities"
                            value={dashboardData.metrics?.total_communities || '0'}
                            icon="groups"
                            subtitle="Active communities"
                            variant="default"
                        />

                    </div>

                    {/* Engagement Overview Chart */}
                    <div className="admin-dashboard__section">
                        <h3 className="admin-dashboard__section-title">Engagement Overview</h3>
                        <div className="h-80 w-full mt-4" style={{ height: '320px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={dashboardData.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                                    <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} allowDecimals={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }} />
                                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                    <Line type="monotone" dataKey="engagements" name="Total Engagements" stroke="#8B5CF6" strokeWidth={3} activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey="posts" name="New Posts" stroke="#10B981" strokeWidth={3} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Performing Posts */}
                    <div className="admin-dashboard__section">
                        <h3 className="admin-dashboard__section-title">Top Performing Posts</h3>
                        <div className="admin-dashboard__table-wrapper">
                            <table className="admin-dashboard__table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Post Content</th>
                                        <th>Likes</th>
                                        <th>Comments</th>
                                        <th>Total Engagement</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData.topPosts?.length > 0 ? (
                                        dashboardData.topPosts.map((post, index) => (
                                            <tr key={post.post_id}>
                                                <td>
                                                    <span className="admin-dashboard__rank-badge">#{index + 1}</span>
                                                </td>
                                                <td>
                                                    <div className="admin-dashboard__post-cell">
                                                        <UserAvatar user={post.user} size="sm" />
                                                        <div className="admin-dashboard__post-snippet">
                                                            <span className="admin-dashboard__post-author">@{post.user?.username}</span>
                                                            <span className="admin-dashboard__post-text">{post.content?.substring(0, 50)}{post.content?.length > 50 ? '...' : ''}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{post.likes_count}</td>
                                                <td>{post.comments_count}</td>
                                                <td>
                                                    <span className="admin-dashboard__engagement-badge">
                                                        {post.total_engagement}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No posts available</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Last Updated */}
                    <div className="admin-dashboard__footer">
                        <p className="admin-dashboard__last-updated">
                            Last updated: {formatTimestamp(lastUpdated)}
                        </p>
                    </div>

                    {/* Quick Actions Section (Optional) */}
                    <div className="admin-dashboard__quick-actions">
                        <h3 className="admin-dashboard__actions-title">Quick Actions</h3>
                        <div className="admin-dashboard__actions-grid">
                            <a href="/admin/users" className="admin-dashboard__action-card">
                                <span className="material-symbols-outlined admin-dashboard__action-icon">group</span>
                                <span className="admin-dashboard__action-label">Manage Users</span>
                            </a>
                            <a href="/admin/moderation" className="admin-dashboard__action-card">
                                <span className="material-symbols-outlined admin-dashboard__action-icon">
                                    flag
                                </span>
                                <span className="admin-dashboard__action-label">View Reports</span>
                            </a>
                            <a href="/admin/settings" className="admin-dashboard__action-card">
                                <span className="material-symbols-outlined admin-dashboard__action-icon">
                                    tune
                                </span>
                                <span className="admin-dashboard__action-label">System Settings</span>
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
