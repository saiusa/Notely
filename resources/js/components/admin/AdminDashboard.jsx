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
import '../../../sass/components/admin/AdminDashboard.scss';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
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
            const response = await api.get('/admin/stats');
            if (response.data) {
                setStats(response.data.stats);
                setLastUpdated(new Date(response.data.stats.timestamp));
            }
        } catch (err) {
            console.error('Failed to fetch admin stats:', err);
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
            {loading && !stats ? (
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
                            value={stats?.total_users || '0'}
                            icon="people"
                            subtitle="Registered users"
                            variant="default"
                        />

                        {/* Total Posts */}
                        <StatCard
                            label="Active Posts"
                            value={stats?.total_posts || '0'}
                            icon="article"
                            subtitle="Published posts"
                            variant="success"
                        />

                        {/* Total Communities */}
                        <StatCard
                            label="Communities"
                            value={stats?.total_communities || '0'}
                            icon="groups"
                            subtitle="Active communities"
                            variant="default"
                        />

                        {/* Placeholder for future metrics */}
                        <StatCard
                            label="System Health"
                            value="Healthy"
                            icon="check_circle"
                            subtitle="All systems operational"
                            variant="success"
                        />
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
