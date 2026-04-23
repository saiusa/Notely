/**
 * components/admin/AdminUsers.jsx
 * Admin Users Management Page
 * Displays paginated list of users with ability to suspend/activate
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../../../sass/components/admin/AdminUsers.scss';

export default function AdminUsers() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [actionLoading, setActionLoading] = useState(null);
    const [search, setSearch] = useState('');

    // Fetch users from API
    const fetchUsers = useCallback(async (page = 1) => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(`/admin/users?page=${page}`);
            if (response.data && response.data.success) {
                setUsers(response.data.data);
                setPagination(response.data.pagination);
                setCurrentPage(page);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to fetch users. Please try again.';
            setError(msg);
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load users on component mount
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Toggle user status (suspend/activate)
    const handleToggleStatus = useCallback(async (userId) => {
        setActionLoading(userId);
        try {
            const response = await api.patch(`/admin/users/${userId}/toggle-status`);
            if (response.data && response.data.success) {
                // Update the user in the list
                setUsers(prevUsers =>
                    prevUsers.map(u =>
                        u.user_id === userId
                            ? { ...u, is_suspended: response.data.user.is_suspended }
                            : u
                    )
                );
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update user status.';
            setError(msg);
            console.error('Error toggling user status:', err);
        } finally {
            setActionLoading(null);
        }
    }, []);

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Handle pagination
    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.last_page) {
            fetchUsers(page);
        }
    };

    // Client-side search filter
    const filteredUsers = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return users;
        return users.filter(u =>
            u.username?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q)
        );
    }, [users, search]);

    if (loading && users.length === 0) {
        return (
            <div className="admin-section__container">
                {/* Search bar skeleton */}
                <div className="animate-pulse h-10 rounded-lg mb-5"
                    style={{ background: 'rgba(255,255,255,0.06)', maxWidth: 360 }} />
                <div className="admin-users__table-wrapper">
                    <table className="admin-users__table">
                        <thead><tr>
                            {['User','Email','Role','Joined','Status','Actions'].map(h => <th key={h}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {[...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="user-cell">
                                        <div className="user-info">
                                            <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.08)', flexShrink:0 }} />
                                            <div style={{ height:12, width:'60%', borderRadius:4, background:'rgba(255,255,255,0.08)' }} />
                                        </div>
                                    </td>
                                    {[...Array(5)].map((_, j) => (
                                        <td key={j}><div style={{ height:12, width: j===4?'40%':'70%', borderRadius:4, background:'rgba(255,255,255,0.07)' }} /></td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-section__container">
            <div className="admin-users__header">
                <p className="admin-users__subtitle">
                    Total Users: <strong>{pagination.total ?? '—'}</strong>
                    {search && filteredUsers.length !== users.length && (
                        <span style={{ color: '#8a8e99', marginLeft: 8 }}>
                            · {filteredUsers.length} match{filteredUsers.length !== 1 ? 'es' : ''}
                        </span>
                    )}
                </p>
            </div>

            {error && <div className="admin-users__error"><p>{error}</p></div>}

            {/* Search bar — reusing AdminModeration's search styles */}
            <div className="admin-moderation__search-wrap" style={{ marginBottom: 20 }}>
                <span className="material-symbols-outlined admin-moderation__search-icon">search</span>
                <input
                    type="text"
                    className="admin-moderation__search"
                    placeholder="Search users by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    aria-label="Search users"
                />
                {search && (
                    <button className="admin-moderation__search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                    </button>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="admin-users__table-wrapper">
                <table className="admin-users__table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Joined Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(u => (
                                <tr key={u.user_id} className={u.is_suspended ? 'suspended' : ''}>
                                    <td className="user-cell">
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {u.username.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="user-username">{u.username}</span>
                                        </div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`role-badge ${u.is_admin ? 'admin' : 'user'}`}>
                                            {u.is_admin ? 'Admin' : 'User'}
                                        </span>
                                    </td>
                                    <td>{formatDate(u.created_at)}</td>
                                    <td>
                                        <span className={`status-badge ${u.is_suspended ? 'suspended' : 'active'}`}>
                                            {u.is_suspended ? 'Suspended' : 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={`status-action-btn ${u.is_suspended ? 'activate' : 'suspend'}`}
                                            onClick={() => handleToggleStatus(u.user_id)}
                                            disabled={
                                                actionLoading === u.user_id ||
                                                u.user_id === currentUser?.user_id // Disable for current user
                                            }
                                            title={
                                                u.user_id === currentUser?.user_id
                                                    ? 'Cannot modify your own account'
                                                    : u.is_suspended
                                                    ? 'Activate this user'
                                                    : 'Suspend this user'
                                            }
                                        >
                                            {actionLoading === u.user_id ? (
                                                <span className="btn-spinner"></span>
                                            ) : u.is_suspended ? (
                                                'Activate'
                                            ) : (
                                                'Suspend'
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                    No users found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.last_page > 1 && (
                <div className="admin-users__pagination">
                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                    >
                        ← Previous
                    </button>

                    <div className="pagination-info">
                        Page <strong>{currentPage}</strong> of <strong>{pagination.last_page}</strong>
                        {pagination.from && pagination.to && (
                            <span>
                                {' '}
                                (Showing {pagination.from}-{pagination.to})
                            </span>
                        )}
                    </div>

                    <button
                        className="pagination-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.last_page || loading}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
