import '../css/app.css';
import '../sass/app.scss';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/layout/ErrorBoundary';
import ProtectedRoute from './components/layout/ProtectedRoute';
import CommunityPage from './pages/CommunityPage';
import MyCommunityPage from './pages/MyCommunityPage';
import ForgotPassword from './pages/ForgotPassword';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import JournalPage from './pages/JournalPage';
import ProfilePage from './pages/ProfilePage';
import ProfilePostsPage from './components/profile/ProfilePosts';
import SettingsPage from './pages/SettingsPage';
import SignUp from './pages/SignUp';
import SearchPage from './pages/SearchPage';

const rootElement = document.getElementById('root');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <ErrorBoundary>
                <AuthProvider>
                    <BrowserRouter>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<SignUp />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />

                            {/* Protected routes — require authentication */}
                            <Route path="/" element={<ProtectedRoute><Navigate to="/home" replace /></ProtectedRoute>} />
                            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                            <Route path="/community" element={<ProtectedRoute><Navigate to="/community/browse" replace /></ProtectedRoute>} />
                            <Route path="/community/browse" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
                            <Route path="/community/browse/:categorySlug" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
                            <Route path="/community/browse/:categorySlug/:communityId" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
                            <Route path="/community/my-community" element={<ProtectedRoute><Navigate to="/community/my-community/created" replace /></ProtectedRoute>} />
                            <Route path="/community/my-community/:tab" element={<ProtectedRoute><MyCommunityPage /></ProtectedRoute>} />
                            <Route path="/community/my-community/created/:categorySlug/:communityId" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
                            <Route path="/community/my-community/joined/:categorySlug/:communityId" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
                            <Route path="/journal" element={<ProtectedRoute><Navigate to="/journal/private" replace /></ProtectedRoute>} />
                            <Route path="/journal/:tab" element={<ProtectedRoute><JournalPage /></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                            <Route path="/profile/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                            <Route path="/profile/posts" element={<ProtectedRoute><ProfilePostsPage /></ProtectedRoute>} />
                            <Route path="/settings" element={<ProtectedRoute><Navigate to="/settings/account" replace /></ProtectedRoute>} />
                            <Route path="/settings/:tab" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                            <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </ErrorBoundary>
        </React.StrictMode>
    );
}