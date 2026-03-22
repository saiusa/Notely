import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sidebarUser } from '../../utils/socialMockData';
import NotelyLogo from './Notely-Logo.svg';

const navItems = [
  { key: 'home', label: 'Home', icon: 'home', to: '/home' },
  { key: 'community', label: 'Community', icon: 'groups', to: '/community' },
  { key: 'journal', label: 'Journal', icon: 'book_2', to: '/journal' },
  { key: 'profile', label: 'Profile', icon: 'person', to: '/profile' },
  { key: 'settings', label: 'Settings', icon: 'settings', to: '/settings' },
];

export default function Sidebar({ active = 'home', onActiveChange = () => {} }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(active.startsWith('community'));

  
  useEffect(() => {
    if (active.startsWith('community')) {
      setCommunityOpen(true);
    }
  }, [active]);

  return (
    <aside className="sticky top-0 flex h-screen w-[260px] flex-col border-r border-[#323848] bg-[#1B1C24] px-5 py-5">
      
      {/* Logo */}
      <div className="mb-10 mt-5 flex justify-center">
        <img src={NotelyLogo} alt="Notely" className="h-[32px] w-auto" />
      </div>

      <nav className="space-y-2">
        
        {/* Home */}
        <Link
          to="/home"
          onClick={() => onActiveChange('home')}
          className={`flex h-[40px] items-center gap-2.5 rounded-[9px] px-3 text-[13px] font-medium transition-colors ${
            active === 'home'
              ? 'bg-[#343b4f] text-white'
              : 'text-white hover:bg-[#23283a]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          Home
        </Link>

        {/* Community */}
        <button
          type="button"
          onClick={() => setCommunityOpen(!communityOpen)}
          className={`flex h-[40px] w-full items-center justify-between rounded-[9px] px-3 text-[13px] font-medium transition-colors ${
            active.startsWith('community-browse') || active.startsWith('community-my')
              ? 'bg-[#343b4f] text-white'
              : 'text-white hover:bg-[#23283a]'
          }`}
        >
          <span className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[18px]">groups</span>
            Community
          </span>
          <span
            className={`material-symbols-outlined text-[18px] transition-transform ${
              communityOpen ? 'rotate-90' : ''
            }`}
          >
            chevron_right
          </span>
        </button>

        {/* Community Dropdown */}
        {communityOpen && (
          <div className="space-y-1">
            <button
              onClick={() => onActiveChange('community-browse')}
              className={`h-[40px] w-full rounded-[9px] px-6 text-left text-[13px] transition-colors ${
                active === 'community-browse'
                  ? 'bg-[#343b4f] text-white'
                  : 'text-[#d1d3dc] hover:bg-[#23283a]'
              }`}
            >
              Browse
            </button>

            <button
              onClick={() => onActiveChange('community-my')}
              className={`h-[40px] w-full rounded-[9px] px-6 text-left text-[13px] transition-colors ${
                active === 'community-my'
                  ? 'bg-[#343b4f] text-white'
                  : 'text-[#d1d3dc] hover:bg-[#23283a]'
              }`}
            >
              My Community
            </button>
          </div>
        )}

        {/* Journal */}
        <Link
          to="/journal"
          onClick={() => onActiveChange('journal')}
          className={`flex h-[40px] items-center gap-2.5 rounded-[9px] px-3 text-[13px] font-medium transition-colors ${
            active === 'journal'
              ? 'bg-[#343b4f] text-white'
              : 'text-white hover:bg-[#23283a]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">book_2</span>
          Journal
        </Link>

        <div className="my-6 border-t border-[#2b3041]" />

        {/* Profile */}
        <Link
          to="/profile"
          onClick={() => onActiveChange('profile')}
          className={`flex h-[40px] items-center gap-2.5 rounded-[9px] px-3 text-[13px] font-medium transition-colors ${
            active === 'profile'
              ? 'bg-[#343b4f] text-white'
              : 'text-white hover:bg-[#23283a]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
          Profile
        </Link>

        {/* Settings */}
        <Link
          to="/settings"
          onClick={() => onActiveChange('settings')}
          className={`flex h-[40px] items-center gap-2.5 rounded-[9px] px-3 text-[13px] font-medium transition-colors ${
            active === 'settings'
              ? 'bg-[#343b4f] text-white'
              : 'text-white hover:bg-[#23283a]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">settings</span>
          Settings
        </Link>
      </nav>

      {/* Write Button */}
      <button
        type="button"
        className="mt-auto h-[40px] rounded-[9px] bg-[#785ebf] text-[14px] font-semibold text-white transition-colors hover:bg-[#8b70d4] active:bg-[#6b4fa8]"
      >
        Write
      </button>

      {/* Profile Section */}
      <div className="relative mt-6 border-t border-[#2b3041] pt-4">
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex w-full items-center justify-between rounded-[9px] px-2 py-2 hover:bg-[#23283a]"
        >
          <div className="flex items-center gap-3">
            <img
              src={sidebarUser.avatar}
              alt={sidebarUser.name}
              className="h-[40px] w-[40px] rounded-full object-cover"
            />
            <div>
              <p className="text-[13px] font-semibold text-white">
                {sidebarUser.name}
              </p>
              <p className="text-[12px] text-[#8a8a8a]">
                {sidebarUser.username}
              </p>
            </div>
          </div>

          <span
            className={`material-symbols-outlined text-[18px] text-white transition-transform ${
              menuOpen ? 'rotate-90' : ''
            }`}
          >
            chevron_right
          </span>
        </button>

        {menuOpen && (
          <div className="absolute bottom-[80px] left-0 right-0 z-50 rounded-[10px] border border-[#323848] bg-[#1f2332] p-2 text-[13px] shadow-xl">
            <button className="flex h-8 w-full items-center gap-2 rounded px-3 text-white hover:bg-[#2a3043]">
              <span className="material-symbols-outlined text-[16px]">
                person
              </span>
              View Profile
            </button>

            <button className="flex h-8 w-full items-center gap-2 rounded px-3 text-white hover:bg-[#2a3043]">
              <span className="material-symbols-outlined text-[16px]">
                logout
              </span>
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}