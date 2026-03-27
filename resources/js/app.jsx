import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import CommunityPage from './pages/CommunityPage';
import ForgotPassword from './pages/ForgotPassword';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import JournalPage from './pages/JournalPage';
import ProfilePage from './pages/ProfilePage';
import ProfilePostsPage from './components/profile/ProfilePosts';
import SettingsPage from './pages/SettingsPage';
import SignUp from './pages/SignUp';

const rootElement = document.getElementById('root');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/community" element={<Navigate to="/community/browse" replace />} />
                    <Route path="/community/browse" element={<CommunityPage />} />
                    <Route path="/community/browse/:category" element={<CommunityPage />} />
                    <Route path="/community/browse/:category/:communityId" element={<CommunityPage />} />
                    <Route path="/community/my-community" element={<CommunityPage />} />
                    <Route path="/community/my-community/:communityId" element={<CommunityPage />} />
                    <Route path="/journal" element={<JournalPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/posts" element={<ProfilePostsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                </Routes>
            </HashRouter>
        </React.StrictMode>
    );
}
